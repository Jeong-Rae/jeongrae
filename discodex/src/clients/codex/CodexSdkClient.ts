import type { CodexThreadId, WorkspacePath } from "../../core/session/CodexConversation.ts";
import type { PermissionMode } from "../../core/policy/PermissionMode.ts";

export type RunCodexInput = {
  codexThreadId: CodexThreadId;
  workspacePath: WorkspacePath;
  permissionMode: PermissionMode;
  message: string;
};

export type RunCodexOutput = {
  finalResponse: string;
  runtimeEvents?: Array<{
    eventType: string;
    payloadJson: string;
  }>;
};

export type StartCodexThreadInput = {
  workspacePath: WorkspacePath;
  permissionMode: PermissionMode;
};

export type StartCodexThreadOutput = {
  codexThreadId: CodexThreadId;
};

export type CodexSdkClient = {
  startThread(input: StartCodexThreadInput): Promise<StartCodexThreadOutput>;
  run(input: RunCodexInput): Promise<RunCodexOutput>;
};

export class CodexSdkStreamError extends Error {
  public constructor(
    message: string,
    public readonly runtimeEvents: Array<{ eventType: string; payloadJson: string }>
  ) {
    super(message);
    this.name = "CodexSdkStreamError";
  }
}
