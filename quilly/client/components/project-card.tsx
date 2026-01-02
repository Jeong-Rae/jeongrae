"use client";
import { type Project, BLOG_TYPES, PHASES } from "@/lib/types";
import { Clock, ChevronRight } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const typeLabel =
    BLOG_TYPES.find((t) => t.id === project.type)?.label || "미정";
  const phaseLabel =
    PHASES.find((p) => p.id === project.phase)?.label || "Type";

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg bg-card border border-border hover:border-emerald-500/50 transition-all text-left group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate group-hover:text-emerald-400 transition-colors">
            {project.title || "제목 없음"}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {typeLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              Phase: {phaseLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{project.updatedAt.toLocaleDateString("ko-KR")}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
      </div>
    </button>
  );
}
