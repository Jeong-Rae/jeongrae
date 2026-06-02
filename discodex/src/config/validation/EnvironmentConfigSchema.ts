import { z } from "zod";

const OptionalEnvString = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().min(1).optional()
);

export const EnvironmentConfigSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_APPLICATION_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  OPENAI_API_KEY: OptionalEnvString,
  DATABASE_PATH: z.string().default("./data/codex-discord-agent.sqlite"),
  HTTP_PORT: z.coerce.number().int().positive().default(3000),
  WORKSPACE_CONFIG_PATH: z.string().default("./config/workspaces.json"),
  CODEX_HOME: OptionalEnvString
});

export type EnvironmentConfig = {
  discordBotToken: string;
  discordApplicationId: string;
  discordGuildId: string;
  openaiApiKey?: string;
  databasePath: string;
  httpPort: number;
  workspaceConfigPath: string;
  codexHome?: string;
};
