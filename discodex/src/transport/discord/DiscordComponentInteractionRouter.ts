import { MessageFlags, type StringSelectMenuInteraction } from "discord.js";
import type { CodexConversationService } from "../../core/session/CodexConversationService.ts";
import { DiscordMessageRenderer } from "./DiscordMessageRenderer.ts";

export class DiscordComponentInteractionRouter {
  public constructor(
    private readonly conversationService: CodexConversationService,
    private readonly renderer: DiscordMessageRenderer
  ) {}

  public async handle(interaction: Pick<StringSelectMenuInteraction, "isStringSelectMenu" | "customId" | "guildId" | "values" | "reply">): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;
    const parsed = this.parseCustomId(interaction.customId);
    if (!parsed) return;
    const selected = interaction.values[0];
    if (!selected) return;

    const response = await this.conversationService.updateModelConfig({
      discordGuildId: interaction.guildId ?? "",
      codexConversationId: parsed.codexConversationId,
      ...(parsed.kind === "model" ? { model: selected } : { reasoningEffort: selected })
    });

    await interaction.reply({
      ...this.renderModelResponse(response),
      flags: MessageFlags.Ephemeral
    });
  }

  private parseCustomId(customId: string): { kind: "model" | "effort"; codexConversationId: string } | null {
    const parts = customId.split(":");
    if (parts.length !== 4 || parts[0] !== "codex" || parts[1] !== "model") return null;
    if (parts[2] !== "model" && parts[2] !== "effort") return null;
    return { kind: parts[2], codexConversationId: parts[3] ?? "" };
  }

  private renderModelResponse(response: Awaited<ReturnType<CodexConversationService["updateModelConfig"]>>) {
    if (response.status === "not_found") return { content: this.renderer.renderNoConversation() };
    if (response.status === "invalid_effort") return { content: this.renderer.renderInvalidEffort() };
    if (response.status === "invalid_model") return { content: this.renderer.renderInvalidModel() };
    if (response.status === "updated") return { content: this.renderer.renderModelConfigUpdated(response) };
    return this.renderer.renderModelConfigInteractive(response.config);
  }
}
