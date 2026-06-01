import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

export type WorkspaceValidationResult =
  | { ok: true; workspacePath: string }
  | { ok: false; reason: string };

export class WorkspaceValidator {
  public validate(workspacePath: string): WorkspaceValidationResult {
    if (!existsSync(workspacePath)) return { ok: false, reason: "workspace_path_not_found" };
    if (!statSync(workspacePath).isDirectory()) return { ok: false, reason: "workspace_path_not_directory" };
    const gitPath = join(workspacePath, ".git");
    if (!existsSync(gitPath)) return { ok: false, reason: "workspace_path_not_git_repository" };
    const gitStat = statSync(gitPath);
    if (!gitStat.isDirectory() && !gitStat.isFile()) return { ok: false, reason: "workspace_path_not_git_repository" };
    return { ok: true, workspacePath };
  }
}
