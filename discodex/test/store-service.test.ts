import { mkdirSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { SqliteConnectionFactory } from "../src/store/connection/SqliteConnectionFactory.ts";
import { MigrationRunner } from "../src/store/migration/MigrationRunner.ts";
import { SqliteCodexConversationRepository } from "../src/store/session/SqliteCodexConversationRepository.ts";
import { SqliteCodexTurnRepository } from "../src/store/thread/SqliteCodexTurnRepository.ts";
import { SqliteCodexRuntimeEventRepository } from "../src/store/event/SqliteCodexRuntimeEventRepository.ts";
import { WorkspaceRegistry } from "../src/runtime/workspace/WorkspaceRegistry.ts";
import { WorkspaceValidator } from "../src/runtime/workspace/WorkspaceValidator.ts";
import { CodexConversationService } from "../src/core/session/CodexConversationService.ts";
import { RunCodexTurnService } from "../src/core/turn/RunCodexTurnService.ts";
import { CodexRuntimeEventBus } from "../src/core/event/CodexRuntimeEventBus.ts";
import type { CodexSdkClient } from "../src/clients/codex/CodexSdkClient.ts";
import { CodexSdkStreamError } from "../src/clients/codex/CodexSdkClient.ts";
import type { DiscordThreadService } from "../src/transport/discord/DiscordThreadService.ts";

async function createStore() {
  const dir = await mkdtemp(join(tmpdir(), "codex-store-"));
  const db = new SqliteConnectionFactory(join(dir, "store.sqlite")).create();
  new MigrationRunner(db).run();
  return {
    db,
    conversations: new SqliteCodexConversationRepository(db),
    turns: new SqliteCodexTurnRepository(db),
    events: new SqliteCodexRuntimeEventRepository(db)
  };
}

async function createGitWorkspace() {
  const dir = await mkdtemp(join(tmpdir(), "codex-workspace-"));
  const workspace = join(dir, "api");
  mkdirSync(workspace);
  mkdirSync(join(workspace, ".git"));
  return workspace;
}

test("conversation service creates thread mapping and rejects invalid workspace", async () => {
  const store = await createStore();
  const workspace = await createGitWorkspace();
  let threadCounter = 0;
  const privateThreadInputs: Array<{ parentChannelId: string; name: string; createdByUserId: string }> = [];
  const discordThreads: DiscordThreadService = {
    async createPrivateThread(input) {
      privateThreadInputs.push(input);
      threadCounter += 1;
      return { threadId: `discord-thread-${threadCounter}` };
    }
  };
  const codex: CodexSdkClient = {
    async startThread() {
      return { codexThreadId: "codex-thread-1" };
    },
    async run() {
      return { finalResponse: "ok" };
    }
  };
  const service = new CodexConversationService({
    conversationRepository: store.conversations,
    workspaceRegistry: new WorkspaceRegistry([
      { workspaceKey: "api", displayName: "API", absolutePath: workspace, enabled: true }
    ]),
    workspaceValidator: new WorkspaceValidator(),
    discordThreadService: discordThreads,
    codexSdkClient: codex
  });

  const created = await service.create({
    discordGuildId: "guild-1",
    parentChannelId: "parent-1",
    cwd: "api",
    createdBy: "user-1"
  });
  assert.equal(created.ok, true);
  assert.equal(created.conversation?.conversationChannelId, "discord-thread-1");
  assert.equal(created.conversation?.codexThreadId, "codex-thread-1");
  assert.equal(created.conversation?.workspaceSource, "alias");
  assert.equal(created.conversation?.model, null);
  assert.equal(created.conversation?.reasoningEffort, null);
  assert.deepEqual(privateThreadInputs[0], {
    parentChannelId: "parent-1",
    name: "codex-api",
    createdByUserId: "user-1"
  });

  const absolute = await service.create({
    discordGuildId: "guild-1",
    parentChannelId: "parent-1",
    cwd: workspace,
    createdBy: "user-1"
  });
  assert.equal(absolute.ok, true);
  assert.equal(absolute.conversation?.workspaceSource, "absolute_path");
  assert.equal(absolute.conversation?.workspacePath, workspace);

  const invalid = await service.create({
    discordGuildId: "guild-1",
    parentChannelId: "parent-1",
    cwd: "missing",
    createdBy: "user-1"
  });
  assert.equal(invalid.ok, false);
  assert.deepEqual(invalid.availableWorkspaceKeys, ["api"]);
});

test("conversation service deletes created discord thread when downstream creation fails", async () => {
  const store = await createStore();
  const workspace = await createGitWorkspace();
  const deletedThreads: string[] = [];
  const discordThreads: DiscordThreadService = {
    async createPrivateThread() {
      return { threadId: "discord-thread-orphan" };
    },
    async deleteThread(threadId) {
      deletedThreads.push(threadId);
    }
  };
  const codex: CodexSdkClient = {
    async startThread() {
      throw new Error("codex unavailable");
    },
    async run() {
      return { finalResponse: "unused" };
    }
  };
  const service = new CodexConversationService({
    conversationRepository: store.conversations,
    workspaceRegistry: new WorkspaceRegistry([
      { workspaceKey: "api", displayName: "API", absolutePath: workspace, enabled: true }
    ]),
    workspaceValidator: new WorkspaceValidator(),
    discordThreadService: discordThreads,
    codexSdkClient: codex
  });

  await assert.rejects(
    () => service.create({
      discordGuildId: "guild-1",
      parentChannelId: "parent-1",
      cwd: "api",
      createdBy: "user-1"
    }),
    /codex unavailable/
  );
  assert.deepEqual(deletedThreads, ["discord-thread-orphan"]);
  assert.deepEqual(await store.conversations.list(), []);
});


test("repositories persist turns/events and expose running turn count", async () => {
  const store = await createStore();
  const now = new Date("2026-06-01T00:00:00.000Z");
  await store.conversations.create({
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
    model: null,
    reasoningEffort: null,
    createdBy: "user-1",
    createdAt: now,
    updatedAt: now
  });

  await store.conversations.updateStatus("conv-1", "running", now);
  await store.conversations.updatePermissionModeByChannel("guild-1", "channel-1", "yolo", now);

  await store.turns.create({
    codexTurnId: "turn-1",
    codexConversationId: "conv-1",
    requestedBy: "user-1",
    userMessage: "hello",
    status: "running",
    finalResponse: null,
    errorMessage: null,
    createdAt: now,
    startedAt: now,
    finishedAt: null
  });
  await store.turns.markSucceeded("turn-1", "final", now);
  await store.events.create({
    codexRuntimeEventId: "event-1",
    codexConversationId: "conv-1",
    codexTurnId: "turn-1",
    eventType: "turn.completed",
    payloadJson: "{}",
    createdAt: now
  });

  assert.equal((await store.conversations.findByChannel("guild-1", "channel-1"))?.permissionMode, "yolo");
  assert.equal(await store.turns.countRunningByConversation("conv-1"), 0);
  assert.equal((await store.turns.listByConversation("conv-1"))[0]?.finalResponse, "final");
  assert.equal((await store.events.listByConversation("conv-1"))[0]?.eventType, "turn.completed");
});

test("repository persists conversation model config and keeps omitted fields", async () => {
  const store = await createStore();
  const now = new Date("2026-06-01T00:00:00.000Z");
  await store.conversations.create({
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
    model: null,
    reasoningEffort: null,
    createdBy: "user-1",
    createdAt: now,
    updatedAt: now
  });

  const fullUpdate = await store.conversations.updateModelConfigByChannel({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    model: "gpt-5.5",
    reasoningEffort: "high",
    updatedAt: new Date("2026-06-01T00:01:00.000Z")
  });
  assert.equal(fullUpdate?.model, "gpt-5.5");
  assert.equal(fullUpdate?.reasoningEffort, "high");

  const modelOnly = await store.conversations.updateModelConfigByChannel({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    model: "gpt-5.6",
    updatedAt: new Date("2026-06-01T00:02:00.000Z")
  });
  assert.equal(modelOnly?.model, "gpt-5.6");
  assert.equal(modelOnly?.reasoningEffort, "high");

  const effortOnly = await store.conversations.updateModelConfigByChannel({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    reasoningEffort: "low",
    updatedAt: new Date("2026-06-01T00:03:00.000Z")
  });
  assert.equal(effortOnly?.model, "gpt-5.6");
  assert.equal(effortOnly?.reasoningEffort, "low");

  assert.equal(
    await store.conversations.updateModelConfigByChannel({
      discordGuildId: "guild-1",
      conversationChannelId: "missing",
      model: "gpt-5.5",
      updatedAt: now
    }),
    null
  );
  assert.throws(
    () => store.db.prepare("UPDATE codex_conversation SET reasoning_effort = 'bad' WHERE codex_conversation_id = 'conv-1'").run(),
    /reasoning_effort/
  );
});

test("conversation service returns and validates model config and status", async () => {
  const store = await createStore();
  const now = new Date("2026-06-01T00:00:00.000Z");
  await store.conversations.create({
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
    model: null,
    reasoningEffort: null,
    createdBy: "user-1",
    createdAt: now,
    updatedAt: now
  });
  await store.turns.create({
    codexTurnId: "turn-1",
    codexConversationId: "conv-1",
    requestedBy: "user-1",
    userMessage: "hello",
    status: "running",
    finalResponse: null,
    errorMessage: null,
    createdAt: now,
    startedAt: now,
    finishedAt: null
  });

  const service = new CodexConversationService({
    conversationRepository: store.conversations,
    turnRepository: store.turns,
    debugBaseUrl: "http://localhost:3000",
    runtimeStatusProvider: {
      async getStatus(input) {
        return {
          ok: true,
          status: {
            model: input.modelOverride,
            reasoningEffort: input.reasoningEffortOverride,
            reasoningSummaries: "auto",
            directory: input.workspacePath,
            permissions: "On Request",
            agentsMd: "/home/codespace/.codex/AGENTS.md",
            accountEmail: "kkwjdfo@gmail.com",
            accountPlan: "Plus",
            collaborationMode: "Default",
            sessionId: input.codexThreadId,
            contextWindow: { percentLeft: 57, usedTokens: 117000, totalTokens: 258000 },
            fiveHourLimit: { percentLeft: 49, resetsAtText: "18:00" },
            weeklyLimit: { percentLeft: 73, resetsAtText: "03:10 on 8 Jun" }
          }
        };
      },
      async getEffectiveModelConfig(input) {
        return {
          codexConversationId: input.codexConversationId,
          currentModel: input.modelOverride ?? "gpt-5.5",
          currentModelUnavailableReason: null,
          currentReasoningEffort: input.reasoningEffortOverride ?? "high",
          currentReasoningEffortUnavailableReason: null,
          currentReasoningSummaries: "auto",
          currentReasoningSummariesUnavailableReason: null,
          modelOverride: input.modelOverride,
          reasoningEffortOverride: input.reasoningEffortOverride,
          selectableModels: ["gpt-5.5"],
          selectableEfforts: ["minimal", "low", "medium", "high", "xhigh"]
        };
      }
    },
    workspaceRegistry: new WorkspaceRegistry([]),
    workspaceValidator: new WorkspaceValidator(),
    discordThreadService: { async createPrivateThread() { return { threadId: "unused" }; } },
    codexSdkClient: { async startThread() { return { codexThreadId: "unused" }; }, async run() { return { finalResponse: "unused" }; } }
  });

  assert.deepEqual(await service.getModelConfig("guild-1", "missing"), { status: "not_found" });
  assert.deepEqual(await service.getModelConfig("guild-1", "channel-1"), {
    status: "found",
    config: {
      codexConversationId: "conv-1",
      currentModel: "gpt-5.5",
      currentModelUnavailableReason: null,
      currentReasoningEffort: "high",
      currentReasoningEffortUnavailableReason: null,
      currentReasoningSummaries: "auto",
      currentReasoningSummariesUnavailableReason: null,
      modelOverride: null,
      reasoningEffortOverride: null,
      selectableModels: ["gpt-5.5"],
      selectableEfforts: ["minimal", "low", "medium", "high", "xhigh"]
    }
  });
  assert.deepEqual(await service.updateModelConfig({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    model: "",
    reasoningEffort: "high"
  }), { status: "invalid_model" });
  assert.deepEqual(await service.updateModelConfig({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    model: "gpt-5.5",
    reasoningEffort: "xhigh"
  }), {
    status: "updated",
    config: {
      codexConversationId: "conv-1",
      currentModel: "gpt-5.5",
      currentModelUnavailableReason: null,
      currentReasoningEffort: "xhigh",
      currentReasoningEffortUnavailableReason: null,
      currentReasoningSummaries: "auto",
      currentReasoningSummariesUnavailableReason: null,
      modelOverride: "gpt-5.5",
      reasoningEffortOverride: "xhigh",
      selectableModels: ["gpt-5.5"],
      selectableEfforts: ["minimal", "low", "medium", "high", "xhigh"]
    }
  });
  assert.deepEqual(await service.updateModelConfig({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1"
  }), {
    status: "found",
    config: {
      codexConversationId: "conv-1",
      currentModel: "gpt-5.5",
      currentModelUnavailableReason: null,
      currentReasoningEffort: "xhigh",
      currentReasoningEffortUnavailableReason: null,
      currentReasoningSummaries: "auto",
      currentReasoningSummariesUnavailableReason: null,
      modelOverride: "gpt-5.5",
      reasoningEffortOverride: "xhigh",
      selectableModels: ["gpt-5.5"],
      selectableEfforts: ["minimal", "low", "medium", "high", "xhigh"]
    }
  });

  const status = await service.getStatus("guild-1", "channel-1");
  assert.equal(status.status, "found");
  if (status.status === "found") {
    assert.equal(status.runtimeStatus.directory, "/tmp/api");
    assert.equal(status.runtimeStatus.model, "gpt-5.5");
    assert.equal(status.runtimeStatus.reasoningEffort, "xhigh");
    assert.equal(status.runtimeStatus.contextWindow.percentLeft, 57);
  }
});

test("run service resumes same codex thread, allows concurrent turns, and restores display status on failure", async () => {
  const store = await createStore();
  const now = new Date("2026-06-01T00:00:00.000Z");
  await store.conversations.create({
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

  const runInputs: Array<{ codexThreadId: string; model?: string; reasoningEffort?: string }> = [];
  const codex: CodexSdkClient = {
    async startThread() {
      return { codexThreadId: "unused" };
    },
    async run(input) {
      runInputs.push({
        codexThreadId: input.codexThreadId,
        model: input.model,
        reasoningEffort: input.reasoningEffort
      });
      if (input.message === "stream-fail") {
        throw new CodexSdkStreamError("stream boom", [
          { eventType: "turn.failed", payloadJson: JSON.stringify({ type: "turn.failed", error: { message: "stream boom" } }) }
        ]);
      }
      if (input.message === "fail") throw new Error("boom");
      return {
        finalResponse: `answer:${input.message}`,
        runtimeEvents: [
          { eventType: "item.completed", payloadJson: JSON.stringify({ item: { type: "agent_message", text: `answer:${input.message}` } }) }
        ]
      };
    }
  };
  const service = new RunCodexTurnService({
    conversationRepository: store.conversations,
    turnRepository: store.turns,
    runtimeEventRepository: store.events,
    eventBus: new CodexRuntimeEventBus(),
    codexSdkClient: codex
  });

  const first = await service.run({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    requestedBy: "user-1",
    userMessage: "hello"
  });
  assert.equal(first.status, "succeeded");
  assert.equal(first.finalResponse, "answer:hello");

  const streamFailed = await service.run({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    requestedBy: "user-1",
    userMessage: "stream-fail"
  });
  assert.equal(streamFailed.status, "failed");

  await store.conversations.updateStatus("conv-1", "running", now);
  const concurrent = await service.run({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    requestedBy: "user-1",
    userMessage: "second"
  });
  assert.equal(concurrent.status, "succeeded");
  assert.equal(concurrent.finalResponse, "answer:second");

  const failed = await service.run({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    requestedBy: "user-1",
    userMessage: "fail"
  });
  assert.equal(failed.status, "failed");
  assert.equal((await store.conversations.findByChannel("guild-1", "channel-1"))?.status, "idle");
  assert.deepEqual(runInputs, [
    { codexThreadId: "codex-thread-1", model: "gpt-5.5", reasoningEffort: "high" },
    { codexThreadId: "codex-thread-1", model: "gpt-5.5", reasoningEffort: "high" },
    { codexThreadId: "codex-thread-1", model: "gpt-5.5", reasoningEffort: "high" },
    { codexThreadId: "codex-thread-1", model: "gpt-5.5", reasoningEffort: "high" }
  ]);
  assert.equal(
    (await store.events.listByConversation("conv-1")).some((event) => event.eventType === "item.completed"),
    true
  );
  assert.equal(
    (await store.events.listByConversation("conv-1")).some((event) => event.eventType === "turn.failed"),
    true
  );
});

test("run service restores conversation idle when turn creation fails", async () => {
  const store = await createStore();
  const now = new Date("2026-06-01T00:00:00.000Z");
  await store.conversations.create({
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
    model: null,
    reasoningEffort: null,
    createdBy: "user-1",
    createdAt: now,
    updatedAt: now
  });
  const service = new RunCodexTurnService({
    conversationRepository: store.conversations,
    turnRepository: {
      async create() {
        throw new Error("turn insert failed");
      },
      async listByConversation() {
        return [];
      },
      async markSucceeded() {},
      async markFailed() {},
      async countRunningByConversation() {
        return 0;
      }
    },
    runtimeEventRepository: store.events,
    eventBus: new CodexRuntimeEventBus(),
    codexSdkClient: {
      async startThread() {
        return { codexThreadId: "unused" };
      },
      async run() {
        return { finalResponse: "unused" };
      }
    }
  });

  const result = await service.run({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    requestedBy: "user-1",
    userMessage: "hello"
  });

  assert.equal(result.status, "failed");
  assert.equal((await store.conversations.findByChannel("guild-1", "channel-1"))?.status, "idle");
});

test("run service marks failed turn before swallowing failed event persistence", async () => {
  const store = await createStore();
  const now = new Date("2026-06-01T00:00:00.000Z");
  await store.conversations.create({
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
    model: null,
    reasoningEffort: null,
    createdBy: "user-1",
    createdAt: now,
    updatedAt: now
  });
  const service = new RunCodexTurnService({
    conversationRepository: store.conversations,
    turnRepository: store.turns,
    runtimeEventRepository: {
      async create() {
        throw new Error("event insert failed");
      },
      async listByConversation() {
        return [];
      }
    },
    eventBus: new CodexRuntimeEventBus(),
    codexSdkClient: {
      async startThread() {
        return { codexThreadId: "unused" };
      },
      async run() {
        throw new CodexSdkStreamError("stream boom", [
          { eventType: "turn.failed", payloadJson: JSON.stringify({ type: "turn.failed", error: { message: "stream boom" } }) }
        ]);
      }
    }
  });

  const result = await service.run({
    discordGuildId: "guild-1",
    conversationChannelId: "channel-1",
    requestedBy: "user-1",
    userMessage: "hello"
  });

  assert.equal(result.status, "failed");
  assert.equal((await store.turns.listByConversation("conv-1"))[0]?.status, "failed");
  assert.equal((await store.conversations.findByChannel("guild-1", "channel-1"))?.status, "idle");
});
