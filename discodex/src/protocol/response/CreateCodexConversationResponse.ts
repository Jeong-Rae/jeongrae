import type { CodexConversation } from "../../core/session/CodexConversation.ts";

export type CreateCodexConversationResponse =
  | { ok: true; conversation: CodexConversation }
  | { ok: false; reason: string; availableWorkspaceKeys: string[] };
