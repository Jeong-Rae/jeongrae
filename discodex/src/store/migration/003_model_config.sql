ALTER TABLE codex_conversation
ADD COLUMN model TEXT;

ALTER TABLE codex_conversation
ADD COLUMN reasoning_effort TEXT
CHECK (reasoning_effort IS NULL OR reasoning_effort IN ('minimal', 'low', 'medium', 'high', 'xhigh'));
