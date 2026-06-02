export type CodexConversationResponse = {
  codexConversationId: string;
  workspaceKey: string;
  workspacePath: string;
  workspaceSource: "absolute_path" | "alias";
  conversationChannelId: string;
  codexThreadId: string;
  status: "idle" | "running" | "closed";
  permissionMode: "default" | "yolo";
  runningTurnCount: number;
  createdAt: string;
  updatedAt: string;
};
