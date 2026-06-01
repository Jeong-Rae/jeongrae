export class DiscordMessageText {
  public static stripBotMention(content: string, botUserId: string): string {
    return content
      .replace(new RegExp(`<@!?${botUserId}>`, "g"), "")
      .trim();
  }
}
