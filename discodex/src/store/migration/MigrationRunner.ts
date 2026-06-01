import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SqliteDatabase } from "../connection/SqliteConnectionFactory.ts";

export class MigrationRunner {
  public constructor(private readonly db: SqliteDatabase) {}

  public run(): void {
    const dir = dirname(fileURLToPath(import.meta.url));
    this.db.exec(readFileSync(join(dir, "001_init.sql"), "utf8"));
  }
}
