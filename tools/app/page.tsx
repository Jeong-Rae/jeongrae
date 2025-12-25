import { ToolsPageClient } from "@/components/tools/tools-page-client";
import { getToolsData } from "@/lib/tools-data";

export default async function ToolsPage() {
  const tools = await getToolsData();
  return <ToolsPageClient tools={tools} />;
}
