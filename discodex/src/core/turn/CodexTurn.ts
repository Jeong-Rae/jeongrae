import type { CodexConversationId, CodexTurnId, DiscordUserId } from "../session/CodexConversation.ts";
import type { CodexTurnStatus } from "./CodexTurnStatus.ts";

export type CodexTurn = {
  codexTurnId: CodexTurnId;
  codexConversationId: CodexConversationId;
  requestedBy: DiscordUserId;
  userMessage: string;
  status: CodexTurnStatus;
  finalResponse: string | null;
  errorMessage: string | null;
  createdAt: Date;
  startedAt: Date;
  finishedAt: Date | null;
};
