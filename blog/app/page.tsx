import { BlogHeader } from "@/components/blog-header";
import { HeroCarousel } from "@/components/hero-carousel";
import { ArticleTabs } from "@/components/article-tabs";
import { ArticleList } from "@/components/article-list";
import { PopularArticles } from "@/components/popular-articles";
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
					{/* Left: Article List + Pagination */}
					<div>
						<ArticleList articles={currentArticles} />
						<Pagination currentPage={currentPage} totalPages={totalPages} />
					</div>

					{/* Right: Sidebar with Popular & Series */}
					<div className="space-y-8">
						<PopularArticles />
						<SeriesSection />
					</div>
				</div>
			</main>
		</div>
	);
}
