export type LogFields = Record<string, unknown>;

export type Logger = {
  info(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
};
