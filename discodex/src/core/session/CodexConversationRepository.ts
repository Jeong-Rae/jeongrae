import type { PermissionMode } from "../policy/PermissionMode.ts";
import type { CodexConversationStatus } from "./CodexConversationStatus.ts";
import type { CodexConversation } from "./CodexConversation.ts";
import type { ReasoningEffort } from "../model/ReasoningEffort.ts";

export type UpdateModelConfigInput = {
  discordGuildId: string;
  conversationChannelId: string;
  model?: string;
  reasoningEffort?: ReasoningEffort;
  updatedAt: Date;
};

export type CodexConversationRepository = {
  create(conversation: CodexConversation): Promise<void>;
  list(): Promise<CodexConversation[]>;
  findById(codexConversationId: string): Promise<CodexConversation | null>;
  findByChannel(discordGuildId: string, conversationChannelId: string): Promise<CodexConversation | null>;
  tryMarkRunning(codexConversationId: string, updatedAt: Date): Promise<boolean>;
  updateStatus(codexConversationId: string, status: CodexConversationStatus, updatedAt: Date): Promise<void>;
  updatePermissionModeByChannel(discordGuildId: string, conversationChannelId: string, permissionMode: PermissionMode, updatedAt: Date): Promise<CodexConversation | null>;
  updateModelConfigByChannel(input: UpdateModelConfigInput): Promise<CodexConversation | null>;
};
