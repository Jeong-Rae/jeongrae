import test from "node:test";
import assert from "node:assert/strict";
import { DiscordMessageRenderer } from "../src/transport/discord/DiscordMessageRenderer.ts";
import { DiscordSlashCommandRouter } from "../src/transport/discord/DiscordSlashCommandRouter.ts";
import { DiscordComponentInteractionRouter } from "../src/transport/discord/DiscordComponentInteractionRouter.ts";

test("renderer builds model select menus with effective values and no default labels", () => {
  const renderer = new DiscordMessageRenderer("http://localhost:3000");
  const payload = renderer.renderModelConfigInteractive({
    codexConversationId: "conv-1",
    currentModel: "gpt-5.5",
    currentModelUnavailableReason: null,
    currentReasoningEffort: "high",
    currentReasoningEffortUnavailableReason: null,
    currentReasoningSummaries: "auto",
    currentReasoningSummariesUnavailableReason: null,
    modelOverride: null,
    reasoningEffortOverride: null,
    selectableModels: ["gpt-5.5", "gpt-5.4"],
    selectableEfforts: ["minimal", "low", "medium", "high", "xhigh"]
  });

  assert.equal(payload.content.includes("Current model: gpt-5.5"), true);
  assert.equal(payload.content.includes("Current effort: high"), true);
  assert.equal(payload.content.includes("Codex CLI default"), false);
  assert.equal(payload.content.includes("Default"), false);
  assert.equal(payload.components?.length, 2);

  const firstRow = payload.components?.[0]?.toJSON() as { components: Array<{ custom_id: string; options: Array<{ value: string }> }> };
  const secondRow = payload.components?.[1]?.toJSON() as { components: Array<{ custom_id: string; options: Array<{ value: string }> }> };
  assert.equal(firstRow.components[0]?.custom_id, "codex:model:model:conv-1");
  assert.deepEqual(firstRow.components[0]?.options.map((option) => option.value), ["gpt-5.5", "gpt-5.4"]);
  assert.equal(secondRow.components[0]?.custom_id, "codex:model:effort:conv-1");
  assert.deepEqual(secondRow.components[0]?.options.map((option) => option.value), ["minimal", "low", "medium", "high", "xhigh"]);
});

test("slash command without model arguments returns interactive ephemeral payload", async () => {
  const replies: unknown[] = [];
  const router = new DiscordSlashCommandRouter({
    async updateModelConfig(input: unknown) {
      assert.deepEqual(input, {
        discordGuildId: "guild-1",
        conversationChannelId: "channel-1",
        model: undefined,
        reasoningEffort: undefined
      });
      return {
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
      };
    }
  } as never, new DiscordMessageRenderer("http://localhost:3000"));

  await router.handle({
    commandName: "codex",
    guildId: "guild-1",
    channelId: "channel-1",
    options: {
      getSubcommand: () => "model",
      getString: () => null
    },
    reply: async (payload: unknown) => { replies.push(payload); }
  } as never);

  const reply = replies[0] as { content: string; ephemeral: boolean; components: unknown[] };
  assert.equal(reply.ephemeral, true);
  assert.match(reply.content, /Current model: gpt-5\.5/);
  assert.equal(reply.components.length, 2);
});

test("component router stores selected model and effort values", async () => {
  const updates: unknown[] = [];
  const replies: unknown[] = [];
  const router = new DiscordComponentInteractionRouter({
    async updateModelConfig(input: unknown) {
      updates.push(input);
      return {
        status: "updated",
        config: {
          codexConversationId: "conv-1",
          currentModel: "gpt-5.5",
          currentModelUnavailableReason: null,
          currentReasoningEffort: "high",
          currentReasoningEffortUnavailableReason: null,
          currentReasoningSummaries: "auto",
          currentReasoningSummariesUnavailableReason: null,
          modelOverride: "gpt-5.5",
          reasoningEffortOverride: "high",
          selectableModels: ["gpt-5.5"],
          selectableEfforts: ["minimal", "low", "medium", "high", "xhigh"]
        }
      };
    }
  } as never, new DiscordMessageRenderer("http://localhost:3000"));

  await router.handle({
    isStringSelectMenu: () => true,
    customId: "codex:model:model:conv-1",
    guildId: "guild-1",
    values: ["gpt-5.5"],
    reply: async (payload: unknown) => { replies.push(payload); }
  } as never);
  await router.handle({
    isStringSelectMenu: () => true,
    customId: "codex:model:effort:conv-1",
    guildId: "guild-1",
    values: ["high"],
    reply: async (payload: unknown) => { replies.push(payload); }
  } as never);

  assert.deepEqual(updates, [
    { discordGuildId: "guild-1", codexConversationId: "conv-1", model: "gpt-5.5" },
    { discordGuildId: "guild-1", codexConversationId: "conv-1", reasoningEffort: "high" }
  ]);
  assert.equal((replies[0] as { ephemeral: boolean }).ephemeral, true);
  assert.equal((replies[1] as { ephemeral: boolean }).ephemeral, true);
});
