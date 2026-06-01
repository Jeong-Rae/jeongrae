import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CodexSdkClientFactory } from "../../clients/codex/CodexSdkClientFactory.ts";
import { EnvironmentConfigLoader } from "../../config/loader/EnvironmentConfigLoader.ts";
import { WorkspaceConfigLoader } from "../../config/loader/WorkspaceConfigLoader.ts";
import { CodexRuntimeEventBus } from "../../core/event/CodexRuntimeEventBus.ts";
import { CodexConversationService } from "../../core/session/CodexConversationService.ts";
import { RunCodexTurnService } from "../../core/turn/RunCodexTurnService.ts";
import { WorkspaceRegistry } from "../../runtime/workspace/WorkspaceRegistry.ts";
import { WorkspaceValidator } from "../../runtime/workspace/WorkspaceValidator.ts";
import { SqliteConnectionFactory } from "../../store/connection/SqliteConnectionFactory.ts";
import { SqliteCodexRuntimeEventRepository } from "../../store/event/SqliteCodexRuntimeEventRepository.ts";
import { MigrationRunner } from "../../store/migration/MigrationRunner.ts";
import { SqliteCodexConversationRepository } from "../../store/session/SqliteCodexConversationRepository.ts";
import { SqliteCodexTurnRepository } from "../../store/thread/SqliteCodexTurnRepository.ts";
import { ConsoleLogger } from "../../telemetry/logging/ConsoleLogger.ts";
import { redactSecrets } from "../../telemetry/logging/ConsoleLogger.ts";
import { DiscordBot } from "../../transport/discord/DiscordBot.ts";
import { DiscordMentionMessageRouter } from "../../transport/discord/DiscordMentionMessageRouter.ts";
import { DiscordMessageRenderer } from "../../transport/discord/DiscordMessageRenderer.ts";
import { DiscordSlashCommandRouter } from "../../transport/discord/DiscordSlashCommandRouter.ts";
import { CodexConversationController } from "../../transport/http/CodexConversationController.ts";
import { DebugHttpServer } from "../../transport/http/DebugHttpServer.ts";
import { StaticFileController } from "../../transport/http/StaticFileController.ts";
import { CodexRuntimeEventSseController } from "../../transport/sse/CodexRuntimeEventSseController.ts";

async function main(): Promise<void> {
  const config = new EnvironmentConfigLoader().load();
  const logger = new ConsoleLogger([config.discordBotToken, config.openaiApiKey]);
  const workspaceConfig = new WorkspaceConfigLoader(config.workspaceConfigPath).load();
  const db = new SqliteConnectionFactory(config.databasePath).create();
  new MigrationRunner(db).run();

  const conversationRepository = new SqliteCodexConversationRepository(db);
  const turnRepository = new SqliteCodexTurnRepository(db);
  const runtimeEventRepository = new SqliteCodexRuntimeEventRepository(db);
  const eventBus = new CodexRuntimeEventBus();
  const codexSdkClient = new CodexSdkClientFactory(config.openaiApiKey, config.codexHome).create();
  const renderer = new DiscordMessageRenderer(`http://localhost:${config.httpPort}`);
  let discordBot: DiscordBot;

  const conversationService = new CodexConversationService({
    conversationRepository,
    workspaceRegistry: new WorkspaceRegistry(workspaceConfig.workspaces),
    workspaceValidator: new WorkspaceValidator(),
    discordThreadService: {
      createPrivateThread: (input) => discordBot.createPrivateThread(input),
      deleteThread: (threadId) => discordBot.deleteThread(threadId)
    },
    codexSdkClient,
    logger
  });
  const runCodexTurnService = new RunCodexTurnService({
    conversationRepository,
    turnRepository,
    runtimeEventRepository,
    eventBus,
    codexSdkClient,
    logger
  });
  discordBot = new DiscordBot({
    token: config.discordBotToken,
    applicationId: config.discordApplicationId,
    guildId: config.discordGuildId,
    slashCommandRouter: new DiscordSlashCommandRouter(conversationService, renderer),
    mentionMessageRouter: new DiscordMentionMessageRouter(runCodexTurnService, renderer),
    logger
  });

  new DebugHttpServer({
    port: config.httpPort,
    conversationController: new CodexConversationController({ conversationRepository, turnRepository, runtimeEventRepository }),
    sseController: new CodexRuntimeEventSseController(eventBus),
    staticFileController: new StaticFileController(resolve(dirname(fileURLToPath(import.meta.url)), "../../../public")),
    logger
  }).start();

  await discordBot.start();
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  const secrets = [process.env.DISCORD_BOT_TOKEN ?? "", process.env.OPENAI_API_KEY ?? ""];
  console.error(redactSecrets(message, secrets));
  process.exitCode = 1;
});
