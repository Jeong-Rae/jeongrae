import { existsSync, statSync } from "node:fs";

export type WorkspaceValidationResult =
  | { ok: true; workspacePath: string }
  | { ok: false; reason: string };

export class WorkspaceValidator {
  public validate(workspacePath: string): WorkspaceValidationResult {
    if (!existsSync(workspacePath)) return { ok: false, reason: "workspace_path_not_found" };
    if (!statSync(workspacePath).isDirectory()) return { ok: false, reason: "workspace_path_not_directory" };
    return { ok: true, workspacePath };
  }
}
