import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REASONING_EFFORT_VALUES, isReasoningEffort } from "../../core/model/ReasoningEffort.ts";
import type { CodexEffectiveModelConfig, CodexRuntimeStatus } from "../../core/status/CodexRuntimeStatus.ts";
import type { CodexRuntimeStatusProvider, EffectiveModelConfigInput, RuntimeStatusInput, RuntimeStatusResult } from "../../core/status/CodexRuntimeStatusProvider.ts";

const DEFAULT_SELECTABLE_MODELS = ["gpt-5.5", "gpt-5.4", "gpt-5.4-mini"];

export class LocalCodexRuntimeStatusClient implements CodexRuntimeStatusProvider {
  public constructor(
    private readonly codexHome: string = process.env.CODEX_HOME || join(process.env.HOME || "", ".codex"),
    private readonly selectableModels: string[] = DEFAULT_SELECTABLE_MODELS
  ) {}

  public async getStatus(input: RuntimeStatusInput): Promise<RuntimeStatusResult> {
    const config = this.readConfig();
    const account = this.readAccount();
    const model = input.modelOverride ?? config.model;
    const reasoningEffort = input.reasoningEffortOverride ?? config.reasoningEffort;
    return {
      ok: true,
      status: {
        model,
        reasoningEffort,
        reasoningSummaries: config.reasoningSummaries,
        directory: input.workspacePath,
        permissions: input.permissionMode === "yolo" ? "Full Access" : "On Request",
        agentsMd: this.findAgentsMd(input.workspacePath),
        accountEmail: account.email,
        accountPlan: account.plan,
        collaborationMode: config.collaborationMode,
        sessionId: input.codexThreadId,
        contextWindow: { percentLeft: null, usedTokens: null, totalTokens: null },
        fiveHourLimit: { percentLeft: null, resetsAtText: null },
        weeklyLimit: { percentLeft: null, resetsAtText: null }
      }
    };
  }

  public async getEffectiveModelConfig(input: EffectiveModelConfigInput): Promise<CodexEffectiveModelConfig> {
    const config = this.readConfig();
    const currentModel = input.modelOverride ?? config.model;
    const currentReasoningEffort = input.reasoningEffortOverride ?? config.reasoningEffort;
    return {
      codexConversationId: input.codexConversationId,
      currentModel,
      currentModelUnavailableReason: currentModel ? null : "effective model not available",
      currentReasoningEffort,
      currentReasoningEffortUnavailableReason: currentReasoningEffort ? null : "effective reasoning effort not available",
      currentReasoningSummaries: config.reasoningSummaries,
      currentReasoningSummariesUnavailableReason: config.reasoningSummaries ? null : "reasoning summaries setting not available",
      modelOverride: input.modelOverride,
      reasoningEffortOverride: input.reasoningEffortOverride,
      selectableModels: this.selectableModels,
      selectableEfforts: [...REASONING_EFFORT_VALUES]
    };
  }

  private readConfig(): { model: string | null; reasoningEffort: typeof REASONING_EFFORT_VALUES[number] | null; reasoningSummaries: string | null; collaborationMode: string | null } {
    const configPath = join(this.codexHome, "config.toml");
    if (!existsSync(configPath)) {
      return { model: null, reasoningEffort: null, reasoningSummaries: null, collaborationMode: null };
    }
    const contents = readFileSync(configPath, "utf8");
    const model = readTomlString(contents, "model");
    const effort = readTomlString(contents, "model_reasoning_effort");
    return {
      model,
      reasoningEffort: effort && isReasoningEffort(effort) ? effort : null,
      reasoningSummaries: readTomlString(contents, "model_reasoning_summary") ?? readTomlString(contents, "model_reasoning_summaries") ?? "auto",
      collaborationMode: readTomlString(contents, "collaboration_mode") ?? "Default"
    };
  }

  private readAccount(): { email: string | null; plan: string | null } {
    const authPath = join(this.codexHome, "auth.json");
    if (!existsSync(authPath)) return { email: null, plan: null };
    try {
      const auth = JSON.parse(readFileSync(authPath, "utf8")) as { tokens?: { id_token?: string } };
      const idToken = auth.tokens?.id_token;
      if (!idToken) return { email: null, plan: null };
      const payload = JSON.parse(Buffer.from(idToken.split(".")[1] ?? "", "base64url").toString()) as {
        email?: string;
        "https://api.openai.com/auth"?: { chatgpt_plan_type?: string };
      };
      const plan = payload["https://api.openai.com/auth"]?.chatgpt_plan_type;
      return {
        email: payload.email ?? null,
        plan: plan ? capitalize(plan) : null
      };
    } catch {
      return { email: null, plan: null };
    }
  }

  private findAgentsMd(workspacePath: string): string | null {
    const candidates = [
      join(this.codexHome, "AGENTS.md"),
      join(workspacePath, "AGENTS.md")
    ];
    return candidates.find((candidate) => existsSync(candidate)) ?? null;
  }
}

function readTomlString(contents: string, key: string): string | null {
  const match = contents.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"));
  return match?.[1] ?? null;
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
