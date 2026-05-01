const fs = require("fs/promises");
const path = require("path");

const LOG_PATH = path.join(__dirname, "hooks_log.jsonl");

async function readStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8").trim();
}

async function appendHookLog() {
  const rawInput = await readStdin();
  let payload;

  try {
    payload = JSON.parse(rawInput);
  } catch (error) {
    payload = {
      hook_event_name: process.argv[2] ?? "unknown",
      raw_stdin: rawInput,
      parse_error: error instanceof Error ? error.message : String(error),
    };
  }

  const hookEventName =
    typeof payload?.hook_event_name === "string" && payload.hook_event_name.length > 0
      ? payload.hook_event_name
      : process.argv[2] ?? "unknown";

  const record = {
    message: "codex hook invoked",
    called_at: new Date().toISOString(),
    hook_event_name: hookEventName,
    payload,
  };

  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  await fs.appendFile(LOG_PATH, `${JSON.stringify(record)}\n`, "utf8");
}

appendHookLog()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`codex hook logger error: ${message}\n`);
  })
  .finally(() => {
    process.exit(0);
  });
