import type { PermissionMode } from "../../core/policy/PermissionMode.ts";
import { REASONING_EFFORT_VALUES, type ReasoningEffort } from "../../core/model/ReasoningEffort.ts";
import type { CodexConversationStatus } from "../../core/session/CodexConversationStatus.ts";

const DISCORD_LIMIT = 1800;
const DEFAULT_LABEL = "Codex CLI default";
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

  public renderModelConfig(input: { model: string | null; reasoningEffort: ReasoningEffort | null }): string {
    return `현재 Codex model 설정\n\nModel: ${this.renderModel(input.model)}\nEffort: ${this.renderEffort(input.reasoningEffort)}\n\n변경 예:\n/codex model model:gpt-5.5 effort:high\n\nEffort values: ${EFFORT_VALUES_TEXT}`;
  }

  public renderModelConfigUpdated(input: { model: string | null; reasoningEffort: ReasoningEffort | null }): string {
    return `Codex model 설정을 변경했습니다.\n\nModel: ${this.renderModel(input.model)}\nEffort: ${this.renderEffort(input.reasoningEffort)}\n\n다음 Codex turn부터 적용됩니다.`;
  }

  public renderStatus(input: {
    conversation: {
      codexConversationId: string;
      workspacePath: string;
      workspaceSource: "absolute_path" | "alias";
      permissionMode: PermissionMode;
      status: CodexConversationStatus;
      model: string | null;
      reasoningEffort: ReasoningEffort | null;
    };
    runningTurnCount: number;
    debugUrl: string;
  }): string {
    return `Codex 세션 상태\n\nWorkspace: ${input.conversation.workspacePath}\nSource: ${input.conversation.workspaceSource}\nPermission: ${input.conversation.permissionMode}\nStatus: ${input.conversation.status}\nRunning turns: ${input.runningTurnCount}\nModel: ${this.renderModel(input.conversation.model)}\nEffort: ${this.renderEffort(input.conversation.reasoningEffort)}\n\nDebug: ${input.debugUrl}`;
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

  private renderModel(model: string | null): string {
    return model ?? DEFAULT_LABEL;
  }

  private renderEffort(reasoningEffort: ReasoningEffort | null): string {
    return reasoningEffort ?? DEFAULT_LABEL;
  }
}
