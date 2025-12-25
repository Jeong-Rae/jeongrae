import { z } from "zod";

export const ToolStatusSchema = z.enum(["public", "internal", "blocked"]);

export const ToolDataSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    url: z.string().url(),
    status: ToolStatusSchema,

    note: z.string().min(1).optional(),
    iconUrl: z.string().min(1).optional(),
  })
  .strict();

export const ToolsSchema = z.array(ToolDataSchema);

export type ToolStatus = z.infer<typeof ToolStatusSchema>;
export type ToolData = z.infer<typeof ToolDataSchema>;
export type Tool = ToolData & { id: string };
