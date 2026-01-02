"use client";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jeongrae/ui";
import {
  ArrowRight,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  BLOG_TYPES,
  type BlogType,
  type Phase,
  type Section,
} from "@/lib/types";

interface AgentPanelProps {
  phase: Phase;
  currentSection?: Section;
  previousSectionSummary?: string;
  blogType?: BlogType | null;
  onTypeChange?: (type: BlogType) => void;
  onGenerateLayout?: () => void;
  onStartInterview?: () => void;
  onSubmitNote?: () => void;
  onNextSection?: () => void;
  onStartRefine?: () => void;
  onGenerateDraft?: () => void;
  onExport?: () => void;
  onCopy?: () => void;
  canProceed?: boolean;
  isLoading?: boolean;
  missingInfo?: string[];
  agentQuestion?: string;
  typeReason?: string;
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
      <AgentPanelHeader />
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        <AgentPanelContent
          phase={phase}
          currentSection={currentSection}
          previousSectionSummary={previousSectionSummary}
          blogType={blogType}
          onTypeChange={onTypeChange}
          missingInfo={missingInfo}
          agentQuestion={agentQuestion}
          typeReason={typeReason}
        />
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <AgentPanelActions
          phase={phase}
          blogType={blogType}
          onGenerateLayout={onGenerateLayout}
          onStartInterview={onStartInterview}
          onSubmitNote={onSubmitNote}
          onNextSection={onNextSection}
          onStartRefine={onStartRefine}
          onGenerateDraft={onGenerateDraft}
          onExport={onExport}
          onCopy={onCopy}
          canProceed={canProceed}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function AgentPanelHeader() {
  return (
    <div className="flex items-center gap-2 pb-4 border-b border-border">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20">
        <Sparkles className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">AI Agent</h3>
        <p className="text-xs text-muted-foreground">Writing Assistant</p>
      </div>
    </div>
  );
}

interface AgentPanelContentProps {
  phase: Phase;
  currentSection?: Section;
  previousSectionSummary?: string;
  blogType?: BlogType | null;
  onTypeChange?: (type: BlogType) => void;
  missingInfo: string[];
  agentQuestion?: string;
  typeReason?: string;
}

function AgentPanelContent({
  phase,
  currentSection,
  previousSectionSummary,
  blogType,
  onTypeChange,
  missingInfo,
  agentQuestion,
  typeReason,
}: AgentPanelContentProps) {
  switch (phase) {
    case "type":
      return (
        <TypeSelectionSection
          blogType={blogType}
          onTypeChange={onTypeChange}
          typeReason={typeReason}
        />
      );
    case "layout":
      return <LayoutNotice />;
    case "interview":
      if (!currentSection) return null;
      return (
        <InterviewSection
          currentSection={currentSection}
          previousSectionSummary={previousSectionSummary}
          missingInfo={missingInfo}
          agentQuestion={agentQuestion}
        />
      );
    case "refine":
      return <RefineNotice />;
    case "draft":
      return <DraftOptions />;
    default:
      return null;
  }
}

interface TypeSelectionSectionProps {
  blogType?: BlogType | null;
  onTypeChange?: (type: BlogType) => void;
  typeReason?: string;
}

function TypeSelectionSection({
  blogType,
  onTypeChange,
  typeReason,
}: TypeSelectionSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          추론된 글 타입
        </label>
        <Select
          value={blogType ?? undefined}
          onValueChange={(value) => onTypeChange?.(value as BlogType)}
        >
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="글 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            {BLOG_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex flex-col">
                  <span>{type.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {type.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {typeReason && <TypeReasonCard reason={typeReason} />}
    </>
  );
}

function TypeReasonCard({ reason }: { reason: string }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 text-sm">
      <p className="text-xs text-muted-foreground mb-1">추론 근거</p>
      <p className="text-foreground/80">{reason}</p>
    </div>
  );
}

function LayoutNotice() {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 text-sm">
      <p className="text-emerald-400 font-medium mb-2">레이아웃 생성 완료</p>
      <p className="text-foreground/70 text-xs">
        왼쪽 Outline에서 각 섹션의 구조를 확인하세요. 섹션을 클릭하면 상세
        정보를 볼 수 있습니다.
      </p>
    </div>
  );
}

interface InterviewSectionProps {
  currentSection: Section;
  previousSectionSummary?: string;
  missingInfo: string[];
  agentQuestion?: string;
}

function InterviewSection({
  currentSection,
  previousSectionSummary,
  missingInfo,
  agentQuestion,
}: InterviewSectionProps) {
  return (
    <>
      {previousSectionSummary && (
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm">
          <p className="text-xs text-emerald-400/70 mb-1">이전 단락 요약</p>
          <p className="text-foreground/70 text-xs">{previousSectionSummary}</p>
        </div>
      )}
      <RequiredInfoCard requiredInfo={currentSection.requiredInfo} />
      {agentQuestion && <AgentQuestionCard question={agentQuestion} />}
      {missingInfo.length > 0 && <MissingInfoCard missingInfo={missingInfo} />}
    </>
  );
}

function RequiredInfoCard({ requiredInfo }: { requiredInfo: string[] }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 text-sm">
      <p className="text-xs text-muted-foreground mb-2">
        이 단락에 필요한 정보
      </p>
      <ul className="space-y-1">
        {requiredInfo.map((info) => (
          <li key={info} className="flex items-start gap-2 text-foreground/80">
            <span className="text-emerald-400 mt-1">•</span>
            {info}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AgentQuestionCard({ question }: { question: string }) {
  return (
    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm">
      <p className="text-emerald-400">{question}</p>
    </div>
  );
}

function MissingInfoCard({ missingInfo }: { missingInfo: string[] }) {
  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
      <p className="text-xs text-amber-400 mb-2">부족한 정보</p>
      <ul className="space-y-1">
        {missingInfo.map((info) => (
          <li key={info} className="text-foreground/70 text-xs">
            • {info}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RefineNotice() {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 text-sm">
      <p className="text-emerald-400 font-medium mb-2">정보 수집 완료</p>
      <p className="text-foreground/70 text-xs">
        모든 단락의 정보가 수집되었습니다. 레이아웃 정제를 실행하여 최적의 글
        구조를 확인하세요.
      </p>
    </div>
  );
}

function DraftOptions() {
  return (
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
  );
}

interface AgentPanelActionsProps {
  phase: Phase;
  blogType?: BlogType | null;
  onGenerateLayout?: () => void;
  onStartInterview?: () => void;
  onSubmitNote?: () => void;
  onNextSection?: () => void;
  onStartRefine?: () => void;
  onGenerateDraft?: () => void;
  onExport?: () => void;
  onCopy?: () => void;
  canProceed?: boolean;
  isLoading?: boolean;
}

function AgentPanelActions({
  phase,
  blogType,
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
}: AgentPanelActionsProps) {
  switch (phase) {
    case "type":
      return (
        <Button
          onClick={onGenerateLayout}
          disabled={!blogType || isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          레이아웃 생성
        </Button>
      );
    case "layout":
      return (
        <Button
          onClick={onStartInterview}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          인터뷰 시작
        </Button>
      );
    case "interview":
      return (
        <>
          <Button
            onClick={onSubmitNote}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
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
      );
    case "refine":
      return (
        <>
          <Button
            onClick={onStartRefine}
            disabled={isLoading}
            variant="outline"
            className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            레이아웃 정제
          </Button>
          <Button
            onClick={onGenerateDraft}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            초안 생성
          </Button>
        </>
      );
    case "draft":
      return (
        <>
          <Button
            onClick={onGenerateDraft}
            disabled={isLoading}
            variant="outline"
            className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            재생성
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={onCopy}
              variant="outline"
              className="flex-1 border-border bg-transparent"
            >
              <Copy className="w-4 h-4 mr-2" />
              복사
            </Button>
            <Button
              onClick={onExport}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </>
      );
    default:
      return null;
  }
}
