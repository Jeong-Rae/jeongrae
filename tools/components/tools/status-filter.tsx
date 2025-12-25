"use client"

import { cn } from "@/lib/utils"
import type { ToolStatus } from "./tool-card"

type FilterStatus = ToolStatus | "all"

interface StatusFilterProps {
  currentFilter: FilterStatus
  onFilterChange: (status: FilterStatus) => void
  counts: Record<FilterStatus, number>
}

const filters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
  { value: "blocked", label: "Blocked" },
]

export function StatusFilter({ currentFilter, onFilterChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            currentFilter === filter.value
              ? "bg-emerald-600 text-white"
              : "bg-muted text-muted-foreground hover:bg-emerald-100 hover:text-emerald-800",
          )}
        >
          {filter.label}
          <span className="ml-1.5 text-xs opacity-70">({counts[filter.value]})</span>
        </button>
      ))}
    </div>
  )
}
