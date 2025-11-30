"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyArticle } from "@/components/empty-article"
import { isEmpty } from 'es-toolkit/compat'
import type { ArticleMeta } from "@/lib/mdx/types"

const ARTICLES_PER_PAGE = 10

type ArticleListProps = {
  articles: ArticleMeta[]
}

export function ArticleList({ articles }: ArticleListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  if (isEmpty(articles)) {
    return <EmptyArticle />
  }

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
  const endIndex = startIndex + ARTICLES_PER_PAGE
  const currentArticles = articles.slice(startIndex, endIndex)

  return (
    <div>
      <div className="space-y-6">
        {currentArticles.map((article) => (
          <a
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group flex gap-6 py-6 border-b border-border last:border-0 hover:opacity-80 transition-opacity"
          >
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-2">
                <h3 className="font-bold text-[20px] leading-[1.6] text-[#4e5968] group-hover:text-[#3182f6] transition-colors">
                  {article.title}
                </h3>
                {article.summary && (
                  <p className="text-sm leading-[1.6] text-[#4e5968]">
                    {article.summary}
                  </p>
                )}
              </div>
              <div className="text-xs leading-[1.6] text-[#4e5968] mt-3">
                {article.date ?? ""} {article.author && `· ${article.author}`}
              </div>
            </div>
            <div className="flex-shrink-0 w-[130px] h-[90px] rounded-lg overflow-hidden">
              <img
                src={article.thumbnail || "/placeholder.svg?height=90&width=130"}
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
