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
  }

  private run002WorkspaceSource(dir: string): void {
    const rows = this.db.prepare("PRAGMA table_info(codex_conversation)").all() as Array<{ name: string }>;
    if (rows.some((row) => row.name === "workspace_source")) return;

    const migrationPath = join(dir, "002_workspace_source.sql");
    if (existsSync(migrationPath)) {
      this.db.exec(readFileSync(migrationPath, "utf8"));
    }
  }
}
