import { HeroCarousel } from "@/components/hero-carousel";
import { ArticleTabs } from "@/components/article/article-tabs";
import { ArticleList } from "@/components/article/article-list";
import { FeaturedArticles } from "@/components/featured-articles";
import { SeriesSection } from "@/components/series-section";
import { Pagination } from "@/components/pagination";
import { getPaginatedArticles } from "@/lib/mdx/articles";
import { getQueryParam } from "@/lib/url";

const ARTICLES_PER_PAGE = 5;

type HomeProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolved = await searchParams;

  const pageParam = getQueryParam(resolved.page, "number") ?? 1;

  const {
    articles: currentArticles,
    currentPage,
    totalPages,
  } = getPaginatedArticles(pageParam, ARTICLES_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Hero Carousel */}
      <div className="mb-8">
        <HeroCarousel />
      </div>

      {/* Main Content Grid: Articles + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Left: Article List + Pagination */}
        <div className="space-y-8">
          <ArticleTabs />
          <div>
            <ArticleList articles={currentArticles} />
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </div>

        {/* Right: Sidebar with Featured & Series */}
        <div className="space-y-8">
          <FeaturedArticles />
          <SeriesSection />
        </div>
      </div>
    </div>
  );
}
