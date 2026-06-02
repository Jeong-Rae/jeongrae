import type { SqliteDatabase } from "../connection/SqliteConnectionFactory.ts";
import type { CodexTurnRepository } from "../../core/turn/CodexTurnRepository.ts";
import type { CodexTurn } from "../../core/turn/CodexTurn.ts";
import type { CodexTurnStatus } from "../../core/turn/CodexTurnStatus.ts";

type TurnRow = {
  codex_turn_id: string;
  codex_conversation_id: string;
  requested_by: string;
  user_message: string;
  status: CodexTurnStatus;
  final_response: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string;
  finished_at: string | null;
};

function fromRow(row: TurnRow): CodexTurn {
  return {
    codexTurnId: row.codex_turn_id,
    codexConversationId: row.codex_conversation_id,
    requestedBy: row.requested_by,
    userMessage: row.user_message,
    status: row.status,
    finalResponse: row.final_response,
    errorMessage: row.error_message,
    createdAt: new Date(row.created_at),
    startedAt: new Date(row.started_at),
    finishedAt: row.finished_at ? new Date(row.finished_at) : null
  };
}

export class SqliteCodexTurnRepository implements CodexTurnRepository {
  public constructor(private readonly db: SqliteDatabase) {}

  public async create(turn: CodexTurn): Promise<void> {
    this.db.prepare(`
      INSERT INTO codex_turn (
        codex_turn_id, codex_conversation_id, requested_by, user_message, status,
        final_response, error_message, created_at, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      turn.codexTurnId,
      turn.codexConversationId,
      turn.requestedBy,
      turn.userMessage,
      turn.status,
      turn.finalResponse,
      turn.errorMessage,
      turn.createdAt.toISOString(),
      turn.startedAt.toISOString(),
      turn.finishedAt?.toISOString() ?? null
    );
  }

  public async listByConversation(codexConversationId: string): Promise<CodexTurn[]> {
    return this.db.prepare("SELECT * FROM codex_turn WHERE codex_conversation_id = ? ORDER BY created_at ASC").all(codexConversationId).map((row: unknown) => fromRow(row as TurnRow));
  }

  public async countRunningByConversation(codexConversationId: string): Promise<number> {
    const row = this.db.prepare("SELECT COUNT(*) AS count FROM codex_turn WHERE codex_conversation_id = ? AND status = 'running'").get(codexConversationId) as { count: number };
    return row.count;
  }

  public async markSucceeded(codexTurnId: string, finalResponse: string, finishedAt: Date): Promise<void> {
    this.db.prepare("UPDATE codex_turn SET status = 'succeeded', final_response = ?, finished_at = ? WHERE codex_turn_id = ?").run(finalResponse, finishedAt.toISOString(), codexTurnId);
  }

  public async markFailed(codexTurnId: string, errorMessage: string, finishedAt: Date): Promise<void> {
    this.db.prepare("UPDATE codex_turn SET status = 'failed', error_message = ?, finished_at = ? WHERE codex_turn_id = ?").run(errorMessage, finishedAt.toISOString(), codexTurnId);
  }
}
