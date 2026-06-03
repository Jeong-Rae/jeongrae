import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REASONING_EFFORT_VALUES, isReasoningEffort } from "../../core/model/ReasoningEffort.ts";
import type { CodexEffectiveModelConfig, CodexRuntimeStatus } from "../../core/status/CodexRuntimeStatus.ts";
import type { CodexRuntimeStatusProvider, EffectiveModelConfigInput, RuntimeStatusInput, RuntimeStatusResult } from "../../core/status/CodexRuntimeStatusProvider.ts";

const DEFAULT_SELECTABLE_MODELS = ["gpt-5.5", "gpt-5.4", "gpt-5.4-mini"];
const FIVE_HOUR_WINDOW_MINS = 5 * 60;
const WEEKLY_WINDOW_MINS = 7 * 24 * 60;
const WINDOW_MATCH_TOLERANCE_MINS = 5;
const CONTEXT_BASELINE_TOKENS = 12_000;

type CodexRateLimitWindow = {
  usedPercent: number;
  windowDurationMins?: number | null;
  resetsAt?: number | null;
};

type CodexRateLimitSnapshot = {
  limitId?: string | null;
  limitName?: string | null;
  primary?: CodexRateLimitWindow | null;
  secondary?: CodexRateLimitWindow | null;
};

type CodexRateLimitsResponse = {
  rateLimits: CodexRateLimitSnapshot;
  rateLimitsByLimitId?: Record<string, CodexRateLimitSnapshot>;
};

type CodexTokenUsageBreakdown = {
  totalTokens: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
};

type CodexThreadTokenUsage = {
  total: CodexTokenUsageBreakdown;
  last: CodexTokenUsageBreakdown;
  modelContextWindow: number | null;
};

export type CodexAppServerRpcClient = {
  getAccountRateLimits(): Promise<CodexRateLimitsResponse>;
  getThreadTokenUsage(threadId: string): Promise<CodexThreadTokenUsage | null>;
};

type RuntimeStatusClientOptions = {
  appServerRpcClient?: CodexAppServerRpcClient;
  now?: () => Date;
};

export class LocalCodexRuntimeStatusClient implements CodexRuntimeStatusProvider {
  private readonly appServerRpcClient: CodexAppServerRpcClient;
  private readonly now: () => Date;

  public constructor(
    private readonly codexHome: string = process.env.CODEX_HOME || join(process.env.HOME || "", ".codex"),
    private readonly selectableModels: string[] = DEFAULT_SELECTABLE_MODELS,
    options: RuntimeStatusClientOptions = {}
  ) {
    this.appServerRpcClient = options.appServerRpcClient ?? new CodexAppServerStdioRpcClient(codexHome);
    this.now = options.now ?? (() => new Date());
  }

  public async getStatus(input: RuntimeStatusInput): Promise<RuntimeStatusResult> {
    const config = this.readConfig();
    const account = this.readAccount();
    const model = input.modelOverride ?? config.model;
    const reasoningEffort = input.reasoningEffortOverride ?? config.reasoningEffort;
    const rateLimits = await this.readRateLimits();
    const contextWindow = await this.readContextWindow(input.codexThreadId);
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
        contextWindow,
        fiveHourLimit: rateLimits.fiveHourLimit,
        weeklyLimit: rateLimits.weeklyLimit
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

  private async readRateLimits(): Promise<Pick<CodexRuntimeStatus, "fiveHourLimit" | "weeklyLimit">> {
    try {
      const response = await this.appServerRpcClient.getAccountRateLimits();
      return mapRateLimits(response.rateLimits, this.now());
    } catch {
      return {
        fiveHourLimit: { percentLeft: null, resetsAtText: null },
        weeklyLimit: { percentLeft: null, resetsAtText: null }
      };
    }
  }

  private async readContextWindow(codexThreadId: string): Promise<CodexRuntimeStatus["contextWindow"]> {
    try {
      const tokenUsage = await this.appServerRpcClient.getThreadTokenUsage(codexThreadId);
      return mapContextWindow(tokenUsage);
    } catch {
      return { percentLeft: null, usedTokens: null, totalTokens: null };
    }
  }
}

class CodexAppServerStdioRpcClient implements CodexAppServerRpcClient {
  public constructor(
    private readonly codexHome: string,
    private readonly timeoutMs = 15_000
  ) {}

  public async getAccountRateLimits(): Promise<CodexRateLimitsResponse> {
    return this.requestAppServer<CodexRateLimitsResponse>({
      method: "account/rateLimits/read",
      id: 2,
      timeoutMs: this.timeoutMs
    });
  }

  public async getThreadTokenUsage(threadId: string): Promise<CodexThreadTokenUsage | null> {
    return this.requestAppServer<CodexThreadTokenUsage | null>({
      method: "thread/resume",
      id: 2,
      params: { threadId },
      timeoutMs: this.timeoutMs,
      afterResponseTimeoutMs: 250,
      resolveFromNotification: (message) => {
        if (!isJsonRpcNotification(message, "thread/tokenUsage/updated")) return undefined;
        const params = message.params as { threadId?: unknown; tokenUsage?: unknown };
        if (params.threadId !== threadId) return undefined;
        return params.tokenUsage as CodexThreadTokenUsage;
      },
      fallbackAfterResponse: null
    });
  }

  private async requestAppServer<T>(input: {
    method: string;
    id: number;
    params?: unknown;
    timeoutMs: number;
    afterResponseTimeoutMs?: number;
    resolveFromNotification?: (message: Record<string, unknown>) => T | undefined;
    fallbackAfterResponse?: T;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      const child = spawn("codex", ["app-server", "--stdio"], {
        env: { ...process.env, CODEX_HOME: this.codexHome },
        stdio: ["pipe", "pipe", "pipe"]
      });
      let stdoutBuffer = "";
      let stderrBuffer = "";
      let settled = false;
      let afterResponseTimer: NodeJS.Timeout | undefined;
      const timer = setTimeout(() => {
        finish(new Error(`Codex app-server ${input.method} request timed out`));
      }, input.timeoutMs);

      const finish = (error: Error | null, response?: T) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (afterResponseTimer) clearTimeout(afterResponseTimer);
        child.kill();
        if (error) {
          reject(error);
        } else {
          resolve(response as T);
        }
      };

      child.on("error", (error) => finish(error));
      child.on("exit", (code) => {
        if (!settled && code !== 0) {
          finish(new Error(`Codex app-server exited before ${input.method} response: ${stderrBuffer.trim() || code}`));
        }
      });
      child.stderr?.on("data", (chunk: Buffer) => {
        stderrBuffer += chunk.toString("utf8");
        stderrBuffer = stderrBuffer.slice(-2000);
      });
      child.stdout?.on("data", (chunk: Buffer) => {
        stdoutBuffer += chunk.toString("utf8");
        const lines = stdoutBuffer.split(/\r?\n/);
        stdoutBuffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let message: unknown;
          try {
            message = JSON.parse(line);
          } catch {
            continue;
          }
          if (input.resolveFromNotification && isJsonRpcObject(message)) {
            const notificationResult = input.resolveFromNotification(message);
            if (notificationResult !== undefined) {
              finish(null, notificationResult);
              return;
            }
          }
          if (isJsonRpcResponse(message, input.id)) {
            if ("error" in message) {
              finish(new Error(jsonRpcErrorMessage(message.error)));
              return;
            }
            if (!input.resolveFromNotification) {
              finish(null, message.result as T);
              return;
            }
            if (input.fallbackAfterResponse !== undefined) {
              afterResponseTimer = setTimeout(() => {
                finish(null, input.fallbackAfterResponse);
              }, input.afterResponseTimeoutMs ?? 250);
            }
          }
        }
      });

      child.stdin?.write(`${JSON.stringify({
        method: "initialize",
        id: 1,
        params: {
          clientInfo: {
            name: "discodex",
            title: "Discodex",
            version: "0.1.0"
          }
        }
      })}\n`);
      child.stdin?.write(`${JSON.stringify({ method: "initialized", params: {} })}\n`);
      child.stdin?.write(`${JSON.stringify({
        method: input.method,
        id: input.id,
        ...(input.params === undefined ? {} : { params: input.params })
      })}\n`);
    });
  }
}

function mapRateLimits(snapshot: CodexRateLimitSnapshot, now: Date): Pick<CodexRuntimeStatus, "fiveHourLimit" | "weeklyLimit"> {
  const windows = [snapshot.primary, snapshot.secondary].filter((window): window is CodexRateLimitWindow => Boolean(window));
  return {
    fiveHourLimit: mapLimitWindow(windows.find((window) => windowMatches(window.windowDurationMins, FIVE_HOUR_WINDOW_MINS)), now),
    weeklyLimit: mapLimitWindow(windows.find((window) => windowMatches(window.windowDurationMins, WEEKLY_WINDOW_MINS)), now)
  };
}

function mapLimitWindow(window: CodexRateLimitWindow | undefined, now: Date): CodexRuntimeStatus["fiveHourLimit"] {
  if (!window) return { percentLeft: null, resetsAtText: null };
  return {
    percentLeft: Math.round(clamp(100 - window.usedPercent, 0, 100)),
    resetsAtText: typeof window.resetsAt === "number" ? formatResetTimestamp(new Date(window.resetsAt * 1000), now) : null
  };
}

function mapContextWindow(tokenUsage: CodexThreadTokenUsage | null): CodexRuntimeStatus["contextWindow"] {
  if (!tokenUsage || typeof tokenUsage.modelContextWindow !== "number") {
    return { percentLeft: null, usedTokens: null, totalTokens: null };
  }
  const usedTokens = tokenUsage.last.totalTokens;
  return {
    percentLeft: percentOfContextWindowRemaining(usedTokens, tokenUsage.modelContextWindow),
    usedTokens,
    totalTokens: tokenUsage.modelContextWindow
  };
}

function percentOfContextWindowRemaining(usedTokens: number, contextWindow: number): number {
  if (contextWindow <= CONTEXT_BASELINE_TOKENS) return 0;
  const effectiveWindow = contextWindow - CONTEXT_BASELINE_TOKENS;
  const effectiveUsed = Math.max(usedTokens - CONTEXT_BASELINE_TOKENS, 0);
  const remaining = Math.max(effectiveWindow - effectiveUsed, 0);
  return Math.round(clamp((remaining / effectiveWindow) * 100, 0, 100));
}

function windowMatches(actual: number | null | undefined, expected: number): boolean {
  return typeof actual === "number" && Math.abs(actual - expected) <= WINDOW_MATCH_TOLERANCE_MINS;
}

function formatResetTimestamp(resetAt: Date, now: Date): string {
  const time = `${pad2(resetAt.getHours())}:${pad2(resetAt.getMinutes())}`;
  if (
    resetAt.getFullYear() === now.getFullYear()
    && resetAt.getMonth() === now.getMonth()
    && resetAt.getDate() === now.getDate()
  ) {
    return time;
  }
  return `${time} on ${resetAt.getDate()} ${monthName(resetAt.getMonth())}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function monthName(monthIndex: number): string {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex] ?? "";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isJsonRpcResponse(value: unknown, id: number): value is { id: number; result?: unknown; error?: unknown } {
  return typeof value === "object" && value !== null && "id" in value && (value as { id: unknown }).id === id;
}

function isJsonRpcNotification(value: unknown, method: string): value is { method: string; params: unknown } {
  return isJsonRpcObject(value) && value.method === method && "params" in value;
}

function isJsonRpcObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function jsonRpcErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Codex app-server request failed";
}

function readTomlString(contents: string, key: string): string | null {
  const match = contents.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"));
  return match?.[1] ?? null;
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
