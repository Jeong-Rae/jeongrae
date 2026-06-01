import test from "node:test";
import assert from "node:assert/strict";
import { DiscordMessageText } from "../src/support/text/DiscordMessageText.ts";
import { DiscordMessageRenderer } from "../src/transport/discord/DiscordMessageRenderer.ts";
import { ConsoleLogger, redactSecrets } from "../src/telemetry/logging/ConsoleLogger.ts";
import { CodexRuntimeEventBus } from "../src/core/event/CodexRuntimeEventBus.ts";
import { SqliteConnectionFactory } from "../src/store/connection/SqliteConnectionFactory.ts";
import { MigrationRunner } from "../src/store/migration/MigrationRunner.ts";
import { SqliteCodexConversationRepository } from "../src/store/session/SqliteCodexConversationRepository.ts";
import { SqliteCodexTurnRepository } from "../src/store/thread/SqliteCodexTurnRepository.ts";
import { SqliteCodexRuntimeEventRepository } from "../src/store/event/SqliteCodexRuntimeEventRepository.ts";
import { CodexConversationController } from "../src/transport/http/CodexConversationController.ts";
import { CodexRuntimeEventSseController } from "../src/transport/sse/CodexRuntimeEventSseController.ts";
import { StaticFileController } from "../src/transport/http/StaticFileController.ts";
import { DebugHttpServer } from "../src/transport/http/DebugHttpServer.ts";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";

test("discord text helper removes bot mention and trims message", () => {
  assert.equal(
    DiscordMessageText.stripBotMention("<@123> 로그인 테스트 실패 원인 찾아줘", "123"),
    "로그인 테스트 실패 원인 찾아줘"
  );
  assert.equal(DiscordMessageText.stripBotMention("<@!123>   hello", "123"), "hello");
});

test("message renderer uses spec text and truncates long final responses", () => {
  const renderer = new DiscordMessageRenderer("http://localhost:3000");
  assert.match(renderer.renderConversationCreated("api", "default"), /Codex 세션이 생성되었습니다/);
  assert.match(renderer.renderYoloEnabled(), /현재 Codex 세션이 yolo mode로 전환되었습니다/);

  const long = "a".repeat(1900);
  const rendered = renderer.renderRunSucceeded(long, "conv-1");
  assert.ok(rendered.length <= 1800);
  assert.match(rendered, /Web Debug UI/);
});

test("runtime event bus publishes conversation events", () => {
  const bus = new CodexRuntimeEventBus();
  const received: string[] = [];
  const unsubscribe = bus.subscribe("conv-1", (event) => received.push(event.eventType));
  bus.publish({
    codexRuntimeEventId: "event-1",
    codexConversationId: "conv-1",
    codexTurnId: null,
    eventType: "codex_turn_started",
    payloadJson: "{}",
    createdAt: new Date("2026-06-01T00:00:00.000Z")
  });
  unsubscribe();

  assert.deepEqual(received, ["codex_turn_started"]);
});

test("logger redacts configured secrets before writing json", () => {
  const payload = redactSecrets(
    { message: "token discord-token and openai-key" },
    ["discord-token", "openai-key"]
  );
  assert.equal(JSON.stringify(payload).includes("discord-token"), false);
  assert.equal(JSON.stringify(payload).includes("openai-key"), false);

  const lines: string[] = [];
  const logger = new ConsoleLogger(["discord-token"], (line) => lines.push(line));
  logger.info("server started", { eventType: "server_started", token: "discord-token" });
  assert.match(lines[0] ?? "", /REDACTED/);
});

test("debug http server exposes conversation APIs and event stream", async () => {
  const dir = await mkdtemp(join(tmpdir(), "codex-http-"));
  const db = new SqliteConnectionFactory(join(dir, "store.sqlite")).create();
  new MigrationRunner(db).run();
  const conversations = new SqliteCodexConversationRepository(db);
  const turns = new SqliteCodexTurnRepository(db);
  const runtimeEvents = new SqliteCodexRuntimeEventRepository(db);
  const eventBus = new CodexRuntimeEventBus();
  const now = new Date("2026-06-01T00:00:00.000Z");

  await conversations.create({
    codexConversationId: "conv-1",
    discordGuildId: "guild-1",
    parentChannelId: "parent-1",
    conversationChannelId: "channel-1",
    workspaceKey: "api",
    workspacePath: "/tmp/api",
    codexThreadId: "codex-thread-1",
    status: "idle",
    permissionMode: "default",
    createdBy: "user-1",
    createdAt: now,
    updatedAt: now
  });
  await turns.create({
    codexTurnId: "turn-1",
    codexConversationId: "conv-1",
    requestedBy: "user-1",
    userMessage: "hello",
    status: "succeeded",
    finalResponse: "world",
    errorMessage: null,
    createdAt: now,
    startedAt: now,
    finishedAt: now
  });

  const server = new DebugHttpServer({
    port: 0,
    conversationController: new CodexConversationController({
      conversationRepository: conversations,
      turnRepository: turns,
      runtimeEventRepository: runtimeEvents
    }),
    sseController: new CodexRuntimeEventSseController(eventBus),
    staticFileController: new StaticFileController("public"),
    logger: new ConsoleLogger([], () => undefined)
  }).start();

  try {
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;
    const list = await (await fetch(`${baseUrl}/api/conversations`)).json() as { conversations: Array<{ codexConversationId: string }> };
    const detail = await (await fetch(`${baseUrl}/api/conversations/conv-1`)).json() as { conversation: { codexThreadId: string } };
    const turnList = await (await fetch(`${baseUrl}/api/conversations/conv-1/turns`)).json() as { turns: Array<{ finalResponse: string | null }> };
    const abort = new AbortController();
    const stream = await fetch(`${baseUrl}/api/conversations/conv-1/events/stream`, { signal: abort.signal });

    assert.equal(list.conversations[0]?.codexConversationId, "conv-1");
    assert.equal(detail.conversation.codexThreadId, "codex-thread-1");
    assert.equal(turnList.turns[0]?.finalResponse, "world");
    eventBus.publish({
      codexRuntimeEventId: "event-1",
      codexConversationId: "conv-1",
      codexTurnId: "turn-1",
      eventType: "codex_turn_succeeded",
      payloadJson: "{}",
      createdAt: now
    });
    const reader = stream.body?.getReader();
    const chunk = await reader?.read();
    abort.abort();
    assert.match(new TextDecoder().decode(chunk?.value), /event: codex-runtime-event/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
