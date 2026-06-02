import type { ChatInputCommandInteraction } from "discord.js";
import type { CodexConversationService } from "../../core/session/CodexConversationService.ts";
import { DiscordMessageRenderer } from "./DiscordMessageRenderer.ts";

export class DiscordSlashCommandRouter {
  public constructor(
    private readonly conversationService: CodexConversationService,
    private readonly renderer: DiscordMessageRenderer
  ) {}

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.commandName !== "codex") return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "new") {
      const cwd = interaction.options.getString("cwd", true);
      await interaction.deferReply({ ephemeral: true });
      const created = await this.conversationService.create({
        discordGuildId: interaction.guildId ?? "",
        parentChannelId: interaction.channelId,
        cwd,
        createdBy: interaction.user.id
      });
      if (!created.ok) {
        await interaction.editReply(this.renderer.renderInvalidWorkspace(created.availableWorkspaceKeys));
        return;
      }
      await interaction.editReply(this.renderer.renderConversationCreatedReply(
        created.conversation.workspaceKey,
        created.conversation.discordGuildId,
        created.conversation.conversationChannelId
      ));
      const channel = await interaction.client.channels.fetch(created.conversation.conversationChannelId);
      if (channel?.isSendable()) {
        await channel.send(this.renderer.renderConversationCreated({
          workspaceKey: created.conversation.workspaceKey,
          workspacePath: created.conversation.workspacePath,
          workspaceSource: created.conversation.workspaceSource,
          permissionMode: created.conversation.permissionMode
        }));
      }
      return;
    }

    if (subcommand === "yolo") {
      const response = await this.conversationService.enableYolo({
        discordGuildId: interaction.guildId ?? "",
        conversationChannelId: interaction.channelId
      });
      await interaction.reply({ content: response.ok ? this.renderer.renderYoloEnabled() : response.message, ephemeral: true });
      return;
    }

    if (subcommand === "model") {
      const response = await this.conversationService.updateModelConfig({
        discordGuildId: interaction.guildId ?? "",
        conversationChannelId: interaction.channelId,
        model: interaction.options.getString("model") ?? undefined,
        reasoningEffort: interaction.options.getString("effort") ?? undefined
      });
      await interaction.reply({ content: this.renderModelResponse(response), ephemeral: true });
      return;
    }

    if (subcommand === "status") {
      const response = await this.conversationService.getStatus(interaction.guildId ?? "", interaction.channelId);
      await interaction.reply({
        content: response.status === "not_found"
          ? this.renderer.renderNoConversation()
          : this.renderer.renderStatus(response),
        ephemeral: true
      });
    }
  }

  private renderModelResponse(response: Awaited<ReturnType<CodexConversationService["updateModelConfig"]>>): string {
    if (response.status === "not_found") return this.renderer.renderNoConversation();
    if (response.status === "invalid_effort") return this.renderer.renderInvalidEffort();
    if (response.status === "invalid_model") return this.renderer.renderInvalidModel();
    if (response.status === "updated") return this.renderer.renderModelConfigUpdated(response);
    return this.renderer.renderModelConfig(response);
  }
}
