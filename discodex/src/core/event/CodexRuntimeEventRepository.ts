import type { CodexRuntimeEvent } from "./CodexRuntimeEvent.ts";

export type CodexRuntimeEventRepository = {
  create(event: CodexRuntimeEvent): Promise<void>;
  listByConversation(codexConversationId: string): Promise<CodexRuntimeEvent[]>;
};
