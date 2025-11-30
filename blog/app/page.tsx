// app/page.tsx
import { BlogHeader } from "@/components/blog-header"
import { HeroCarousel } from "@/components/hero-carousel"
import { ArticleTabs } from "@/components/article-tabs"
import { ArticleList } from "@/components/article-list"
import { PopularArticles } from "@/components/popular-articles"
import { SeriesSection } from "@/components/series-section"
import { getAllArticleMetas } from "@/lib/mdx/articles"

// Home은 서버 컴포넌트 (use client 없음)
export default function Home() {
  // MDX에서 메타 정보 읽어오기
  const metas = getAllArticleMetas()

  // ArticleList가 기대하는 형태로 매핑
  const articles = metas.map((meta) => ({
    slug: meta.slug,
    title: meta.title,
    summary: meta.summary,      // frontmatter에 summary 있으면
    date: meta.date,
    author: meta.author,        // 필요 없으면 빼도 됨
  }))

  return (
    <div className="min-h-screen">
      <BlogHeader />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Hero Carousel */}
        <div className="mb-8">
          <HeroCarousel />
        </div>

        {/* Article Tabs */}
        <div className="mb-8">
          <ArticleTabs />
        </div>

        {/* Main Content Grid: Articles + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left: Article List */}
          <div>
            <ArticleList articles={articles} />
          </div>

          {/* Right: Sidebar with Popular & Series */}
          <div className="space-y-8">
            <PopularArticles />
            <SeriesSection />
          </div>
        </div>
      </main>
    </div>
  )
}
