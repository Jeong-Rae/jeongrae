"use client";

import { Input, Textarea } from "@jeongrae/ui";
import { Check, Loader2 } from "lucide-react";

import type { BlogType, Phase, Project, Section } from "@/lib/types";
import { useAgentFlow } from "@/hook/useAgentFlow";
import { AgentPanel } from "./agent-panel";
import { DraftViewer } from "./draft-viewer";
import { NotesEditor } from "./notes-editor";
import { OutlineTree } from "./outline-tree";
import { PhaseStepper } from "./phase-stepper";
import { SectionDetail } from "./section-detail";

interface WritingWorkspaceProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
  onBack: () => void;
}

export function WritingWorkspace({
  project,
  onProjectUpdate,
  onBack,
}: WritingWorkspaceProps) {
  const {
    phase,
    title,
    brief,
    blogType,
    sections,
    draft,
    saveStatus,
    activeSection,
    currentSection,
    currentNote,
    isLoading,
    canProceedToNext,
    missingInfo,
    agentQuestion,
    previousSummary,
    setActiveSection,
    setCurrentNote,
    onTitleChange,
    onBriefChange,
    onTypeChange,
    onGenerateLayout,
    onStartInterview,
    onSubmitNote,
    onNextSection,
    onStartRefine,
    onGenerateDraft,
    onCopy,
    onExport,
  } = useAgentFlow({ project, onProjectUpdate });

  return (
    <div className="flex flex-col h-screen bg-background">
      <WorkspaceHeader
        title={title}
        phase={phase}
        saveStatus={saveStatus}
        onBack={onBack}
        onTitleChange={onTitleChange}
      />
      <div className="flex-1 flex overflow-hidden">
        <OutlinePanel
          sections={sections}
          activeSection={activeSection}
          onSectionClick={setActiveSection}
          disabled={phase === "type"}
        />
        <WorkspaceMain
          phase={phase}
          brief={brief}
          sections={sections}
          draft={draft}
          activeSection={activeSection}
          currentSection={currentSection}
          currentNote={currentNote}
          onNoteChange={setCurrentNote}
          onSubmitNote={onSubmitNote}
          onSectionClick={setActiveSection}
          onBriefChange={onBriefChange}
        />
        <AgentSidebar
          phase={phase}
          currentSection={currentSection}
          previousSectionSummary={previousSummary}
          blogType={blogType}
          onTypeChange={onTypeChange}
          onGenerateLayout={onGenerateLayout}
          onStartInterview={onStartInterview}
          onSubmitNote={onSubmitNote}
          onNextSection={onNextSection}
          onStartRefine={onStartRefine}
          onGenerateDraft={onGenerateDraft}
          onExport={onExport}
          onCopy={onCopy}
          canProceed={canProceedToNext}
          isLoading={isLoading}
          missingInfo={missingInfo}
          agentQuestion={agentQuestion}
          typeReason={
            brief ? "입력된 내용을 분석하여 글 타입을 추론했습니다." : undefined
          }
        />
      </div>
    </div>
  );
}

function WorkspaceHeader({
  title,
  phase,
  saveStatus,
  onBack,
  onTitleChange,
}: {
  title: string;
  phase: Phase;
  saveStatus: "saved" | "saving";
  onBack: () => void;
  onTitleChange: (title: string) => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 목록
        </button>
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="글 제목을 입력하세요"
          className="w-[300px] bg-transparent border-none text-lg font-semibold focus-visible:ring-0 px-0"
        />
      </div>
      <div className="flex items-center gap-4">
        <PhaseStepper currentPhase={phase} />
        <SaveStatusIndicator status={saveStatus} />
      </div>
    </header>
  );
}

function SaveStatusIndicator({ status }: { status: "saved" | "saving" }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {status === "saving" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Check className="w-3 h-3 text-emerald-400" />
      )}
      <span>{status === "saving" ? "저장 중..." : "저장됨"}</span>
    </div>
  );
}

function OutlinePanel({
  sections,
  activeSection,
  onSectionClick,
  disabled,
}: {
  sections: Section[];
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
  disabled?: boolean;
}) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Outline
        </h2>
        {sections.length > 0 ? (
          <OutlineTree
            sections={sections}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
            disabled={disabled}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            레이아웃이 아직 생성되지 않았습니다.
          </p>
        )}
      </div>
    </aside>
  );
}

function WorkspaceMain({
  phase,
  brief,
  sections,
  draft,
  activeSection,
  currentSection,
  currentNote,
  onNoteChange,
  onSubmitNote,
  onSectionClick,
  onBriefChange,
}: {
  phase: Phase;
  brief: string;
  sections: Section[];
  draft: string;
  activeSection?: string;
  currentSection?: Section;
  currentNote: string;
  onNoteChange: (note: string) => void;
  onSubmitNote: () => void;
  onSectionClick: (sectionId: string) => void;
  onBriefChange: (brief: string) => void;
}) {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      {phase === "type" && (
        <TypePhase brief={brief} onBriefChange={onBriefChange} />
      )}
      {phase === "layout" && <LayoutPhase section={currentSection} />}
      {phase === "interview" && (
        <InterviewPhase
          section={currentSection}
          currentNote={currentNote}
          onNoteChange={onNoteChange}
          onSubmitNote={onSubmitNote}
        />
      )}
      {phase === "refine" && (
        <RefinePhase
          sections={sections}
          activeSection={activeSection}
          onSectionClick={onSectionClick}
        />
      )}
      {phase === "draft" && <DraftPhase draft={draft} />}
    </main>
  );
}

function TypePhase({
  brief,
  onBriefChange,
}: {
  brief: string;
  onBriefChange: (brief: string) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">새 글 작성</h1>
        <p className="text-muted-foreground">
          글의 제목과 간단한 설명을 입력하면 AI가 적절한 글 타입을 추천합니다.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Brief</label>
          <Textarea
            value={brief}
            onChange={(event) => onBriefChange(event.target.value)}
            placeholder="어떤 내용을 쓰려고 하시나요? 간단히 설명해주세요..."
            className="min-h-[150px] bg-secondary/50 border-border focus:border-emerald-500/50"
          />
        </div>
      </div>
    </div>
  );
}

function LayoutPhase({ section }: { section?: Section }) {
  return (
    <div className="max-w-2xl mx-auto">
      {section ? (
        <SectionDetail section={section} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            왼쪽 Outline에서 섹션을 선택하면 상세 정보를 확인할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}

function InterviewPhase({
  section,
  currentNote,
  onNoteChange,
  onSubmitNote,
}: {
  section?: Section;
  currentNote: string;
  onNoteChange: (note: string) => void;
  onSubmitNote: () => void;
}) {
  if (!section) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <NotesEditor
        section={section}
        currentNote={currentNote}
        onNoteChange={onNoteChange}
        onSubmit={onSubmitNote}
      />
    </div>
  );
}

function RefinePhase({
  sections,
  activeSection,
  onSectionClick,
}: {
  sections: Section[];
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          레이아웃 정제
        </h1>
        <p className="text-muted-foreground">
          수집된 정보를 바탕으로 글의 구조를 최적화합니다.
        </p>
      </div>
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <h3 className="font-medium text-foreground mb-3">현재 구조</h3>
        <OutlineTree
          sections={sections}
          activeSection={activeSection}
          onSectionClick={onSectionClick}
        />
      </div>
    </div>
  );
}

function DraftPhase({ draft }: { draft: string }) {
  return (
    <div className="max-w-3xl mx-auto">
      <DraftViewer draft={draft} />
    </div>
  );
}

function AgentSidebar(props: {
  phase: Phase;
  currentSection?: Section;
  previousSectionSummary?: string;
  blogType: BlogType | null;
  onTypeChange: (type: BlogType) => void;
  onGenerateLayout: () => void;
  onStartInterview: () => void;
  onSubmitNote: () => void;
  onNextSection: () => void;
  onStartRefine: () => void;
  onGenerateDraft: () => void;
  onExport: () => void;
  onCopy: () => void;
  canProceed: boolean;
  isLoading: boolean;
  missingInfo: string[];
  agentQuestion?: string;
  typeReason?: string;
}) {
  return (
    <aside className="w-72 border-l border-border bg-sidebar p-4 overflow-y-auto">
      <AgentPanel {...props} />
    </aside>
  );
}
