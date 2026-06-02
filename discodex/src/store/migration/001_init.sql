CREATE TABLE IF NOT EXISTS codex_conversation (
  codex_conversation_id TEXT PRIMARY KEY,

  discord_guild_id TEXT NOT NULL,
  parent_channel_id TEXT NOT NULL,
  conversation_channel_id TEXT NOT NULL,

  workspace_key TEXT NOT NULL,
  workspace_path TEXT NOT NULL,
  workspace_source TEXT NOT NULL,

  codex_thread_id TEXT NOT NULL,

  status TEXT NOT NULL,
  permission_mode TEXT NOT NULL,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(discord_guild_id, conversation_channel_id)
);

CREATE TABLE IF NOT EXISTS codex_turn (
  codex_turn_id TEXT PRIMARY KEY,
  codex_conversation_id TEXT NOT NULL,

  requested_by TEXT NOT NULL,
  user_message TEXT NOT NULL,

  status TEXT NOT NULL,

  final_response TEXT,
  error_message TEXT,

  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,

  FOREIGN KEY(codex_conversation_id)
    REFERENCES codex_conversation(codex_conversation_id)
);

CREATE TABLE IF NOT EXISTS codex_runtime_event (
  codex_runtime_event_id TEXT PRIMARY KEY,
  codex_conversation_id TEXT NOT NULL,
  codex_turn_id TEXT,

  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,

  created_at TEXT NOT NULL,

  FOREIGN KEY(codex_conversation_id)
    REFERENCES codex_conversation(codex_conversation_id),

  FOREIGN KEY(codex_turn_id)
    REFERENCES codex_turn(codex_turn_id)
);

CREATE INDEX IF NOT EXISTS idx_codex_conversation_channel
  ON codex_conversation(discord_guild_id, conversation_channel_id);

CREATE INDEX IF NOT EXISTS idx_codex_turn_conversation
  ON codex_turn(codex_conversation_id);

CREATE INDEX IF NOT EXISTS idx_codex_runtime_event_conversation
  ON codex_runtime_event(codex_conversation_id);
