import { ChannelType, Client, GatewayIntentBits, MessageFlags, REST, Routes, SlashCommandBuilder, type TextBasedChannel } from "discord.js";
import type { Logger } from "../../telemetry/logging/Logger.ts";
import { REASONING_EFFORT_VALUES } from "../../core/model/ReasoningEffort.ts";
import type { DiscordSlashCommandRouter } from "./DiscordSlashCommandRouter.ts";
import type { DiscordComponentInteractionRouter } from "./DiscordComponentInteractionRouter.ts";
import type { DiscordMentionMessageRouter } from "./DiscordMentionMessageRouter.ts";
import type { CreatePrivateThreadInput, CreatePrivateThreadOutput, DiscordThreadService } from "./DiscordThreadService.ts";

export class DiscordBot implements DiscordThreadService {
  private readonly client: Client;

  public constructor(private readonly deps: {
    token: string;
    applicationId: string;
    guildId: string;
    slashCommandRouter: DiscordSlashCommandRouter;
    componentInteractionRouter: DiscordComponentInteractionRouter;
    mentionMessageRouter: DiscordMentionMessageRouter;
    logger: Logger;
  }) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
  }

  public async start(): Promise<void> {
    this.client.on("interactionCreate", (interaction) => {
      void this.handleEvent(async () => {
        if (interaction.isChatInputCommand()) await this.deps.slashCommandRouter.handle(interaction);
        if (interaction.isStringSelectMenu()) await this.deps.componentInteractionRouter.handle(interaction);
      }, async (error) => {
        if (interaction.isRepliable()) {
          const message = "Codex command 처리 중 오류가 발생했습니다.";
          if (interaction.deferred || interaction.replied) await interaction.followUp({ content: message, flags: MessageFlags.Ephemeral });
          else await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
        }
        this.logEventError("discord_interaction_failed", error);
      });
    });
    this.client.on("messageCreate", (message) => {
      void this.handleEvent(
        () => this.deps.mentionMessageRouter.handle(message),
        (error) => {
          this.logEventError("discord_message_failed", error);
        }
      );
    });
    await this.registerCommands();
    await this.client.login(this.deps.token);
    this.deps.logger.info("discord bot logged in", { eventType: "discord_bot_logged_in" });
  }

  public async createPrivateThread(input: CreatePrivateThreadInput): Promise<CreatePrivateThreadOutput> {
    const channel = await this.client.channels.fetch(input.parentChannelId);
    if (!channel || !("threads" in channel)) {
      throw new Error(`Channel ${input.parentChannelId} cannot create threads.`);
    }
    let thread: { id: string; members: { add(userId: string): Promise<unknown> } };
    try {
      thread = await (channel as TextBasedChannel & { threads: { create(input: { name: string; type: ChannelType.PrivateThread }): Promise<{ id: string; members: { add(userId: string): Promise<unknown> } }> } }).threads.create({
        name: input.name,
        type: ChannelType.PrivateThread
      });
      await thread.members.add(input.createdByUserId);
      this.deps.logger.info("discord private thread created", {
        eventType: "discord_private_thread_created",
        parentChannelId: input.parentChannelId,
        threadId: thread.id,
        createdByUserId: input.createdByUserId
      });
      return { threadId: thread.id };
    } catch (error) {
      this.deps.logger.error("discord private thread creation failed", {
        eventType: "discord_private_thread_creation_failed",
        parentChannelId: input.parentChannelId,
        createdByUserId: input.createdByUserId,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  public async deleteThread(threadId: string): Promise<void> {
    const channel = await this.client.channels.fetch(threadId);
    if (channel && "delete" in channel && typeof channel.delete === "function") {
      await channel.delete();
    }
  }

  private async registerCommands(): Promise<void> {
    const rest = new REST({ version: "10" }).setToken(this.deps.token);
    await rest.put(Routes.applicationGuildCommands(this.deps.applicationId, this.deps.guildId), { body: [buildCodexSlashCommand().toJSON()] });
  }

  private async handleEvent(action: () => Promise<void>, onError: (error: unknown) => Promise<void> | void): Promise<void> {
    try {
      await action();
    } catch (error) {
      try {
        await onError(error);
      } catch (handlerError) {
        this.logEventError("discord_error_handler_failed", handlerError);
      }
    }
  }

  private logEventError(eventType: string, error: unknown): void {
    this.deps.logger.error("discord event handler failed", {
      eventType,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
  }
}

export function buildCodexSlashCommand() {
  return new SlashCommandBuilder()
    .setName("codex")
    .setDescription("Codex conversation commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("new")
        .setDescription("Create a new Codex conversation")
        .addStringOption((option) => option.setName("cwd").setDescription("Workspace alias").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("yolo")
        .setDescription("Enable yolo permission mode for this conversation")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("model")
        .setDescription("Show or update model settings for this conversation")
        .addStringOption((option) => option.setName("model").setDescription("Codex model").setRequired(false))
        .addStringOption((option) => {
          const effortOption = option.setName("effort").setDescription("Reasoning effort").setRequired(false);
          for (const effort of REASONING_EFFORT_VALUES) {
            effortOption.addChoices({ name: effort, value: effort });
          }
          return effortOption;
        })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Show Codex conversation status")
    );
}
