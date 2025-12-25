"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ToolsHeader } from "@/components/tools/tools-header"
import { StatusFilter } from "@/components/tools/status-filter"
import { ToolsGrid } from "@/components/tools/tools-grid"
import type { Tool, ToolStatus } from "@/components/tools/tool-card"

// Sample data - replace with actual data source
const sampleTools: Tool[] = [
  {
    id: "1",
    name: "Prompt Manager",
    description: "AI 프롬프트 템플릿 관리 및 버전 관리 도구",
    iconUrl: "/prompt-icon.jpg",
    url: "https://prompts.jeongrae.me",
    status: "public",
  },
  {
    id: "2",
    name: "Git Auto Manager",
    description: "자동 커밋, 브랜치 관리, PR 생성 도구",
    iconUrl: "/git-icon.jpg",
    url: "https://git.jeongrae.me",
    status: "internal",
  },
  {
    id: "3",
    name: "Web Terminal",
    description: "브라우저 기반 SSH 터미널 클라이언트",
    iconUrl: "/terminal-icon.jpg",
    url: "https://terminal.jeongrae.me",
    status: "blocked",
    note: "보안 점검 중",
  },
  {
    id: "4",
    name: "API Monitor",
    description: "API 엔드포인트 상태 모니터링 대시보드",
    iconUrl: "/api-monitor-icon.jpg",
    url: "https://api-monitor.jeongrae.me",
    status: "public",
  },
  {
    id: "5",
    name: "Log Viewer",
    description: "서버 로그 실시간 조회 및 분석 도구",
    iconUrl: "/log-viewer-icon.jpg",
    url: "https://logs.jeongrae.me",
    status: "internal",
  },
  {
    id: "6",
    name: "Database Admin",
    description: "데이터베이스 관리 및 쿼리 실행 도구",
    iconUrl: "/database-icon.png",
    url: "https://db.jeongrae.me",
    status: "blocked",
    note: "마이그레이션 진행중",
  },
]

type FilterStatus = ToolStatus | "all"

export default function ToolsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialFilter = (searchParams.get("status") as FilterStatus) || "all"
  const [filter, setFilter] = useState<FilterStatus>(initialFilter)

  const handleFilterChange = (status: FilterStatus) => {
    setFilter(status)
    const params = new URLSearchParams()
    if (status !== "all") {
      params.set("status", status)
    }
    router.push(params.toString() ? `?${params.toString()}` : "/", { scroll: false })
  }

  const filteredTools = useMemo(() => {
    if (filter === "all") return sampleTools
    return sampleTools.filter((tool) => tool.status === filter)
  }, [filter])

  const counts = useMemo(
    () => ({
      all: sampleTools.length,
      public: sampleTools.filter((t) => t.status === "public").length,
      internal: sampleTools.filter((t) => t.status === "internal").length,
      blocked: sampleTools.filter((t) => t.status === "blocked").length,
    }),
    [],
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ToolsHeader />

        <div className="mb-6">
          <StatusFilter currentFilter={filter} onFilterChange={handleFilterChange} counts={counts} />
        </div>

        <ToolsGrid tools={filteredTools} />
      </div>
    </main>
  )
}
