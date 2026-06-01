import { readFileSync } from "node:fs";
import { WorkspaceConfigSchema, type WorkspaceConfig } from "../validation/WorkspaceConfigSchema.ts";

export class WorkspaceConfigLoader {
  public constructor(private readonly path: string) {}

  public load(): WorkspaceConfig {
    return WorkspaceConfigSchema.parse(JSON.parse(readFileSync(this.path, "utf8")));
  }
}
