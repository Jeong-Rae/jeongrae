"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

const seriesList = [
  {
    id: 1,
    title: "토스결제 Realtime Data Team",
    description: "화후 수 오천만 금융거래를 실시간으로 정확하게 처리하는 기술과 경험을",
    episodes: [
      "실시간 데이터 파이프라인 구축하기",
      "대규모 트래픽 처리 전략",
      "데이터 정합성 보장하기",
      "모니터링과 알림 시스템",
    ],
    episodeCount: "에피소드 4",
    image: "/realtime-data-processing-icon.jpg",
  },
  {
    id: 2,
    title: "언더커버 사일로",
    description: "토스의 서비스에 빡은 C 언더커버 사일로의 비하인드 스토리",
    episodes: [
      "사일로 문화의 시작",
      "팀 간 협업의 비밀",
      "프로덕트 오너십",
      "기술 부채 해결하기",
      "커뮤니케이션 개선 사례",
      "조직 문화 만들기",
    ],
    episodeCount: "에피소드 6",
    image: "/undercover-silo-podcast-icon.jpg",
  },
]

export function SeriesSection() {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4">이달의 시리즈</h3>
      <div className="space-y-4">
        {seriesList.map((series) => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>
    </div>
  )
}

function SeriesCard({ series }: { series: (typeof seriesList)[0] }) {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEpisodeIndex((prev) => (prev + 1) % series.episodes.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [series.episodes.length])

  return (
    <div className="border border-border rounded-lg hover:border-foreground/20 transition-colors">
      <div className="p-4">
        <div className="flex flex-row-reverse gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <img src={series.image || "/placeholder.svg"} alt={series.title} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">{series.title}</h4>
            <p className="text-muted-foreground text-xs leading-relaxed mb-2">{series.description}</p>
            <Badge variant="secondary" className="mb-2 text-xs">
              {series.episodeCount}
            </Badge>
            <div className="text-foreground/70 text-xs">{series.episodes[currentEpisodeIndex]}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
