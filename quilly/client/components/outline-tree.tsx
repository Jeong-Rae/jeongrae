"use client";

import { cn } from "@/lib/utils";
import type { Section, SectionStatus } from "@/lib/types";
import { Check, AlertCircle, ChevronRight, Circle } from "lucide-react";

interface OutlineTreeProps {
  sections: Section[];
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
  disabled?: boolean;
}

function StatusBadge({ status }: { status: SectionStatus }) {
  switch (status) {
    case "sufficient":
      return (
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20">
          <Check className="w-2.5 h-2.5 text-emerald-400" />
        </span>
      );
    case "insufficient":
      return (
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20">
          <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
        </span>
      );
    case "active":
      return (
        <span className="flex items-center justify-center w-4 h-4">
          <ChevronRight className="w-3 h-3 text-emerald-400 animate-pulse" />
        </span>
      );
    default:
      return (
        <span className="flex items-center justify-center w-4 h-4">
          <Circle className="w-2 h-2 text-muted-foreground" />
        </span>
      );
  }
}

export function OutlineTree({
  sections,
  activeSection,
  onSectionClick,
  disabled,
}: OutlineTreeProps) {
  return (
    <div className="space-y-1">
      {sections.map((section) => {
        const isActive = section.id === activeSection;
        const isH3 = section.level === "h3";

        return (
          <button
            key={section.id}
            onClick={() => !disabled && onSectionClick?.(section.id)}
            disabled={disabled}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-all",
              isH3 && "ml-4",
              isActive && "bg-emerald-500/10 text-emerald-400",
              !isActive && "text-foreground/80 hover:bg-secondary/50",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <StatusBadge status={section.status} />
            <span className={cn("truncate", isH3 && "text-muted-foreground")}>
              {isH3 ? "└ " : ""}
              {section.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
