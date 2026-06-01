declare module "better-sqlite3" {
  export type RunResult = {
    changes: number;
    lastInsertRowid: number | bigint;
  };

  export type Statement = {
    run(...params: unknown[]): RunResult;
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
  };

  export type Database = {
    pragma(source: string): unknown;
    exec(source: string): void;
    prepare(source: string): Statement;
  };

  export default class BetterSqlite3 {
    public constructor(path: string);
    public pragma(source: string): unknown;
    public exec(source: string): void;
    public prepare(source: string): Statement;
  }
}
