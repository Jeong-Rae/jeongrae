export type RunCodexTurnResponse =
  | { status: "succeeded"; codexConversationId: string; codexTurnId: string; finalResponse: string }
  | { status: "failed"; codexConversationId: string; codexTurnId: string; errorMessage: string }
  | { status: "busy"; message: string }
  | { status: "not_found"; message: string };
