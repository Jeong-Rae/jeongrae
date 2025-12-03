"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const seriesList = [
  {
    id: 1,
    title: "Clean Code",
    description:
      "읽기 좋은 코드를 작성하는 방법과 소프트웨어 장인정신에 대한 실용적인 가이드",
    episodes: [
      "변수명과 함수명 잘 짓기",
      "작고 집중하는 함수 만들기",
      "주석과 포맷팅의 중요성",
      "에러 처리와 테스트 코드",
    ],
    episodeCount: "챕터 17",
    thumbnail: "/clean-code-icon.jpg",
  },
  {
    id: 2,
    title: "Clean Architecture",
    description:
      "소프트웨어의 구조를 어떻게 설계하고 유지보수하는지에 대한 완벽한 가이드",
    episodes: [
      "아키텍처의 기초 개념",
      "계층 구조와 의존성 역전",
      "클린 아키텍처의 실전 적용",
      "대규모 프로젝트에서의 확장성",
    ],
    episodeCount: "챕터 34",
    thumbnail: "/clean-architecture-icon.jpg",
  },
];

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
  );
}

function SeriesCard({ series }: { series: (typeof seriesList)[0] }) {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEpisodeIndex((prev) => (prev + 1) % series.episodes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [series.episodes.length]);

  return (
    <div className="border border-border rounded-lg hover:border-foreground/20 transition-colors">
      <div className="p-4">
        <div className="flex flex-row-reverse gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={series.thumbnail || "/placeholder.svg"}
              alt={series.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">{series.title}</h4>
            <p className="text-muted-foreground text-xs leading-relaxed mb-2">
              {series.description}
            </p>
            <Badge variant="secondary" className="mb-2 text-xs">
              {series.episodeCount}
            </Badge>
            <div className="text-foreground/70 text-xs">
              {series.episodes[currentEpisodeIndex]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
