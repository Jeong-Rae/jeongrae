import { useCallback, useMemo, useState } from "react";
import { useInputState } from "@jeongrae/hook";

import type { BlogType, Note, Phase, Project, Section } from "@/lib/types";
import { generateLayoutTemplate } from "@/lib/templates";
import { useClipboardCopy } from "./useClipboardCopy";
import {
  type FlowGuards,
  type FlowNextMap,
  type FlowTransitions,
  useFlowState,
} from "./useFlowState";
import { useSectionMeta } from "./useSectionMeta";
import { useTask } from "./useTask";
import { useTextDownload } from "./useTextDownload";

type UseAgentFlowParams = {
  project: Project;
  onProjectUpdate: (project: Project) => void;
};

type UseAgentFlowResult = {
  phase: Phase;
  title: string;
  brief: string;
  blogType: BlogType | null;
  sections: Section[];
  draft: string;
  saveStatus: "saved" | "saving";
  activeSection?: string;
  currentSection?: Section;
  currentNote: string;
  isLoading: boolean;
  canProceedToNext: boolean;
  missingInfo: string[];
  agentQuestion?: string;
  previousSummary?: string;
  setActiveSection: (sectionId: string) => void;
  setCurrentNote: (note: string) => void;
  onTitleChange: (title: string) => void;
  onBriefChange: (brief: string) => void;
  onTypeChange: (type: BlogType) => void;
  onGenerateLayout: () => void;
  onStartInterview: () => void;
  onSubmitNote: () => void;
  onNextSection: () => void;
  onStartRefine: () => void;
  onGenerateDraft: () => void;
  onCopy: () => void;
  onExport: () => void;
};

const FLOW_TRANSITIONS: FlowTransitions<Phase> = {
  type: ["layout"],
  layout: ["interview"],
  interview: ["refine"],
  refine: ["draft"],
  draft: [],
};

const FLOW_NEXT: FlowNextMap<Phase> = {
  type: "layout",
  layout: "interview",
  interview: "refine",
  refine: "draft",
};

export function useAgentFlow({
  project,
  onProjectUpdate,
}: UseAgentFlowParams): UseAgentFlowResult {
  const [activeSection, setActiveSection] = useState<string | undefined>();
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const {
    value: currentNote,
    setValue: setCurrentNote,
    reset: resetCurrentNote,
  } = useInputState("");
  const { copy } = useClipboardCopy();
  const downloadText = useTextDownload();

  const flowGuards = useMemo<FlowGuards<Phase>>(
    () => ({
      layout: () => (project.type ? true : { reason: "type-required" }),
      interview: () =>
        project.sections.length > 0 ? true : { reason: "layout-required" },
    }),
    [project.sections.length, project.type],
  );

  const flow = useFlowState<Phase>({
    initial: project.phase,
    transitions: FLOW_TRANSITIONS,
    guards: flowGuards,
    next: FLOW_NEXT,
  });

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

  const onTitleChange = useCallback(
    (title: string) => updateProject({ title }),
    [updateProject],
  );

  const onBriefChange = useCallback(
    (brief: string) => updateProject({ brief }),
    [updateProject],
  );

  const onTypeChange = useCallback(
    (type: BlogType) => updateProject({ type }),
    [updateProject],
  );

  const generateLayoutTask = useTask(async () => {
    if (!project.type) return;
    await delay(1000);

    const layoutSections = generateLayoutTemplate(project.type).map(
      (section) => ({
        ...section,
        notes: [] as Note[],
      }),
    );

    if (!flow.transition("layout")) return;
    updateProject({
      sections: layoutSections,
      phase: "layout",
    });
  });

  const submitNoteTask = useTask(async () => {
    if (!currentNote.trim() || !activeSection) return;
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
    resetCurrentNote();
  });

  const startRefineTask = useTask(async () => {
    await delay(1000);
  });

  const generateDraftTask = useTask(async () => {
    await delay(1500);

    const draft = buildDraft(project);
    if (flow.phase !== "draft" && flow.transition("draft")) {
      updateProject({ draft, phase: "draft" });
      return;
    }
    updateProject({ draft });
  });

  const onGenerateLayout = useCallback(() => {
    void generateLayoutTask.run();
  }, [generateLayoutTask]);

  const onSubmitNote = useCallback(() => {
    void submitNoteTask.run();
  }, [submitNoteTask]);

  const onStartRefine = useCallback(() => {
    void startRefineTask.run();
  }, [startRefineTask]);

  const onGenerateDraft = useCallback(() => {
    void generateDraftTask.run();
  }, [generateDraftTask]);

  const onStartInterview = useCallback(() => {
    const firstSection = project.sections[0];
    if (!firstSection) return;
    if (!flow.transition("interview")) return;

    const updatedSections = project.sections.map((section, index) => ({
      ...section,
      status: index === 0 ? ("active" as const) : section.status,
    }));
    updateProject({
      sections: updatedSections,
      phase: "interview",
    });
    setActiveSection(firstSection.id);
  }, [flow, project.sections, updateProject]);

  const onNextSection = useCallback(() => {
    const currentIndex = project.sections.findIndex(
      (section) => section.id === activeSection,
    );
    const nextSection = project.sections[currentIndex + 1];

    if (!nextSection) {
      if (flow.transition("refine")) {
        updateProject({ phase: "refine" });
      }
      return;
    }

    const updatedSections = project.sections.map((section, index) => ({
      ...section,
      status: index === currentIndex + 1 ? ("active" as const) : section.status,
    }));
    updateProject({ sections: updatedSections });
    setActiveSection(nextSection.id);
  }, [activeSection, flow, project.sections, updateProject]);

  const onCopy = useCallback(() => {
    void copy(project.draft);
  }, [copy, project.draft]);

  const onExport = useCallback(() => {
    downloadText({
      filename: `${project.title || "draft"}.md`,
      content: project.draft,
      mime: "text/markdown",
    });
  }, [downloadText, project.draft, project.title]);

  const { missingInfo, agentQuestion, previousSummary } = useSectionMeta(
    currentSection,
    previousSection,
  );

  const isLoading =
    generateLayoutTask.isRunning ||
    submitNoteTask.isRunning ||
    startRefineTask.isRunning ||
    generateDraftTask.isRunning;

  return {
    phase: flow.phase,
    title: project.title,
    brief: project.brief,
    blogType: project.type,
    sections: project.sections,
    draft: project.draft,
    saveStatus,
    activeSection,
    currentSection,
    currentNote,
    isLoading,
    canProceedToNext: currentSection?.status === "sufficient",
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
  };
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
