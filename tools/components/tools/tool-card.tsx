"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ToolStatus = "public" | "internal" | "blocked"

export interface Tool {
  id: string
  name: string
  description: string
  iconUrl?: string
  url: string
  status: ToolStatus
  note?: string
}

interface ToolCardProps {
  tool: Tool
}

const statusConfig: Record<ToolStatus, { label: string; className: string }> = {
  public: {
    label: "Public",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  internal: {
    label: "Internal",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
}

export function ToolCard({ tool }: ToolCardProps) {
  const [iconError, setIconError] = useState(false)
  const isBlocked = tool.status === "blocked"
  const config = statusConfig[tool.status]

  const handleOpen = () => {
    if (!isBlocked) {
      window.open(tool.url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Card className={cn("relative transition-all duration-200 hover:shadow-md", isBlocked && "opacity-60")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center overflow-hidden">
            {tool.iconUrl && !iconError ? (
              <img
                src={tool.iconUrl || "/placeholder.svg"}
                alt={`${tool.name} icon`}
                className="w-6 h-6 object-contain"
                onError={() => setIconError(true)}
              />
            ) : (
              <span className="text-lg font-semibold text-emerald-600">{tool.name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Status Badge */}
          <Badge variant="secondary" className={cn("text-xs font-medium", config.className)}>
            {config.label}
          </Badge>
        </div>

        {/* Tool Name */}
        <h3 className="font-semibold text-foreground mb-1 text-base">{tool.name}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{tool.description}</p>

        {/* Action Button */}
        <Button
          onClick={handleOpen}
          disabled={isBlocked}
          className={cn("w-full", !isBlocked && "bg-emerald-600 hover:bg-emerald-700 text-white")}
        >
          {isBlocked ? "Disabled" : "Open"}
          {!isBlocked && <ExternalLink className="w-4 h-4 ml-2" />}
        </Button>

        {/* Note (Blocked only) */}
        {isBlocked && tool.note && <p className="mt-3 text-xs text-muted-foreground text-center">{tool.note}</p>}
      </CardContent>
    </Card>
  )
}
