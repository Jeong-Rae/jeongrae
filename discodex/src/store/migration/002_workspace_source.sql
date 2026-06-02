ALTER TABLE codex_conversation
ADD COLUMN workspace_source TEXT NOT NULL DEFAULT 'alias';
