// scripts/validate-tools.ts
import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { ToolsSchema } from "../lib/schema";
import { toolIdFromName } from "../lib/id";

async function main() {
  const toolsDataPath = path.join(process.cwd(), "data", "tools.yaml");
  const raw = await fs.readFile(toolsDataPath, "utf8");
  const parsed = parse(raw);

  const result = ToolsSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[tools.yaml] 스키마 검증 실패");
    console.error(result.error.format());
    process.exit(1);
  }

  const tools = result.data;
  const seen = new Map<string, string>();
  const errors: string[] = [];

  for (const tool of tools) {
    const id = toolIdFromName(tool.name);
    const existing = seen.get(id);
    if (existing) {
      errors.push(`- id="${id}" 중복: "${existing}" / "${tool.name}"`);
    } else {
      seen.set(id, tool.name);
    }
  }

  if (errors.length > 0) {
    console.error(
      "[tools.yaml] id 규칙 검증 실패: name hash 충돌 또는 중복 name이 있습니다.",
    );
    console.error(errors.join("\n"));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[tools.yaml] 검증 중 예외 발생", e);
  process.exit(1);
});
