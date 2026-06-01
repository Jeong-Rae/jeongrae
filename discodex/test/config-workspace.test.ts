import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { EnvironmentConfigLoader } from "../src/config/loader/EnvironmentConfigLoader.ts";
import { WorkspaceConfigLoader } from "../src/config/loader/WorkspaceConfigLoader.ts";
import { WorkspaceRegistry } from "../src/runtime/workspace/WorkspaceRegistry.ts";
import { WorkspaceValidator } from "../src/runtime/workspace/WorkspaceValidator.ts";

test("environment loader validates required values and applies defaults", () => {
  const loader = new EnvironmentConfigLoader({
    DISCORD_BOT_TOKEN: "discord-token",
    DISCORD_APPLICATION_ID: "app-id",
    DISCORD_GUILD_ID: "guild-id",
    OPENAI_API_KEY: "openai-key"
  });

  assert.deepEqual(loader.load(), {
    discordBotToken: "discord-token",
    discordApplicationId: "app-id",
    discordGuildId: "guild-id",
    openaiApiKey: "openai-key",
    databasePath: "./data/codex-discord-agent.sqlite",
    httpPort: 3000,
    workspaceConfigPath: "./config/workspaces.json",
    codexHome: "./data/codex-home"
  });
});

test("workspace registry exposes only enabled aliases", () => {
  const registry = new WorkspaceRegistry([
    { workspaceKey: "api", displayName: "API", absolutePath: "/repo/api", enabled: true },
    { workspaceKey: "web", displayName: "Web", absolutePath: "/repo/web", enabled: false }
  ]);

  assert.equal(registry.get("api")?.workspaceKey, "api");
  assert.equal(registry.get("web"), null);
  assert.deepEqual(registry.listAvailableKeys(), ["api"]);
});

test("workspace config loader parses workspaces json", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workspace-config-"));
  const file = join(dir, "workspaces.json");
  writeFileSync(file, JSON.stringify({
    workspaces: [
      { workspaceKey: "api", displayName: "API", absolutePath: "/repo/api", enabled: true }
    ]
  }));

  const loader = new WorkspaceConfigLoader(file);
  assert.equal(loader.load().workspaces[0]?.workspaceKey, "api");
});

test("workspace validator requires directory and .git directory", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workspace-validator-"));
  const workspace = join(dir, "api");
  mkdirSync(workspace);

  const validator = new WorkspaceValidator();
  assert.equal(validator.validate(workspace).ok, false);

  mkdirSync(join(workspace, ".git"));
  assert.deepEqual(validator.validate(workspace), { ok: true, workspacePath: workspace });
});

test("workspace validator accepts git worktree git file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workspace-validator-file-"));
  const workspace = join(dir, "api");
  mkdirSync(workspace);
  writeFileSync(join(workspace, ".git"), "gitdir: /tmp/git-dir\n");

  assert.deepEqual(new WorkspaceValidator().validate(workspace), { ok: true, workspacePath: workspace });
});
