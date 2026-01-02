"use client";

import { useCallback, useState } from "react";
import { Input, Textarea } from "@jeongrae/ui";
import { Check, Loader2 } from "lucide-react";

import type { BlogType, Note, Project, Section } from "@/lib/types";
import { generateLayoutTemplate } from "@/lib/templates";
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
  const [activeSection, setActiveSection] = useState<string | undefined>();
  const [currentNote, setCurrentNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const currentSection = project.sections.find(
    (section) => section.id === activeSection,
  );
  const activeSectionIndex = project.sections.findIndex(
    (section) => section.id === activeSection,
  );
  const previousSection =
    activeSectionIndex > 0
      ? project.sections[activeSectionIndex - 1]
      : undefined;

  const updateProject = useCallback(
    (updates: Partial<Project>) => {
      setSaveStatus("saving");
      const updated = { ...project, ...updates, updatedAt: new Date() };
      onProjectUpdate(updated);
      setTimeout(() => setSaveStatus("saved"), 500);
    },
    [project, onProjectUpdate],
  );

  const handleTypeChange = (type: BlogType) => {
    updateProject({ type });
  };

  const handleGenerateLayout = async () => {
    if (!project.type) return;
    setIsLoading(true);
    await delay(1000);

    const layoutSections = generateLayoutTemplate(project.type).map(
      (section) => ({
        ...section,
        notes: [] as Note[],
      }),
    );

    updateProject({
      sections: layoutSections,
      phase: "layout",
    });
    setIsLoading(false);
  };

  const handleStartInterview = () => {
    const firstSection = project.sections[0];
    if (!firstSection) return;

    const updatedSections = project.sections.map((section, index) => ({
      ...section,
      status: index === 0 ? ("active" as const) : section.status,
    }));
    updateProject({
      sections: updatedSections,
      phase: "interview",
    });
    setActiveSection(firstSection.id);
  };

  const handleSubmitNote = async () => {
    if (!currentNote.trim() || !activeSection) return;
    setIsLoading(true);
    await delay(800);

    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote,
      timestamp: new Date(),
    };

    const updatedSections = project.sections.map((section) => {
      if (section.id !== activeSection) return section;

      const notes = [...section.notes, newNote];
      const isSufficient = notes.length >= 2;
      return {
        ...section,
        notes,
        status: isSufficient
          ? ("sufficient" as const)
          : ("insufficient" as const),
      };
    });

    updateProject({ sections: updatedSections });
    setCurrentNote("");
    setIsLoading(false);
  };

  const handleNextSection = () => {
    const currentIndex = project.sections.findIndex(
      (section) => section.id === activeSection,
    );
    const nextSection = project.sections[currentIndex + 1];

    if (!nextSection) {
      updateProject({ phase: "refine" });
      return;
    }

    const updatedSections = project.sections.map((section, index) => ({
      ...section,
      status: index === currentIndex + 1 ? ("active" as const) : section.status,
    }));
    updateProject({ sections: updatedSections });
    setActiveSection(nextSection.id);
  };

  const handleStartRefine = async () => {
    setIsLoading(true);
    await delay(1000);
    setIsLoading(false);
  };

  const handleGenerateDraft = async () => {
    setIsLoading(true);
    await delay(1500);

    const draft = buildDraft(project);
    updateProject({ draft, phase: "draft" });
    setIsLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(project.draft);
  };

  const handleExport = () => {
    const blob = new Blob([project.draft], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project.title || "draft"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const canProceedToNext = currentSection?.status === "sufficient";
  const missingInfo = getMissingInfo(currentSection);
  const agentQuestion = getAgentQuestion(currentSection, missingInfo);
  const previousSummary = getPreviousSummary(previousSection);

  return (
    <div className="flex flex-col h-screen bg-background">
      <WorkspaceHeader
        title={project.title}
        phase={project.phase}
        saveStatus={saveStatus}
        onBack={onBack}
        onTitleChange={(title) => updateProject({ title })}
      />
      <div className="flex-1 flex overflow-hidden">
        <OutlinePanel
          sections={project.sections}
          activeSection={activeSection}
          onSectionClick={(sectionId) => setActiveSection(sectionId)}
          disabled={project.phase === "type"}
        />
        <WorkspaceMain
          phase={project.phase}
          project={project}
          activeSection={activeSection}
          currentSection={currentSection}
          currentNote={currentNote}
          onNoteChange={setCurrentNote}
          onSectionClick={(sectionId) => setActiveSection(sectionId)}
          onBriefChange={(brief) => updateProject({ brief })}
        />
        <AgentSidebar
          phase={project.phase}
          currentSection={currentSection}
          previousSectionSummary={previousSummary}
          blogType={project.type}
          onTypeChange={handleTypeChange}
          onGenerateLayout={handleGenerateLayout}
          onStartInterview={handleStartInterview}
          onSubmitNote={handleSubmitNote}
          onNextSection={handleNextSection}
          onStartRefine={handleStartRefine}
          onGenerateDraft={handleGenerateDraft}
          onExport={handleExport}
          onCopy={handleCopy}
          canProceed={canProceedToNext}
          isLoading={isLoading}
          missingInfo={missingInfo}
          agentQuestion={agentQuestion}
          typeReason={
            project.brief
              ? "입력된 내용을 분석하여 글 타입을 추론했습니다."
              : undefined
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
  phase: Project["phase"];
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
  sections: Project["sections"];
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
  project,
  activeSection,
  currentSection,
  currentNote,
  onNoteChange,
  onSectionClick,
  onBriefChange,
}: {
  phase: Project["phase"];
  project: Project;
  activeSection?: string;
  currentSection?: Section;
  currentNote: string;
  onNoteChange: (note: string) => void;
  onSectionClick: (sectionId: string) => void;
  onBriefChange: (brief: string) => void;
}) {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      {phase === "type" && (
        <TypePhase brief={project.brief} onBriefChange={onBriefChange} />
      )}
      {phase === "layout" && <LayoutPhase section={currentSection} />}
      {phase === "interview" && (
        <InterviewPhase
          section={currentSection}
          currentNote={currentNote}
          onNoteChange={onNoteChange}
        />
      )}
      {phase === "refine" && (
        <RefinePhase
          sections={project.sections}
          activeSection={activeSection}
          onSectionClick={onSectionClick}
        />
      )}
      {phase === "draft" && <DraftPhase draft={project.draft} />}
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
}: {
  section?: Section;
  currentNote: string;
  onNoteChange: (note: string) => void;
}) {
  if (!section) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <NotesEditor
        section={section}
        currentNote={currentNote}
        onNoteChange={onNoteChange}
      />
    </div>
  );
}

function RefinePhase({
  sections,
  activeSection,
  onSectionClick,
}: {
  sections: Project["sections"];
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
  phase: Project["phase"];
  currentSection?: Section;
  previousSectionSummary?: string;
  blogType: Project["type"];
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildDraft(project: Project) {
  let draft = `# ${project.title}\n\n`;
  project.sections.forEach((section) => {
    const level = section.level === "h2" ? "##" : "###";
    draft += `${level} ${section.title}\n\n`;
    if (section.notes.length > 0) {
      section.notes.forEach((note) => {
        draft += `${note.content}\n\n`;
      });
    } else {
      draft += `[이 섹션에 대한 내용이 수집되지 않았습니다.]\n\n`;
    }
  });
  return draft;
}

function getMissingInfo(section?: Section) {
  if (!section || section.notes.length === 0) {
    return section?.requiredInfo ?? [];
  }
  if (section.status === "insufficient") {
    return section.requiredInfo.slice(section.notes.length);
  }
  return [];
}

function getAgentQuestion(section?: Section, missingInfo: string[] = []) {
  if (!section) return undefined;
  if (section.notes.length === 0) {
    return `이 섹션에서 ${section.requiredInfo[0]}에 대해 알려주세요.`;
  }
  if (section.status === "insufficient" && missingInfo.length > 0) {
    return `${missingInfo[0]}에 대한 정보가 더 필요합니다.`;
  }
  return undefined;
}

function getPreviousSummary(section?: Section) {
  if (!section || section.notes.length === 0) return undefined;
  return `${section.title}: ${section.notes
    .map((note) => note.content)
    .join(" ")
    .slice(0, 100)}...`;
}
