import type { CodexTurn } from "./CodexTurn.ts";

export type CodexTurnRepository = {
  create(turn: CodexTurn): Promise<void>;
  listByConversation(codexConversationId: string): Promise<CodexTurn[]>;
  countRunningByConversation(codexConversationId: string): Promise<number>;
  markSucceeded(codexTurnId: string, finalResponse: string, finishedAt: Date): Promise<void>;
  markFailed(codexTurnId: string, errorMessage: string, finishedAt: Date): Promise<void>;
};
