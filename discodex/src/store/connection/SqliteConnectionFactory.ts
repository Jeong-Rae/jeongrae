import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import Database, { type Database as BetterSqliteDatabase } from "better-sqlite3";

export type SqliteDatabase = BetterSqliteDatabase;

export class SqliteConnectionFactory {
  public constructor(private readonly databasePath: string) {}

  public create(): SqliteDatabase {
    if (this.databasePath !== ":memory:") {
      mkdirSync(dirname(this.databasePath), { recursive: true });
    }
    const db = new Database(this.databasePath);
    db.pragma("foreign_keys = ON");
    return db;
  }
}
