import { z } from "zod";

export const EnvironmentConfigSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_APPLICATION_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_PATH: z.string().default("./data/codex-discord-agent.sqlite"),
  HTTP_PORT: z.coerce.number().int().positive().default(3000),
  WORKSPACE_CONFIG_PATH: z.string().default("./config/workspaces.json"),
  CODEX_HOME: z.string().default("./data/codex-home")
});

export type EnvironmentConfig = {
  discordBotToken: string;
  discordApplicationId: string;
  discordGuildId: string;
  openaiApiKey: string;
  databasePath: string;
  httpPort: number;
  workspaceConfigPath: string;
  codexHome: string;
};
