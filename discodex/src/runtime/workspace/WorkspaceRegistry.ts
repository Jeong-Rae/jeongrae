import { basename, isAbsolute, normalize, sep } from "node:path";
import type { ResolvedWorkspace, WorkspaceDefinition } from "./WorkspaceDefinition.ts";

export class WorkspaceRegistry {
  private readonly enabledByKey: Map<string, WorkspaceDefinition>;

  public constructor(workspaces: WorkspaceDefinition[]) {
    this.enabledByKey = new Map(workspaces.filter((workspace) => workspace.enabled).map((workspace) => [workspace.workspaceKey, workspace]));
  }

  public get(workspaceKey: string): WorkspaceDefinition | null {
    return this.enabledByKey.get(workspaceKey) ?? null;
  }

  public resolve(cwd: string): ResolvedWorkspace | null {
    if (isAbsolute(cwd)) {
      return {
        workspaceKey: pathSafeWorkspaceKey(cwd),
        displayName: basename(normalize(cwd)) || cwd,
        workspacePath: cwd,
        source: "absolute_path"
      };
    }

    const workspace = this.get(cwd);
    if (!workspace) return null;
    return {
      workspaceKey: workspace.workspaceKey,
      displayName: workspace.displayName,
      workspacePath: workspace.absolutePath,
      source: "alias"
    };
  }

  public listAvailableKeys(): string[] {
    return Array.from(this.enabledByKey.keys()).sort();
  }
}

function pathSafeWorkspaceKey(workspacePath: string): string {
  const parts = workspacePath.split(sep).filter(Boolean);
  if (parts.length === 0) return "path_root";
  return `path_${parts.map((part) => part.replace(/[^A-Za-z0-9_-]+/g, "_")).join("_")}`;
}
