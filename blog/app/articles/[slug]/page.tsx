import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogHeader } from "@/components/blog-header";
import { ArticleContent } from "@/components/article-content";
import { RelatedSeries } from "@/components/related-series";
import { getAllArticleMetas } from "@/lib/mdx/articles";
import { getCompiledArticleBySlug } from "@/lib/mdx/compile";

type PageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	const metas = getAllArticleMetas();
	return metas.map((meta) => ({
		slug: meta.slug,
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;

	const article = await getCompiledArticleBySlug(slug);
	if (!article) {
		return {};
	}

	return {
		title: article.meta.title,
		description: article.meta.summary,
		openGraph: {
			title: article.meta.title,
			description: article.meta.summary,
		},
	};
}

export default async function ArticlePage({ params }: PageProps) {
	const { slug } = await params;

	const article = await getCompiledArticleBySlug(slug);

	if (!article) {
		notFound();
	}

	const { meta, content } = article;

	const relatedSeries: Array<unknown> = [];

	return (
		<div className="min-h-screen">
			<BlogHeader />

			<main className="container mx-auto max-w-3xl px-4 py-12">
				<article>
					<header className="mb-12 text-center">
						<h1 className="text-[42px] font-bold leading-[1.4] text-[#191f28] mb-6">
							{meta.title}
						</h1>
						<div className="flex items-center justify-center gap-2 text-[#4e5968]">
							<span className="text-base">{meta.author ?? ""}</span>
							{meta.author && meta.date && <span>·</span>}
							<span className="text-base">{meta.date ?? ""}</span>
						</div>
					</header>

					<ArticleContent>{content}</ArticleContent>
				</article>

				{relatedSeries.length > 0 && (
					<div className="mt-20 pt-12 border-t border-border">
						<RelatedSeries articles={relatedSeries as any} />
					</div>
				)}
			</main>
		</div>
	);
}
