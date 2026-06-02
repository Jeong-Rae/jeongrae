import type { Message } from "discord.js";
import type { RunCodexTurnService } from "../../core/turn/RunCodexTurnService.ts";
import { DiscordMessageText } from "../../support/text/DiscordMessageText.ts";
import { DiscordMessageRenderer } from "./DiscordMessageRenderer.ts";

export class DiscordMentionMessageRouter {
  public constructor(
    private readonly runCodexTurnService: RunCodexTurnService,
    private readonly renderer: DiscordMessageRenderer
  ) {}

  public async handle(message: Message): Promise<void> {
    if (message.author.bot || !message.client.user) return;
    if (!message.mentions.users.has(message.client.user.id)) return;
    if (!message.channel.isSendable()) return;

    const userMessage = DiscordMessageText.stripBotMention(message.content, message.client.user.id);
    if (!userMessage) return;

    const started = await message.channel.send(this.renderer.renderRunStarted());
    const result = await this.runCodexTurnService.run({
      discordGuildId: message.guildId ?? "",
      conversationChannelId: message.channelId,
      requestedBy: message.author.id,
      userMessage
    });

    if (result.status === "succeeded") {
      await started.edit(this.renderer.renderRunSucceeded(result.finalResponse, result.codexConversationId));
      return;
    }
    if (result.status === "failed") {
      await started.edit(this.renderer.renderRunFailed(result.errorMessage));
      return;
    }
    await started.edit(result.message);
  }
}
