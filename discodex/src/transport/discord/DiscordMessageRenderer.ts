import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import type { PermissionMode } from "../../core/policy/PermissionMode.ts";
import { REASONING_EFFORT_VALUES, type ReasoningEffort } from "../../core/model/ReasoningEffort.ts";
import type { CodexEffectiveModelConfig, CodexRuntimeStatus } from "../../core/status/CodexRuntimeStatus.ts";

const DISCORD_LIMIT = 1800;
const EFFORT_VALUES_TEXT = REASONING_EFFORT_VALUES.join(", ");

export class DiscordMessageRenderer {
  public constructor(private readonly debugBaseUrl: string) {}

  public renderConversationCreated(input: {
    workspaceKey: string;
    workspacePath: string;
    workspaceSource: "absolute_path" | "alias";
    permissionMode: PermissionMode;
  }): string {
    const workspaceLine = input.workspaceSource === "absolute_path"
      ? `Workspace: ${input.workspacePath}`
      : `Workspace: ${input.workspaceKey}\nPath: ${input.workspacePath}`;
    return `Codex 세션이 생성되었습니다.\n\n${workspaceLine}\nSource: ${input.workspaceSource}\nMode: ${input.permissionMode}\n\n이 thread에서 @CodexBot 으로 요청하세요.\n\n예:\n@CodexBot 이 프로젝트 구조를 요약해줘`;
  }

  public renderConversationCreatedReply(workspaceKey: string, guildId: string, threadId: string): string {
    return `${workspaceKey} workspace에 대한 Codex 세션을 생성했습니다.\n\nThread: https://discord.com/channels/${guildId}/${threadId}`;
  }

  public renderRunStarted(): string {
    return "Codex 작업을 시작했습니다.";
  }

  public renderRunSucceeded(finalResponse: string, codexConversationId: string): string {
    if (finalResponse.length <= DISCORD_LIMIT) return finalResponse;
    const suffix = `\n\n응답이 길어 앞부분만 표시합니다. 전체 응답은 Web Debug UI에서 확인하세요.\n${this.debugBaseUrl}/?conversation=${codexConversationId}`;
    return `${finalResponse.slice(0, DISCORD_LIMIT - suffix.length)}${suffix}`;
  }

  public renderRunFailed(errorMessage: string): string {
    return `Codex 실행 중 오류가 발생했습니다.\n\nError:\n${errorMessage}`;
  }

  public renderYoloEnabled(): string {
    return "현재 Codex 세션이 yolo mode로 전환되었습니다.\n\n이후 실행은 approval 없이 더 넓은 권한으로 동작할 수 있습니다.\n신뢰할 수 있는 workspace에서만 사용하세요.";
  }

  public renderNoConversation(): string {
    return "이 channel에는 연결된 Codex 세션이 없습니다.\n\n먼저 다음 명령으로 세션을 생성하세요.\n/codex new <cwd>";
  }

  public renderModelConfigInteractive(input: CodexEffectiveModelConfig): {
    content: string;
    components: Array<ActionRowBuilder<StringSelectMenuBuilder>>;
  } {
    return {
      content: `Codex model 설정\n\nCurrent model: ${this.renderUnavailable(input.currentModel, input.currentModelUnavailableReason)}\nCurrent effort: ${this.renderUnavailable(input.currentReasoningEffort, input.currentReasoningEffortUnavailableReason)}\nReasoning summaries: ${this.renderUnavailable(input.currentReasoningSummaries, input.currentReasoningSummariesUnavailableReason)}\n\nModel override: ${input.modelOverride ?? "not set"}\nEffort override: ${input.reasoningEffortOverride ?? "not set"}\n\nSelect a model or effort below.`,
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`codex:model:model:${input.codexConversationId}`)
            .setPlaceholder("Select model")
            .addOptions(this.selectOptions(input.selectableModels))
        ),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`codex:model:effort:${input.codexConversationId}`)
            .setPlaceholder("Select reasoning effort")
            .addOptions(this.selectOptions(input.selectableEfforts))
        )
      ]
    };
  }

  public renderModelConfigUpdated(input: { config: CodexEffectiveModelConfig }): string {
    return `Codex model 설정을 변경했습니다.\n\nModel: ${this.renderUnavailable(input.config.currentModel, input.config.currentModelUnavailableReason)}\nEffort: ${this.renderUnavailable(input.config.currentReasoningEffort, input.config.currentReasoningEffortUnavailableReason)}\n\n다음 Codex turn부터 적용됩니다.`;
  }

  public renderRuntimeStatus(input: CodexRuntimeStatus): string {
    return `Codex Status\n\nModel:              ${this.renderRuntimeModel(input)}\nDirectory:          ${this.renderUnavailable(input.directory, "directory data not available")}\nPermissions:        ${this.renderUnavailable(input.permissions, "permission data not available")}\nAgents.md:          ${this.renderUnavailable(input.agentsMd, "AGENTS.md data not available")}\nAccount:            ${this.renderAccount(input)}\nCollaboration mode: ${this.renderUnavailable(input.collaborationMode, "collaboration mode data not available")}\nSession:            ${input.sessionId}\n\nContext window:     ${this.renderContextWindow(input.contextWindow)}\n5h limit:           ${this.renderLimit(input.fiveHourLimit, "5h limit data not available")}\nWeekly limit:       ${this.renderLimit(input.weeklyLimit, "weekly limit data not available")}`;
  }

  public renderStatusUnavailable(input: { reason: string; sessionId: string }): string {
    return `Codex status를 조회할 수 없습니다.\n\nReason: ${input.reason}\nSession: ${input.sessionId}`;
  }

  public renderInvalidEffort(): string {
    return `허용되지 않는 reasoning effort 값입니다.\n\nEffort values: ${EFFORT_VALUES_TEXT}`;
  }

  public renderInvalidModel(): string {
    return "model 값은 비어 있을 수 없습니다.";
  }

  public renderInvalidWorkspace(availableKeys: string[]): string {
    return `등록된 workspace alias와 일치하지 않습니다.\n\n사용 가능한 workspace:\n${availableKeys.join(", ") || "(none)"}`;
  }

  private renderRuntimeModel(input: CodexRuntimeStatus): string {
    if (!input.model) return "Unavailable: model data not available";
    const effort = input.reasoningEffort ?? "Unavailable";
    const summaries = input.reasoningSummaries ?? "Unavailable";
    return `${input.model} (reasoning ${effort}, summaries ${summaries})`;
  }

  private renderAccount(input: CodexRuntimeStatus): string {
    if (!input.accountEmail) return "Unavailable: account data not available";
    return input.accountPlan ? `${input.accountEmail} (${input.accountPlan})` : input.accountEmail;
  }

  private renderContextWindow(input: CodexRuntimeStatus["contextWindow"]): string {
    if (input.percentLeft === null || input.usedTokens === null || input.totalTokens === null) {
      return "Unavailable: context window data not available";
    }
    return `${input.percentLeft}% left (${this.formatTokens(input.usedTokens)} used / ${this.formatTokens(input.totalTokens)})`;
  }

  private renderLimit(input: { percentLeft: number | null; resetsAtText: string | null }, unavailableReason: string): string {
    if (input.percentLeft === null || input.resetsAtText === null) return `Unavailable: ${unavailableReason}`;
    return `${input.percentLeft}% left (resets ${input.resetsAtText})`;
  }

  private renderUnavailable(value: string | null, reason: string | null): string {
    return value ?? `Unavailable: ${reason ?? "value not available"}`;
  }

  private formatTokens(tokens: number): string {
    if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
    return String(tokens);
  }

  private selectOptions(values: readonly string[]): Array<{ label: string; value: string }> {
    const options = values.slice(0, 25).map((value) => ({ label: value, value }));
    return options.length > 0 ? options : [{ label: "Unavailable", value: "unavailable" }];
  }
}
