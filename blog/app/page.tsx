import { BlogHeader } from "@/components/blog-header"
import { HeroCarousel } from "@/components/hero-carousel"
import { ArticleTabs } from "@/components/article-tabs"
import { ArticleList } from "@/components/article-list"
import { PopularArticles } from "@/components/popular-articles"
import { SeriesSection } from "@/components/series-section"

export default function Home() {
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
            <ArticleList />
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
