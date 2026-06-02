import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SqliteDatabase } from "../connection/SqliteConnectionFactory.ts";

export class MigrationRunner {
  public constructor(private readonly db: SqliteDatabase) {}

  public run(): void {
    const dir = dirname(fileURLToPath(import.meta.url));
    this.db.exec(readFileSync(join(dir, "001_init.sql"), "utf8"));
    this.run002WorkspaceSource(dir);
    this.run003ModelConfig(dir);
  }

  private run002WorkspaceSource(dir: string): void {
    const rows = this.db.prepare("PRAGMA table_info(codex_conversation)").all() as Array<{ name: string }>;
    if (rows.some((row) => row.name === "workspace_source")) return;

    const migrationPath = join(dir, "002_workspace_source.sql");
    if (existsSync(migrationPath)) {
      this.db.exec(readFileSync(migrationPath, "utf8"));
    }
  }

  private run003ModelConfig(dir: string): void {
    const rows = this.db.prepare("PRAGMA table_info(codex_conversation)").all() as Array<{ name: string }>;
    if (rows.some((row) => row.name === "model") && rows.some((row) => row.name === "reasoning_effort")) return;

    const migrationPath = join(dir, "003_model_config.sql");
    if (existsSync(migrationPath)) {
      this.db.exec(readFileSync(migrationPath, "utf8"));
    }
  }
}
