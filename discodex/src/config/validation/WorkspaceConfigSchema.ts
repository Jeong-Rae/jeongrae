import { z } from "zod";

export const WorkspaceDefinitionSchema = z.object({
  workspaceKey: z.string().min(1),
  displayName: z.string().min(1),
  absolutePath: z.string().min(1),
  enabled: z.boolean()
});

export const WorkspaceConfigSchema = z.object({
  workspaces: z.array(WorkspaceDefinitionSchema)
});

export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>;
