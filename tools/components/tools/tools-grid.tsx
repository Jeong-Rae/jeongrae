import { ToolCard, type Tool } from "./tool-card"

interface ToolsGridProps {
  tools: Tool[]
}

export function ToolsGrid({ tools }: ToolsGridProps) {
  if (tools.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No tools available for this status.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  )
}
