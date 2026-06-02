import type { CodexConversation } from "../session/CodexConversation.ts";
import type { CodexEffectiveModelConfig, CodexRuntimeStatus } from "./CodexRuntimeStatus.ts";

export type RuntimeStatusInput = {
  codexThreadId: string;
  workspacePath: string;
  permissionMode: CodexConversation["permissionMode"];
  modelOverride: string | null;
  reasoningEffortOverride: CodexConversation["reasoningEffort"];
};

export type RuntimeStatusResult =
  | { ok: true; status: CodexRuntimeStatus }
  | { ok: false; reason: string; sessionId: string };

export type EffectiveModelConfigInput = RuntimeStatusInput & {
  codexConversationId: string;
};

export type CodexRuntimeStatusProvider = {
  getStatus(input: RuntimeStatusInput): Promise<RuntimeStatusResult>;
  getEffectiveModelConfig(input: EffectiveModelConfigInput): Promise<CodexEffectiveModelConfig>;
};
