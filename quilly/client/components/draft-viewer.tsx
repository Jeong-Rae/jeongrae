"use client"
import type { Section } from "@/lib/types"

interface DraftViewerProps {
  draft: string
  sections: Section[]
  onSectionClick?: (sectionId: string) => void
}

export function DraftViewer({ draft, sections, onSectionClick }: DraftViewerProps) {
  return (
    <div className="prose prose-invert prose-emerald max-w-none">
      <div className="p-6 rounded-lg bg-secondary/20 border border-border">
        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90 leading-relaxed">
          {draft || "초안이 아직 생성되지 않았습니다."}
        </pre>
      </div>
    </div>
  )
}
