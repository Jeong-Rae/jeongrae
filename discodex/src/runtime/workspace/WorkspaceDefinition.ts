export type WorkspaceSource = "absolute_path" | "alias";

export type WorkspaceDefinition = {
  workspaceKey: string;
  displayName: string;
  absolutePath: string;
  enabled: boolean;
};

export type ResolveWorkspaceInput = {
  cwd: string;
};

export type ResolvedWorkspace = {
  workspaceKey: string;
  displayName: string;
  workspacePath: string;
  source: WorkspaceSource;
};
