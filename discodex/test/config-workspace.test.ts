import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { createCodexEnvironment, createThreadOptions } from "../src/clients/codex/CodexSdkClientFactory.ts";
import { EnvironmentConfigLoader } from "../src/config/loader/EnvironmentConfigLoader.ts";
import { WorkspaceConfigLoader } from "../src/config/loader/WorkspaceConfigLoader.ts";
import { WorkspaceRegistry } from "../src/runtime/workspace/WorkspaceRegistry.ts";
import { WorkspaceValidator } from "../src/runtime/workspace/WorkspaceValidator.ts";

test("environment loader validates required values and applies defaults without Codex auth overrides", () => {
  const loader = new EnvironmentConfigLoader({
    DISCORD_BOT_TOKEN: "discord-token",
    DISCORD_APPLICATION_ID: "app-id",
    DISCORD_GUILD_ID: "guild-id"
  });

  assert.deepEqual(loader.load(), {
    discordBotToken: "discord-token",
    discordApplicationId: "app-id",
    discordGuildId: "guild-id",
    openaiApiKey: undefined,
    databasePath: "./data/codex-discord-agent.sqlite",
    httpPort: 3000,
    workspaceConfigPath: "./config/workspaces.json",
    codexHome: undefined
  });
});

test("environment loader preserves optional Codex auth overrides when provided", () => {
  const loader = new EnvironmentConfigLoader({
    DISCORD_BOT_TOKEN: "discord-token",
    DISCORD_APPLICATION_ID: "app-id",
    DISCORD_GUILD_ID: "guild-id",
    OPENAI_API_KEY: "openai-key",
    CODEX_HOME: "/tmp/codex-home"
  });

  assert.deepEqual(loader.load(), {
    discordBotToken: "discord-token",
    discordApplicationId: "app-id",
    discordGuildId: "guild-id",
    openaiApiKey: "openai-key",
    databasePath: "./data/codex-discord-agent.sqlite",
    httpPort: 3000,
    workspaceConfigPath: "./config/workspaces.json",
    codexHome: "/tmp/codex-home"
  });
});

test("Codex SDK environment is only overridden when CODEX_HOME is explicit", () => {
  assert.equal(createCodexEnvironment(undefined), undefined);
  assert.equal(createCodexEnvironment(""), undefined);
  assert.deepEqual(createCodexEnvironment("/tmp/codex-home", { PATH: "/bin" }), {
    PATH: "/bin",
    CODEX_HOME: "/tmp/codex-home"
  });
});

test("Codex SDK thread options include configured model values only when set", () => {
  assert.deepEqual(createThreadOptions("/tmp/api", "default", {}), {
    workingDirectory: "/tmp/api",
    approvalPolicy: "on-request",
    sandboxMode: "workspace-write"
  });
  assert.deepEqual(createThreadOptions("/tmp/api", "yolo", { model: "gpt-5.5", reasoningEffort: "high" }), {
    workingDirectory: "/tmp/api",
    approvalPolicy: "never",
    sandboxMode: "danger-full-access",
    model: "gpt-5.5",
    modelReasoningEffort: "high"
  });
});

test("workspace registry resolves aliases and absolute paths", () => {
  const registry = new WorkspaceRegistry([
    { workspaceKey: "api", displayName: "API", absolutePath: "/repo/api", enabled: true },
    { workspaceKey: "web", displayName: "Web", absolutePath: "/repo/web", enabled: false }
  ]);

  assert.equal(registry.get("api")?.workspaceKey, "api");
  assert.equal(registry.get("web"), null);
  assert.deepEqual(registry.resolve("api"), { workspaceKey: "api", displayName: "API", workspacePath: "/repo/api", source: "alias" });
  assert.deepEqual(registry.resolve("/repo/api"), { workspaceKey: "path_repo_api", displayName: "api", workspacePath: "/repo/api", source: "absolute_path" });
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

test("workspace validator requires an existing directory", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workspace-validator-"));
  const workspace = join(dir, "api");
  mkdirSync(workspace);

  const validator = new WorkspaceValidator();
  assert.deepEqual(validator.validate(workspace), { ok: true, workspacePath: workspace });
  assert.equal(validator.validate(join(dir, "missing")).ok, false);
});
