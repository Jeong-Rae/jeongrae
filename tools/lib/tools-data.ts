import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { toolIdFromName } from "./id";
import { Tool, ToolData, ToolsSchema } from "./schema";

const toolsDataPath = path.join(process.cwd(), "data", "tools.yaml");

function attachToolIds(tools: ToolData[]): Tool[] {
  const seen = new Map<string, string>();
  const errors: string[] = [];

  const toolsWithId = tools.map((tool) => {
    const id = toolIdFromName(tool.name);
    const existing = seen.get(id);
    if (existing) {
      errors.push(`- id="${id}" 중복: "${existing}" / "${tool.name}"`);
    } else {
      seen.set(id, tool.name);
    }
    return { ...tool, id };
  });

  if (errors.length > 0) {
    throw new Error(
      `[tools.yaml] 중복된 id가 있습니다. name hash 충돌을 확인하세요.\n${errors.join("\n")}`,
    );
  }

  return toolsWithId;
}

export async function getToolsData(): Promise<Tool[]> {
  const raw = await fs.readFile(toolsDataPath, "utf8");
  const parsed = parse(raw);

  const result = ToolsSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`[tools.yaml] Invalid schema: ${result.error.message}`);
  }

  return attachToolIds(result.data);
}
