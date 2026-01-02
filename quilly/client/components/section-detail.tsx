"use client";

import type { Section } from "@/lib/types";
import { FileText, ImageIcon, CheckCircle2 } from "lucide-react";

interface SectionDetailProps {
  section: Section;
}

export function SectionDetail({ section }: SectionDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
            {section.level === "h2" ? "Section" : "Subsection"}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          {section.title}
        </h2>
      </div>

      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              섹션 목적
            </p>
            <p className="text-sm text-foreground/80">{section.purpose}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              필요 정보
            </p>
            <ul className="space-y-2">
              {section.requiredInfo.map((info, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-foreground/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {info}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {section.recommendedImages && section.recommendedImages.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                권장 이미지
              </p>
              <div className="flex flex-wrap gap-2">
                {section.recommendedImages.map((img, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  >
                    {img}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
