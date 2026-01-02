"use client"

import { useState, useCallback } from "react"
import type { Project, BlogType, Note } from "@/lib/types"
import { generateLayoutTemplate } from "@/lib/templates"
import { PhaseStepper } from "./phase-stepper"
import { OutlineTree } from "./outline-tree"
import { AgentPanel } from "./agent-panel"
import { SectionDetail } from "./section-detail"
import { NotesEditor } from "./notes-editor"
import { DraftViewer } from "./draft-viewer"
import { Input } from "@jeongrae/ui"
import { Textarea } from "@jeongrae/ui"
import { Check, Loader2 } from "lucide-react"

interface WritingWorkspaceProps {
  project: Project
  onProjectUpdate: (project: Project) => void
  onBack: () => void
}

export function WritingWorkspace({ project, onProjectUpdate, onBack }: WritingWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<string | undefined>()
  const [currentNote, setCurrentNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved")

  const currentSectionData = project.sections.find((s) => s.id === activeSection)
  const activeSectionIndex = project.sections.findIndex((s) => s.id === activeSection)
  const previousSection = activeSectionIndex > 0 ? project.sections[activeSectionIndex - 1] : undefined

  const updateProject = useCallback(
    (updates: Partial<Project>) => {
      setSaveStatus("saving")
      const updated = { ...project, ...updates, updatedAt: new Date() }
      onProjectUpdate(updated)
      setTimeout(() => setSaveStatus("saved"), 500)
    },
    [project, onProjectUpdate],
  )

  const handleTypeChange = (type: BlogType) => {
    updateProject({ type })
  }

  const handleGenerateLayout = async () => {
    if (!project.type) return
    setIsLoading(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const layoutSections = generateLayoutTemplate(project.type).map((s) => ({
      ...s,
      notes: [] as Note[],
    }))

    updateProject({
      sections: layoutSections,
      phase: "layout",
    })
    setIsLoading(false)
  }

  const handleStartInterview = () => {
    const firstSection = project.sections[0]
    if (firstSection) {
      const updatedSections = project.sections.map((s, i) => ({
        ...s,
        status: i === 0 ? ("active" as const) : s.status,
      }))
      updateProject({
        sections: updatedSections,
        phase: "interview",
      })
      setActiveSection(firstSection.id)
    }
  }

  const handleSubmitNote = async () => {
    if (!currentNote.trim() || !activeSection) return
    setIsLoading(true)

    // Simulate AI evaluation
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote,
      timestamp: new Date(),
    }

    const updatedSections = project.sections.map((s) => {
      if (s.id === activeSection) {
        const notes = [...s.notes, newNote]
        // Simulate sufficiency check - mark as sufficient if has 2+ notes
        const isSufficient = notes.length >= 2
        return {
          ...s,
          notes,
          status: isSufficient ? ("sufficient" as const) : ("insufficient" as const),
        }
      }
      return s
    })

    updateProject({ sections: updatedSections })
    setCurrentNote("")
    setIsLoading(false)
  }

  const handleNextSection = () => {
    const currentIndex = project.sections.findIndex((s) => s.id === activeSection)
    const nextSection = project.sections[currentIndex + 1]

    if (nextSection) {
      const updatedSections = project.sections.map((s, i) => ({
        ...s,
        status: i === currentIndex + 1 ? ("active" as const) : s.status,
      }))
      updateProject({ sections: updatedSections })
      setActiveSection(nextSection.id)
    } else {
      // All sections complete
      updateProject({ phase: "refine" })
    }
  }

  const handleStartRefine = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // In real implementation, this would call AI for layout suggestions
    setIsLoading(false)
  }

  const handleGenerateDraft = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate markdown draft from sections
    let draft = `# ${project.title}\n\n`
    project.sections.forEach((section) => {
      const level = section.level === "h2" ? "##" : "###"
      draft += `${level} ${section.title}\n\n`
      if (section.notes.length > 0) {
        section.notes.forEach((note) => {
          draft += `${note.content}\n\n`
        })
      } else {
        draft += `[이 섹션에 대한 내용이 수집되지 않았습니다.]\n\n`
      }
    })

    updateProject({ draft, phase: "draft" })
    setIsLoading(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(project.draft)
  }

  const handleExport = () => {
    const blob = new Blob([project.draft], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.title || "draft"}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canProceedToNext = currentSectionData?.status === "sufficient"
  const allSectionsSufficient = project.sections.every((s) => s.status === "sufficient")

  const getMissingInfo = (): string[] => {
    if (!currentSectionData || currentSectionData.notes.length === 0) {
      return currentSectionData?.requiredInfo || []
    }
    if (currentSectionData.status === "insufficient") {
      // Simulate missing info based on notes count
      return currentSectionData.requiredInfo.slice(currentSectionData.notes.length)
    }
    return []
  }

  const getAgentQuestion = (): string | undefined => {
    if (!currentSectionData) return undefined
    if (currentSectionData.notes.length === 0) {
      return `이 섹션에서 ${currentSectionData.requiredInfo[0]}에 대해 알려주세요.`
    }
    if (currentSectionData.status === "insufficient") {
      const missing = getMissingInfo()
      if (missing.length > 0) {
        return `${missing[0]}에 대한 정보가 더 필요합니다.`
      }
    }
    return undefined
  }

  const getPreviousSummary = (): string | undefined => {
    if (!previousSection || previousSection.notes.length === 0) return undefined
    return `${previousSection.title}: ${previousSection.notes
      .map((n) => n.content)
      .join(" ")
      .slice(0, 100)}...`
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← 목록
          </button>
          <Input
            value={project.title}
            onChange={(e) => updateProject({ title: e.target.value })}
            placeholder="글 제목을 입력하세요"
            className="w-[300px] bg-transparent border-none text-lg font-semibold focus-visible:ring-0 px-0"
          />
        </div>
        <div className="flex items-center gap-4">
          <PhaseStepper currentPhase={project.phase} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {saveStatus === "saving" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3 text-emerald-400" />
            )}
            <span>{saveStatus === "saving" ? "저장 중..." : "저장됨"}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Outline */}
        <aside className="w-64 border-r border-border bg-sidebar p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Outline</h2>
            {project.sections.length > 0 ? (
              <OutlineTree
                sections={project.sections}
                activeSection={activeSection}
                onSectionClick={setActiveSection}
                disabled={project.phase === "type"}
              />
            ) : (
              <p className="text-sm text-muted-foreground">레이아웃이 아직 생성되지 않았습니다.</p>
            )}
          </div>
        </aside>

        {/* Center Panel - Work Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Phase 1: Type Input */}
          {project.phase === "type" && (
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
                    value={project.brief}
                    onChange={(e) => updateProject({ brief: e.target.value })}
                    placeholder="어떤 내용을 쓰려고 하시나요? 간단히 설명해주세요..."
                    className="min-h-[150px] bg-secondary/50 border-border focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Layout Preview */}
          {project.phase === "layout" && (
            <div className="max-w-2xl mx-auto">
              {currentSectionData ? (
                <SectionDetail section={currentSectionData} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    왼쪽 Outline에서 섹션을 선택하면 상세 정보를 확인할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Phase 3: Interview */}
          {project.phase === "interview" && currentSectionData && (
            <div className="max-w-2xl mx-auto">
              <NotesEditor section={currentSectionData} currentNote={currentNote} onNoteChange={setCurrentNote} />
            </div>
          )}

          {/* Phase 4: Refine */}
          {project.phase === "refine" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">레이아웃 정제</h1>
                <p className="text-muted-foreground">수집된 정보를 바탕으로 글의 구조를 최적화합니다.</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <h3 className="font-medium text-foreground mb-3">현재 구조</h3>
                <OutlineTree
                  sections={project.sections}
                  activeSection={activeSection}
                  onSectionClick={setActiveSection}
                />
              </div>
            </div>
          )}

          {/* Phase 5: Draft */}
          {project.phase === "draft" && (
            <div className="max-w-3xl mx-auto">
              <DraftViewer draft={project.draft} sections={project.sections} onSectionClick={setActiveSection} />
            </div>
          )}
        </main>

        {/* Right Panel - Agent */}
        <aside className="w-72 border-l border-border bg-sidebar p-4 overflow-y-auto">
          <AgentPanel
            phase={project.phase}
            currentSection={currentSectionData}
            previousSectionSummary={getPreviousSummary()}
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
            missingInfo={getMissingInfo()}
            agentQuestion={getAgentQuestion()}
            typeReason={project.brief ? "입력된 내용을 분석하여 글 타입을 추론했습니다." : undefined}
          />
        </aside>
      </div>
    </div>
  )
}
