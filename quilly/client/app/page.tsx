"use client"

import { useState } from "react"
import type { Project } from "@/lib/types"
import { ProjectList } from "@/components/project-list"
import { WritingWorkspace } from "@/components/writing-workspace"

// Demo projects for initial state
const DEMO_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Redis 캐시 이슈 트러블슈팅",
    brief: "Redis 캐시 만료 시 발생하는 timeout 이슈 해결 과정",
    type: "troubleshooting",
    phase: "interview",
    sections: [],
    draft: "",
    updatedAt: new Date("2025-12-30T14:10:00"),
  },
  {
    id: "2",
    title: "결제 모듈 설계 기록",
    brief: "토스페이먼츠 연동 결제 모듈 설계 및 구현",
    type: "design",
    phase: "draft",
    sections: [],
    draft: "# 결제 모듈 설계 기록\n\n## 배경 및 목표\n...",
    updatedAt: new Date("2025-12-29T09:30:00"),
  },
]

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS)
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "",
      brief: "",
      type: null,
      phase: "type",
      sections: [],
      draft: "",
      updatedAt: new Date(),
    }
    setProjects([newProject, ...projects])
    setActiveProject(newProject)
  }

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
    setActiveProject(updatedProject)
  }

  const handleBack = () => {
    setActiveProject(null)
  }

  if (activeProject) {
    return <WritingWorkspace project={activeProject} onProjectUpdate={handleProjectUpdate} onBack={handleBack} />
  }

  return <ProjectList projects={projects} onSelectProject={setActiveProject} onCreateProject={handleCreateProject} />
}
