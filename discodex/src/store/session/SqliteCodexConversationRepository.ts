import type { SqliteDatabase } from "../connection/SqliteConnectionFactory.ts";
import type { CodexConversationRepository, UpdateModelConfigInput } from "../../core/session/CodexConversationRepository.ts";
import type { CodexConversation } from "../../core/session/CodexConversation.ts";
import type { CodexConversationStatus } from "../../core/session/CodexConversationStatus.ts";
import type { PermissionMode } from "../../core/policy/PermissionMode.ts";
import { isReasoningEffort, type ReasoningEffort } from "../../core/model/ReasoningEffort.ts";

type ConversationRow = {
  codex_conversation_id: string;
  discord_guild_id: string;
  parent_channel_id: string;
  conversation_channel_id: string;
  workspace_key: string;
  workspace_path: string;
  workspace_source: "absolute_path" | "alias";
  codex_thread_id: string;
  status: CodexConversationStatus;
  permission_mode: PermissionMode;
  model: string | null;
  reasoning_effort: ReasoningEffort | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function toRow(conversation: CodexConversation): Record<string, string | null> {
  return {
    codex_conversation_id: conversation.codexConversationId,
    discord_guild_id: conversation.discordGuildId,
    parent_channel_id: conversation.parentChannelId,
    conversation_channel_id: conversation.conversationChannelId,
    workspace_key: conversation.workspaceKey,
    workspace_path: conversation.workspacePath,
    workspace_source: conversation.workspaceSource,
    codex_thread_id: conversation.codexThreadId,
    status: conversation.status,
    permission_mode: conversation.permissionMode,
    model: conversation.model,
    reasoning_effort: conversation.reasoningEffort,
    created_by: conversation.createdBy,
    created_at: conversation.createdAt.toISOString(),
    updated_at: conversation.updatedAt.toISOString()
  };
}

function fromRow(row: ConversationRow): CodexConversation {
  return {
    codexConversationId: row.codex_conversation_id,
    discordGuildId: row.discord_guild_id,
    parentChannelId: row.parent_channel_id,
    conversationChannelId: row.conversation_channel_id,
    workspaceKey: row.workspace_key,
    workspacePath: row.workspace_path,
    workspaceSource: row.workspace_source,
    codexThreadId: row.codex_thread_id,
    status: row.status,
    permissionMode: row.permission_mode,
    model: row.model,
    reasoningEffort: row.reasoning_effort,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

export class SqliteCodexConversationRepository implements CodexConversationRepository {
  public constructor(private readonly db: SqliteDatabase) {}

  public async create(conversation: CodexConversation): Promise<void> {
    this.db.prepare(`
      INSERT INTO codex_conversation (
        codex_conversation_id, discord_guild_id, parent_channel_id, conversation_channel_id,
        workspace_key, workspace_path, workspace_source, codex_thread_id, status, permission_mode, model, reasoning_effort, created_by, created_at, updated_at
      ) VALUES (
        @codex_conversation_id, @discord_guild_id, @parent_channel_id, @conversation_channel_id,
        @workspace_key, @workspace_path, @workspace_source, @codex_thread_id, @status, @permission_mode, @model, @reasoning_effort, @created_by, @created_at, @updated_at
      )
    `).run(toRow(conversation));
  }

  public async list(): Promise<CodexConversation[]> {
    return this.db.prepare("SELECT * FROM codex_conversation ORDER BY created_at DESC").all().map((row: unknown) => fromRow(row as ConversationRow));
  }

  public async findById(codexConversationId: string): Promise<CodexConversation | null> {
    const row = this.db.prepare("SELECT * FROM codex_conversation WHERE codex_conversation_id = ?").get(codexConversationId);
    return row ? fromRow(row as ConversationRow) : null;
  }

  public async findByChannel(discordGuildId: string, conversationChannelId: string): Promise<CodexConversation | null> {
    const row = this.db.prepare("SELECT * FROM codex_conversation WHERE discord_guild_id = ? AND conversation_channel_id = ?").get(discordGuildId, conversationChannelId);
    return row ? fromRow(row as ConversationRow) : null;
  }

  public async tryMarkRunning(codexConversationId: string, updatedAt: Date): Promise<boolean> {
    const result = this.db.prepare(`
      UPDATE codex_conversation
      SET status = 'running', updated_at = ?
      WHERE codex_conversation_id = ?
        AND status = 'idle'
    `).run(updatedAt.toISOString(), codexConversationId);
    return result.changes === 1;
  }

  public async updateStatus(codexConversationId: string, status: CodexConversationStatus, updatedAt: Date): Promise<void> {
    this.db.prepare("UPDATE codex_conversation SET status = ?, updated_at = ? WHERE codex_conversation_id = ?").run(status, updatedAt.toISOString(), codexConversationId);
  }

  public async updatePermissionModeByChannel(discordGuildId: string, conversationChannelId: string, permissionMode: PermissionMode, updatedAt: Date): Promise<CodexConversation | null> {
    this.db.prepare(`
      UPDATE codex_conversation
      SET permission_mode = ?, updated_at = ?
      WHERE discord_guild_id = ? AND conversation_channel_id = ?
    `).run(permissionMode, updatedAt.toISOString(), discordGuildId, conversationChannelId);
    return this.findByChannel(discordGuildId, conversationChannelId);
  }

  public async updateModelConfigByChannel(input: UpdateModelConfigInput): Promise<CodexConversation | null> {
    if (input.reasoningEffort !== undefined && !isReasoningEffort(input.reasoningEffort)) {
      throw new Error(`Invalid reasoning_effort: ${input.reasoningEffort}`);
    }
    const current = await this.findByChannel(input.discordGuildId, input.conversationChannelId);
    if (!current) return null;

    this.db.prepare(`
      UPDATE codex_conversation
      SET model = ?, reasoning_effort = ?, updated_at = ?
      WHERE discord_guild_id = ? AND conversation_channel_id = ?
    `).run(
      input.model === undefined ? current.model : input.model,
      input.reasoningEffort === undefined ? current.reasoningEffort : input.reasoningEffort,
      input.updatedAt.toISOString(),
      input.discordGuildId,
      input.conversationChannelId
    );
    return this.findByChannel(input.discordGuildId, input.conversationChannelId);
  }
}
