import dotenv from "dotenv";
import { EnvironmentConfigSchema, type EnvironmentConfig } from "../validation/EnvironmentConfigSchema.ts";

export class EnvironmentConfigLoader {
  public constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  public load(): EnvironmentConfig {
    dotenv.config();
    const parsed = EnvironmentConfigSchema.parse(this.env);
    return {
      discordBotToken: parsed.DISCORD_BOT_TOKEN,
      discordApplicationId: parsed.DISCORD_APPLICATION_ID,
      discordGuildId: parsed.DISCORD_GUILD_ID,
      openaiApiKey: parsed.OPENAI_API_KEY,
      databasePath: parsed.DATABASE_PATH,
      httpPort: parsed.HTTP_PORT,
      workspaceConfigPath: parsed.WORKSPACE_CONFIG_PATH,
      codexHome: parsed.CODEX_HOME
    };
  }
}
