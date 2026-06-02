import type { SqliteDatabase } from "../connection/SqliteConnectionFactory.ts";
import type { CodexRuntimeEventRepository } from "../../core/event/CodexRuntimeEventRepository.ts";
import type { CodexRuntimeEvent } from "../../core/event/CodexRuntimeEvent.ts";

type EventRow = {
  codex_runtime_event_id: string;
  codex_conversation_id: string;
  codex_turn_id: string;
  event_type: string;
  payload_json: string;
  created_at: string;
};

function fromRow(row: EventRow): CodexRuntimeEvent {
  return {
    codexRuntimeEventId: row.codex_runtime_event_id,
    codexConversationId: row.codex_conversation_id,
    codexTurnId: row.codex_turn_id,
    eventType: row.event_type,
    payloadJson: row.payload_json,
    createdAt: new Date(row.created_at)
  };
}

export class SqliteCodexRuntimeEventRepository implements CodexRuntimeEventRepository {
  public constructor(private readonly db: SqliteDatabase) {}

  public async create(event: CodexRuntimeEvent): Promise<void> {
    this.db.prepare(`
      INSERT INTO codex_runtime_event (
        codex_runtime_event_id, codex_conversation_id, codex_turn_id, event_type, payload_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      event.codexRuntimeEventId,
      event.codexConversationId,
      event.codexTurnId,
      event.eventType,
      event.payloadJson,
      event.createdAt.toISOString()
    );
  }

  public async listByConversation(codexConversationId: string): Promise<CodexRuntimeEvent[]> {
    return this.db.prepare("SELECT * FROM codex_runtime_event WHERE codex_conversation_id = ? ORDER BY created_at ASC").all(codexConversationId).map((row: unknown) => fromRow(row as EventRow));
  }
}
