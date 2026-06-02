import test from "node:test";
import assert from "node:assert/strict";
import { DiscordMessageText } from "../src/support/text/DiscordMessageText.ts";
import { buildCodexSlashCommand } from "../src/transport/discord/DiscordBot.ts";
import { DiscordMessageRenderer } from "../src/transport/discord/DiscordMessageRenderer.ts";
import { DiscordSlashCommandRouter } from "../src/transport/discord/DiscordSlashCommandRouter.ts";
import { DiscordMentionMessageRouter } from "../src/transport/discord/DiscordMentionMessageRouter.ts";
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
  assert.match(renderer.renderConversationCreated({ workspaceKey: "api", workspacePath: "/tmp/api", workspaceSource: "alias", permissionMode: "default" }), /Source: alias/);
  assert.equal(
    renderer.renderConversationCreatedReply("api", "guild-1", "thread-1"),
    "api workspace에 대한 Codex 세션을 생성했습니다.\n\nThread: https://discord.com/channels/guild-1/thread-1"
  );
  assert.match(renderer.renderYoloEnabled(), /현재 Codex 세션이 yolo mode로 전환되었습니다/);
  assert.equal(renderer.renderRunSucceeded("actual response", "conv-1"), "actual response");

  const long = "a".repeat(1900);
  const rendered = renderer.renderRunSucceeded(long, "conv-1");
  assert.ok(rendered.length <= 1800);
  assert.match(rendered, /Web Debug UI/);
});

test("message renderer formats model config, status, and validation errors", () => {
  const renderer = new DiscordMessageRenderer("http://localhost:3000");
  assert.equal(renderer.renderModelConfig({ model: null, reasoningEffort: null }), "현재 Codex model 설정\n\nModel: Codex CLI default\nEffort: Codex CLI default\n\n변경 예:\n/codex model model:gpt-5.5 effort:high\n\nEffort values: minimal, low, medium, high, xhigh");
  assert.equal(renderer.renderModelConfigUpdated({ model: "gpt-5.5", reasoningEffort: "high" }), "Codex model 설정을 변경했습니다.\n\nModel: gpt-5.5\nEffort: high\n\n다음 Codex turn부터 적용됩니다.");
  assert.equal(renderer.renderInvalidEffort(), "허용되지 않는 reasoning effort 값입니다.\n\nEffort values: minimal, low, medium, high, xhigh");
  assert.equal(renderer.renderInvalidModel(), "model 값은 비어 있을 수 없습니다.");
  assert.match(renderer.renderStatus({
    conversation: {
      codexConversationId: "conv-1",
      workspacePath: "/tmp/api",
      workspaceSource: "absolute_path",
      permissionMode: "default",
      status: "idle",
      model: null,
      reasoningEffort: null
    },
    runningTurnCount: 0,
    debugUrl: "http://localhost:3000/?conversation=conv-1"
  }), /Debug: http:\/\/localhost:3000\/\?conversation=conv-1/);
});

test("codex slash command registers model and status subcommands", () => {
  const command = buildCodexSlashCommand().toJSON() as {
    options: Array<{ name: string; options?: Array<{ name: string; choices?: Array<{ name: string; value: string }> }> }>;
  };
  assert.deepEqual(command.options.map((option) => option.name), ["new", "yolo", "model", "status"]);
  const model = command.options.find((option) => option.name === "model");
  assert.deepEqual(model?.options?.map((option) => option.name), ["model", "effort"]);
  assert.deepEqual(model?.options?.find((option) => option.name === "effort")?.choices?.map((choice) => choice.value), ["minimal", "low", "medium", "high", "xhigh"]);
});

test("slash command router handles model and status with ephemeral replies", async () => {
  const replies: unknown[] = [];
  const router = new DiscordSlashCommandRouter({
    async updateModelConfig(input: unknown) {
      assert.deepEqual(input, {
        discordGuildId: "guild-1",
        conversationChannelId: "channel-1",
        model: "gpt-5.5",
        reasoningEffort: "high"
      });
      return { status: "updated", model: "gpt-5.5", reasoningEffort: "high" };
    },
    async getStatus() {
      return {
        status: "found",
        conversation: {
          codexConversationId: "conv-1",
          workspacePath: "/tmp/api",
          workspaceSource: "alias",
          permissionMode: "default",
          status: "idle",
          model: "gpt-5.5",
          reasoningEffort: "high"
        },
        runningTurnCount: 0,
        debugUrl: "http://localhost:3000/?conversation=conv-1"
      };
    }
  } as never, new DiscordMessageRenderer("http://localhost:3000"));

  await router.handle({
    commandName: "codex",
    guildId: "guild-1",
    channelId: "channel-1",
    options: {
      getSubcommand: () => "model",
      getString: (name: string) => name === "model" ? "gpt-5.5" : "high"
    },
    reply: async (payload: unknown) => { replies.push(payload); }
  } as never);
  await router.handle({
    commandName: "codex",
    guildId: "guild-1",
    channelId: "channel-1",
    options: {
      getSubcommand: () => "status",
      getString: () => null
    },
    reply: async (payload: unknown) => { replies.push(payload); }
  } as never);

  assert.deepEqual(replies, [
    { content: "Codex model 설정을 변경했습니다.\n\nModel: gpt-5.5\nEffort: high\n\n다음 Codex turn부터 적용됩니다.", ephemeral: true },
    { content: "Codex 세션 상태\n\nWorkspace: /tmp/api\nSource: alias\nPermission: default\nStatus: idle\nRunning turns: 0\nModel: gpt-5.5\nEffort: high\n\nDebug: http://localhost:3000/?conversation=conv-1", ephemeral: true }
  ]);
});

test("mention router edits loading message to final Codex response", async () => {
  const sent: string[] = [];
  const edits: string[] = [];
  const router = new DiscordMentionMessageRouter({
    async run() {
      return {
        status: "succeeded",
        codexConversationId: "conv-1",
        codexTurnId: "turn-1",
        finalResponse: "actual response"
      };
    }
  } as never, new DiscordMessageRenderer("http://localhost:3000"));

  await router.handle({
    author: { bot: false, id: "user-1" },
    client: { user: { id: "bot-1" } },
    mentions: { users: { has: (id: string) => id === "bot-1" } },
    channel: {
      isSendable: () => true,
      send: async (content: string) => {
        sent.push(content);
        return { edit: async (updated: string) => { edits.push(updated); } };
      }
    },
    content: "<@bot-1> do it",
    guildId: "guild-1",
    channelId: "channel-1"
  } as never);

  assert.deepEqual(sent, ["Codex 작업을 시작했습니다."]);
  assert.deepEqual(edits, ["actual response"]);
});

test("runtime event bus publishes conversation events", () => {
  const bus = new CodexRuntimeEventBus();
  const received: string[] = [];
  const unsubscribe = bus.subscribe("conv-1", (event) => received.push(event.eventType));
  bus.publish({
    codexRuntimeEventId: "event-1",
    codexConversationId: "conv-1",
    codexTurnId: "turn-1",
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
    workspaceSource: "alias",
    codexThreadId: "codex-thread-1",
    status: "idle",
    permissionMode: "default",
    model: "gpt-5.5",
    reasoningEffort: "high",
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
    const list = await (await fetch(`${baseUrl}/api/conversations`)).json() as { conversations: Array<{ codexConversationId: string; model: string | null; reasoningEffort: string | null }> };
    const detail = await (await fetch(`${baseUrl}/api/conversations/conv-1`)).json() as { conversation: { codexThreadId: string; runningTurnCount: number; workspaceSource: string; model: string | null; reasoningEffort: string | null } };
    const turnList = await (await fetch(`${baseUrl}/api/conversations/conv-1/turns`)).json() as { turns: Array<{ finalResponse: string | null }> };
    const abort = new AbortController();
    const stream = await fetch(`${baseUrl}/api/conversations/conv-1/events/stream`, { signal: abort.signal });

    assert.equal(list.conversations[0]?.codexConversationId, "conv-1");
    assert.equal(list.conversations[0]?.model, "gpt-5.5");
    assert.equal(list.conversations[0]?.reasoningEffort, "high");
    assert.equal(detail.conversation.codexThreadId, "codex-thread-1");
    assert.equal(detail.conversation.workspaceSource, "alias");
    assert.equal(detail.conversation.runningTurnCount, 0);
    assert.equal(detail.conversation.model, "gpt-5.5");
    assert.equal(detail.conversation.reasoningEffort, "high");
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
