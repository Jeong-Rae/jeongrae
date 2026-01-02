"use client";

import { Button } from "@jeongrae/ui";
import { Plus, Sparkles } from "lucide-react";

import type { Project } from "@/lib/types";
import { ProjectCard } from "./project-card";

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
}

export function ProjectList({
  projects,
  onSelectProject,
  onCreateProject,
}: ProjectListProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <ProjectListHeader onCreateProject={onCreateProject} />
        <ProjectListBody
          projects={projects}
          onSelectProject={onSelectProject}
          onCreateProject={onCreateProject}
        />
      </div>
    </div>
  );
}

function ProjectListHeader({
  onCreateProject,
}: {
  onCreateProject: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Quilly</h1>
          <p className="text-sm text-muted-foreground">
            AI 기반 기술 블로그 작성 도우미
          </p>
        </div>
      </div>
      <Button
        onClick={onCreateProject}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />새 글
      </Button>
    </div>
  );
}

function ProjectListBody({
  projects,
  onSelectProject,
  onCreateProject,
}: ProjectListProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        최근 작업
      </h2>
      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project)}
            />
          ))}
        </div>
      ) : (
        <ProjectEmptyState onCreateProject={onCreateProject} />
      )}
    </div>
  );
}

function ProjectEmptyState({
  onCreateProject,
}: {
  onCreateProject: () => void;
}) {
  return (
    <div className="text-center py-16 px-6 rounded-lg border border-dashed border-border">
      <Sparkles className="w-12 h-12 text-emerald-400/30 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">시작하기</h3>
      <p className="text-sm text-muted-foreground mb-4">
        첫 번째 Tech Blog 글을 작성해보세요.
      </p>
      <Button
        onClick={onCreateProject}
        variant="outline"
        className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
      >
        <Plus className="w-4 h-4 mr-2" />새 글 작성
      </Button>
    </div>
  );
}
