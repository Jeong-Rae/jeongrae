"use client"
import { Button } from "@jeongrae/ui"
import { type Section, type Phase, type BlogType, BLOG_TYPES } from "@/lib/types"
import { Sparkles, ArrowRight, RefreshCw, Download, Copy, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jeongrae/ui"

interface AgentPanelProps {
  phase: Phase
  currentSection?: Section
  previousSectionSummary?: string
  blogType?: BlogType | null
  onTypeChange?: (type: BlogType) => void
  onGenerateLayout?: () => void
  onStartInterview?: () => void
  onSubmitNote?: () => void
  onNextSection?: () => void
  onStartRefine?: () => void
  onGenerateDraft?: () => void
  onExport?: () => void
  onCopy?: () => void
  canProceed?: boolean
  isLoading?: boolean
  missingInfo?: string[]
  agentQuestion?: string
  typeReason?: string
}

export function AgentPanel({
  phase,
  currentSection,
  previousSectionSummary,
  blogType,
  onTypeChange,
  onGenerateLayout,
  onStartInterview,
  onSubmitNote,
  onNextSection,
  onStartRefine,
  onGenerateDraft,
  onExport,
  onCopy,
  canProceed = false,
  isLoading = false,
  missingInfo = [],
  agentQuestion,
  typeReason,
}: AgentPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI Agent</h3>
          <p className="text-xs text-muted-foreground">Writing Assistant</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Phase 1: Type Selection */}
        {phase === "type" && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                추론된 글 타입
              </label>
              <Select value={blogType || undefined} onValueChange={(v) => onTypeChange?.(v as BlogType)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="글 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {typeReason && (
              <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                <p className="text-xs text-muted-foreground mb-1">추론 근거</p>
                <p className="text-foreground/80">{typeReason}</p>
              </div>
            )}
          </>
        )}

        {/* Phase 2: Layout */}
        {phase === "layout" && (
          <div className="p-3 rounded-lg bg-secondary/50 text-sm">
            <p className="text-emerald-400 font-medium mb-2">레이아웃 생성 완료</p>
            <p className="text-foreground/70 text-xs">
              왼쪽 Outline에서 각 섹션의 구조를 확인하세요. 섹션을 클릭하면 상세 정보를 볼 수 있습니다.
            </p>
          </div>
        )}

        {/* Phase 3: Interview */}
        {phase === "interview" && currentSection && (
          <>
            {previousSectionSummary && (
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm">
                <p className="text-xs text-emerald-400/70 mb-1">이전 단락 요약</p>
                <p className="text-foreground/70 text-xs">{previousSectionSummary}</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="text-xs text-muted-foreground mb-2">이 단락에 필요한 정보</p>
              <ul className="space-y-1">
                {currentSection.requiredInfo.map((info, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/80">
                    <span className="text-emerald-400 mt-1">•</span>
                    {info}
                  </li>
                ))}
              </ul>
            </div>
            {agentQuestion && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm">
                <p className="text-emerald-400">{agentQuestion}</p>
              </div>
            )}
            {missingInfo.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
                <p className="text-xs text-amber-400 mb-2">부족한 정보</p>
                <ul className="space-y-1">
                  {missingInfo.map((info, i) => (
                    <li key={i} className="text-foreground/70 text-xs">
                      • {info}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Phase 4: Refine */}
        {phase === "refine" && (
          <div className="p-3 rounded-lg bg-secondary/50 text-sm">
            <p className="text-emerald-400 font-medium mb-2">정보 수집 완료</p>
            <p className="text-foreground/70 text-xs">
              모든 단락의 정보가 수집되었습니다. 레이아웃 정제를 실행하여 최적의 글 구조를 확인하세요.
            </p>
          </div>
        )}

        {/* Phase 5: Draft */}
        {phase === "draft" && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="text-xs text-muted-foreground mb-2">생성 옵션</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-foreground/70">톤</span>
                  <span className="text-emerald-400">기술 문서</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/70">형식</span>
                  <span className="text-emerald-400">Markdown</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-border space-y-2">
        {phase === "type" && (
          <Button
            onClick={onGenerateLayout}
            disabled={!blogType || isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            레이아웃 생성
          </Button>
        )}

        {phase === "layout" && (
          <Button onClick={onStartInterview} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            <ArrowRight className="w-4 h-4 mr-2" />
            인터뷰 시작
          </Button>
        )}

        {phase === "interview" && (
          <>
            <Button
              onClick={onSubmitNote}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              메모 제출 & 평가
            </Button>
            <Button
              onClick={onNextSection}
              disabled={!canProceed}
              variant="outline"
              className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              다음 섹션
            </Button>
          </>
        )}

        {phase === "refine" && (
          <>
            <Button
              onClick={onStartRefine}
              disabled={isLoading}
              variant="outline"
              className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              레이아웃 정제
            </Button>
            <Button onClick={onGenerateDraft} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              초안 생성
            </Button>
          </>
        )}

        {phase === "draft" && (
          <>
            <Button
              onClick={onGenerateDraft}
              disabled={isLoading}
              variant="outline"
              className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              재생성
            </Button>
            <div className="flex gap-2">
              <Button onClick={onCopy} variant="outline" className="flex-1 border-border bg-transparent">
                <Copy className="w-4 h-4 mr-2" />
                복사
              </Button>
              <Button onClick={onExport} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
