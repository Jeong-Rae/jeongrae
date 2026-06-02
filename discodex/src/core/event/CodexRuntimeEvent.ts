import type { CodexConversationId, CodexTurnId } from "../session/CodexConversation.ts";

export type CodexRuntimeEvent = {
  codexRuntimeEventId: string;
  codexConversationId: CodexConversationId;
  codexTurnId: CodexTurnId;
  eventType: string;
  payloadJson: string;
  createdAt: Date;
};
