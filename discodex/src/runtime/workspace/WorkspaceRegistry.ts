import type { WorkspaceDefinition } from "./WorkspaceDefinition.ts";

export class WorkspaceRegistry {
  private readonly enabledByKey: Map<string, WorkspaceDefinition>;

  public constructor(workspaces: WorkspaceDefinition[]) {
    this.enabledByKey = new Map(workspaces.filter((workspace) => workspace.enabled).map((workspace) => [workspace.workspaceKey, workspace]));
  }

  public get(workspaceKey: string): WorkspaceDefinition | null {
    return this.enabledByKey.get(workspaceKey) ?? null;
  }

  public listAvailableKeys(): string[] {
    return Array.from(this.enabledByKey.keys()).sort();
  }
}
