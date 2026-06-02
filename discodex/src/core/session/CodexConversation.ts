import type { PermissionMode } from "../policy/PermissionMode.ts";
import type { CodexConversationStatus } from "./CodexConversationStatus.ts";

export type DiscordGuildId = string;
export type DiscordChannelId = string;
export type DiscordUserId = string;

export type CodexConversationId = string;
export type CodexThreadId = string;
export type CodexTurnId = string;

export type WorkspaceKey = string;
export type WorkspacePath = string;
export type WorkspaceSource = "absolute_path" | "alias";

export type CodexConversation = {
  codexConversationId: CodexConversationId;
  discordGuildId: DiscordGuildId;
  parentChannelId: DiscordChannelId;
  conversationChannelId: DiscordChannelId;
  workspaceKey: WorkspaceKey;
  workspacePath: WorkspacePath;
  workspaceSource: WorkspaceSource;
  codexThreadId: CodexThreadId;
  status: CodexConversationStatus;
  permissionMode: PermissionMode;
  createdBy: DiscordUserId;
  createdAt: Date;
  updatedAt: Date;
};
