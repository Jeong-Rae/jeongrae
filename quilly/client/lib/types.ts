export type BlogType = "troubleshooting" | "design" | "analysis" | "learning";

export type Phase = "type" | "layout" | "interview" | "refine" | "draft";

export type SectionStatus =
  | "pending"
  | "active"
  | "sufficient"
  | "insufficient";

export interface Section {
  id: string;
  title: string;
  level: "h2" | "h3";
  purpose: string;
  requiredInfo: string[];
  recommendedImages?: string[];
  status: SectionStatus;
  notes: Note[];
  parentId?: string;
}

export interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  title: string;
  brief: string;
  type: BlogType | null;
  phase: Phase;
  sections: Section[];
  draft: string;
  updatedAt: Date;
}

export const BLOG_TYPES: {
  id: BlogType;
  label: string;
  description: string;
}[] = [
  {
    id: "troubleshooting",
    label: "트러블 슈팅",
    description: "문제 해결 과정 기록",
  },
  { id: "design", label: "설계/구현", description: "기능 설계 및 구현 기록" },
  {
    id: "analysis",
    label: "지표 분석",
    description: "지표 분석 / 실험 결과 정리",
  },
  {
    id: "learning",
    label: "학습 정리",
    description: "논문 / 아티클 학습 정리",
  },
];

export const PHASES: { id: Phase; label: string; step: number }[] = [
  { id: "type", label: "Type", step: 1 },
  { id: "layout", label: "Layout", step: 2 },
  { id: "interview", label: "Interview", step: 3 },
  { id: "refine", label: "Refine", step: 4 },
  { id: "draft", label: "Draft", step: 5 },
];
