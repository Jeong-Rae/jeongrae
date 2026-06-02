import test from "node:test";
import assert from "node:assert/strict";
import { DiscordMessageRenderer } from "../src/transport/discord/DiscordMessageRenderer.ts";
import { CodexConversationService } from "../src/core/session/CodexConversationService.ts";
import type { CodexConversation } from "../src/core/session/CodexConversation.ts";
import type { CodexRuntimeStatusProvider } from "../src/core/status/CodexRuntimeStatusProvider.ts";

const now = new Date("2026-06-02T00:00:00.000Z");

const conversation: CodexConversation = {
  codexConversationId: "conv-1",
  discordGuildId: "guild-1",
  parentChannelId: "parent-1",
  conversationChannelId: "channel-1",
  workspaceKey: "api",
  workspacePath: "/workspaces/jeongrae/discodex",
  workspaceSource: "absolute_path",
  codexThreadId: "019e889b-b710-7153-9051-ef57d4ed24af",
  status: "idle",
  permissionMode: "yolo",
  model: "stored-model-must-not-render",
  reasoningEffort: "minimal",
  createdBy: "user-1",
  createdAt: now,
  updatedAt: now
};

function serviceWithStatusProvider(provider: CodexRuntimeStatusProvider) {
  return new CodexConversationService({
    conversationRepository: {
      async create() {},
      async list() { return [conversation]; },
      async findById() { return conversation; },
      async findByChannel() { return conversation; },
      async tryMarkRunning() { return true; },
      async updateStatus() {},
      async updatePermissionModeByChannel() { return conversation; },
      async updateModelConfigByChannel() { return conversation; }
    },
    runtimeStatusProvider: provider,
    workspaceRegistry: { resolve: () => null, listAvailableKeys: () => [] } as never,
    workspaceValidator: { validate: () => ({ ok: false, reason: "missing" }) } as never,
    discordThreadService: { async createPrivateThread() { return { threadId: "unused" }; } },
    codexSdkClient: { async startThread() { return { codexThreadId: "unused" }; }, async run() { return { finalResponse: "unused" }; } }
  });
}

function withModelConfig(provider: Pick<CodexRuntimeStatusProvider, "getStatus">): CodexRuntimeStatusProvider {
  return {
    ...provider,
    async getEffectiveModelConfig(input) {
      return {
        codexConversationId: input.codexConversationId,
        currentModel: "gpt-5.5",
        currentModelUnavailableReason: null,
        currentReasoningEffort: "high",
        currentReasoningEffortUnavailableReason: null,
        currentReasoningSummaries: "auto",
        currentReasoningSummariesUnavailableReason: null,
        modelOverride: input.modelOverride,
        reasoningEffortOverride: input.reasoningEffortOverride,
        selectableModels: ["gpt-5.5"],
        selectableEfforts: ["minimal", "low", "medium", "high", "xhigh"]
      };
    }
  };
}

test("status service returns runtime status instead of stored conversation model fields", async () => {
  const service = serviceWithStatusProvider(withModelConfig({
    async getStatus(input) {
      assert.equal(input.codexThreadId, "019e889b-b710-7153-9051-ef57d4ed24af");
      assert.equal(input.workspacePath, "/workspaces/jeongrae/discodex");
      return {
        ok: true,
        status: {
          model: "gpt-5.5",
          reasoningEffort: "high",
          reasoningSummaries: "auto",
          directory: "/workspaces/jeongrae/discodex",
          permissions: "Full Access",
          agentsMd: "/home/codespace/.codex/AGENTS.md",
          accountEmail: "kkwjdfo@gmail.com",
          accountPlan: "Plus",
          collaborationMode: "Default",
          sessionId: "019e889b-b710-7153-9051-ef57d4ed24af",
          contextWindow: { percentLeft: 57, usedTokens: 117000, totalTokens: 258000 },
          fiveHourLimit: { percentLeft: 49, resetsAtText: "18:00" },
          weeklyLimit: { percentLeft: 73, resetsAtText: "03:10 on 8 Jun" }
        }
      };
    }
  }));

  const result = await service.getStatus("guild-1", "channel-1");
  assert.equal(result.status, "found");
  if (result.status === "found") {
    assert.equal(result.runtimeStatus.model, "gpt-5.5");
    assert.equal(result.runtimeStatus.reasoningEffort, "high");
    assert.notEqual(result.runtimeStatus.model, "stored-model-must-not-render");
  }
});

test("status service reports status_unavailable when runtime provider cannot read status", async () => {
  const service = serviceWithStatusProvider(withModelConfig({
    async getStatus() {
      return {
        ok: false,
        reason: "Codex CLI session metadata not found",
        sessionId: "019e889b-b710-7153-9051-ef57d4ed24af"
      };
    }
  }));

  assert.deepEqual(await service.getStatus("guild-1", "channel-1"), {
    status: "status_unavailable",
    reason: "Codex CLI session metadata not found",
    sessionId: "019e889b-b710-7153-9051-ef57d4ed24af"
  });
});

test("renderer formats Codex runtime status panel and unavailable fields", () => {
  const renderer = new DiscordMessageRenderer("http://localhost:3000");
  const rendered = renderer.renderRuntimeStatus({
    model: "gpt-5.5",
    reasoningEffort: "high",
    reasoningSummaries: "auto",
    directory: "/workspaces/jeongrae/discodex",
    permissions: "Full Access",
    agentsMd: "/home/codespace/.codex/AGENTS.md",
    accountEmail: "kkwjdfo@gmail.com",
    accountPlan: "Plus",
    collaborationMode: "Default",
    sessionId: "019e889b-b710-7153-9051-ef57d4ed24af",
    contextWindow: { percentLeft: null, usedTokens: null, totalTokens: null },
    fiveHourLimit: { percentLeft: 49, resetsAtText: "18:00" },
    weeklyLimit: { percentLeft: 73, resetsAtText: "03:10 on 8 Jun" }
  });

  assert.match(rendered, /Codex Status/);
  assert.match(rendered, /Model:\s+gpt-5\.5 \(reasoning high, summaries auto\)/);
  assert.match(rendered, /Directory:\s+\/workspaces\/jeongrae\/discodex/);
  assert.match(rendered, /Account:\s+kkwjdfo@gmail\.com \(Plus\)/);
  assert.match(rendered, /Context window:\s+Unavailable: context window data not available/);
  assert.doesNotMatch(rendered, /stored-model-must-not-render/);
});

test("renderer formats runtime status unavailable response", () => {
  const renderer = new DiscordMessageRenderer("http://localhost:3000");
  assert.equal(
    renderer.renderStatusUnavailable({
      reason: "Codex CLI session metadata not found",
      sessionId: "codex-thread-1"
    }),
    "Codex status를 조회할 수 없습니다.\n\nReason: Codex CLI session metadata not found\nSession: codex-thread-1"
  );
});
