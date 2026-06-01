import type { PermissionMode } from "../../core/policy/PermissionMode.ts";

const DISCORD_LIMIT = 1800;

export class DiscordMessageRenderer {
  public constructor(private readonly debugBaseUrl: string) {}

  public renderConversationCreated(workspaceKey: string, permissionMode: PermissionMode): string {
    return `Codex 세션이 생성되었습니다.\n\nWorkspace: ${workspaceKey}\nMode: ${permissionMode}\n\n이 thread에서 @CodexBot 으로 요청하세요.\n\n예:\n@CodexBot 로그인 테스트 실패 원인 찾아줘`;
  }

  public renderRunStarted(): string {
    return "Codex 작업을 시작했습니다.";
  }

  public renderRunSucceeded(finalResponse: string, codexConversationId: string): string {
    const header = "Codex 응답\n\n";
    const full = `${header}${finalResponse}`;
    if (full.length <= DISCORD_LIMIT) return full;
    const suffix = `\n\n응답이 길어 앞부분만 표시합니다. 전체 응답은 Web Debug UI에서 확인하세요.\n${this.debugBaseUrl}/?conversation=${codexConversationId}`;
    return `${header}${finalResponse.slice(0, DISCORD_LIMIT - header.length - suffix.length)}${suffix}`;
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

  public renderBusy(): string {
    return "현재 이 Codex 세션에서 작업이 진행 중입니다.\n완료 후 다시 요청해주세요.";
  }

  public renderInvalidWorkspace(availableKeys: string[]): string {
    return `등록된 workspace alias와 일치하지 않습니다.\n\n사용 가능한 workspace:\n${availableKeys.join(", ") || "(none)"}`;
  }
}
