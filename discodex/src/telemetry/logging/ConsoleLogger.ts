import type { LogFields, Logger } from "./Logger.ts";

export function redactSecrets(value: unknown, secrets: string[]): unknown {
  const activeSecrets = secrets.filter((secret) => secret.length > 0);
  if (typeof value === "string") {
    return activeSecrets.reduce((text, secret) => text.split(secret).join("REDACTED"), value);
  }
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item, activeSecrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactSecrets(item, activeSecrets)]));
  }
  return value;
}

export class ConsoleLogger implements Logger {
  public constructor(
    private readonly secrets: string[] = [],
    private readonly writeLine: (line: string) => void = console.log
  ) {}

  public info(message: string, fields: LogFields = {}): void {
    this.write("info", message, fields);
  }

  public error(message: string, fields: LogFields = {}): void {
    this.write("error", message, fields);
  }

  private write(level: "info" | "error", message: string, fields: LogFields): void {
    const payload = redactSecrets({ level, message, ...fields, createdAt: new Date().toISOString() }, this.secrets);
    this.writeLine(JSON.stringify(payload));
  }
}
