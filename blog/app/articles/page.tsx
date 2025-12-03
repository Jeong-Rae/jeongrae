import { getAllArticleMetas } from "@/lib/mdx/articles";
import { ArticleList } from "@/components/article-list";

export default function ArticlesIndexPage() {
	const metas = getAllArticleMetas();

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-3xl font-bold mb-6">Articles</h1>

			<ArticleList articles={metas} />
		</main>
	);
}
