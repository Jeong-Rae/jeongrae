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
      await interaction.editReply(`${created.conversation.workspaceKey} workspace에 대한 Codex 세션을 생성했습니다.`);
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
      await interaction.reply(response.ok ? this.renderer.renderYoloEnabled() : response.message);
    }
  }
}
