"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const articles = [
  {
    id: 1,
    title: "토스에서 가장 안 좋은 경험 만들기",
    description:
      "비즈니스의 사용자 경험, 두 가지를 모두 챙기려면 어떻게 해야할까요? 둘 사이 교집합을 찾아낸 과정을 알려드릴게요.",
    date: "2025년 11월 7일",
    author: "이현정",
    image: "/user-experience-design-illustration.jpg",
  },
  {
    id: 2,
    title: "토스페이먼츠 삽입으로 QA로 일한다는 것",
    description: "오늘가 들어나는 문제들에 대해서",
    date: "2025년 11월 4일",
    author: "채소현",
    image: "/qa-testing-illustration.jpg",
  },
  {
    id: 3,
    title: "토스 피플 : 데이터팀 '이해하는' 구조를 설계합니다",
    description:
      "데이터의 의미를 구조화로 만들려면, 설계 여러을 강의로, 토스의 1호 Data Architect 고영한의 커리어 이야기를 들려드립니다.",
    date: "2025년 10월 31일",
    author: "고영한",
    image: "/data-architecture-diagram.jpg",
  },
  {
    id: 4,
    title: "포스를 확장하는 가장 빠른 방법, 포스 플러그인",
    description:
      "포스플레이스 Plugin SDK에서 디자인 서비스를 결합하는 방법인 구조를 고민하며, 사용자의 일할 개발 개발자를 등이 있을 물리정은 앞으로 말합니다.",
    date: "2025년 10월 2일",
    author: "고혜경/문선미",
    image: "/plugin-sdk-illustration.jpg",
  },
  {
    id: 5,
    title: "API 인증 지능화를 위한 여정: 토스는 왜 AI서 MCP 서버를 개발했는가? with Spring-AI",
    description: "AI 기반 인증 시스템을 구축하며 배운 것들을 공유합니다.",
    date: "2025년 10월 15일",
    author: "조민규",
    image: "/api-security-illustration.jpg",
  },
  {
    id: 6,
    title: "기업용은 편하면서, 결제된 시스템 전면 재설계기",
    description: "편의성과 안정성을 모두 잡은 결제 시스템 개선 이야기",
    date: "2025년 10월 10일",
    author: "황성우",
    image: "/payment-system-illustration.jpg",
  },
  {
    id: 7,
    title: "20년 레거시를 담아 이데올로 순회하는 시스템 만들기",
    description: "오래된 시스템을 현대적으로 개선한 과정",
    date: "2025년 10월 5일",
    author: "최대호",
    image: "/legacy-system-illustration.jpg",
  },
  {
    id: 8,
    title: "프론트엔드 성능 최적화 실전 가이드",
    description: "사용자 경험을 개선하는 성능 최적화 기법들",
    date: "2025년 9월 28일",
    author: "김민지",
    image: "/performance-optimization-illustration.jpg",
  },
  {
    id: 9,
    title: "마이크로서비스 아키텍처 전환기",
    description: "모놀리식에서 마이크로서비스로의 여정",
    date: "2025년 9월 20일",
    author: "박준형",
    image: "/microservices-illustration.jpg",
  },
  {
    id: 10,
    title: "토스의 디자인 시스템 구축 이야기",
    description: "일관된 사용자 경험을 위한 디자인 시스템",
    date: "2025년 9월 15일",
    author: "이지은",
    image: "/design-system-illustration.jpg",
  },
  {
    id: 11,
    title: "대규모 트래픽 처리를 위한 인프라 구축",
    description: "수천만 사용자를 감당하는 인프라 설계",
    date: "2025년 9월 10일",
    author: "정서연",
    image: "/infrastructure-illustration.jpg",
  },
  {
    id: 12,
    title: "효율적인 코드 리뷰 문화 만들기",
    description: "팀의 성장을 이끄는 코드 리뷰 프로세스",
    date: "2025년 9월 5일",
    author: "강태웅",
    image: "/code-review-illustration.jpg",
  },
]

const ARTICLES_PER_PAGE = 10

export function ArticleList() {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
  const endIndex = startIndex + ARTICLES_PER_PAGE
  const currentArticles = articles.slice(startIndex, endIndex)

  return (
    <div>
      <div className="space-y-6">
        {currentArticles.map((article) => (
          <a
            key={article.id}
            href={`/article/${article.id}`}
            className="group flex gap-6 py-6 border-b border-border last:border-0 hover:opacity-80 transition-opacity"
          >
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-2">
                <h3 className="font-bold text-[20px] leading-[1.6] text-[#4e5968] group-hover:text-[#3182f6] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[#4e5968]">{article.description}</p>
              </div>
              <div className="text-xs leading-[1.6] text-[#4e5968] mt-3">
                {article.date} · {article.author}
              </div>
            </div>
            <div className="flex-shrink-0 w-[130px] h-[90px] rounded-lg overflow-hidden">
              <img
                src={article.image || "/placeholder.svg?height=90&width=130"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </a>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pt-8 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            이전
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
