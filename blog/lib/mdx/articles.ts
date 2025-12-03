import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { orderBy } from "es-toolkit";
import { clamp } from "@lyght/ts";
import { slugify } from "./slug";
import type { ArticleMeta, ArticleFrontmatter } from "./types";

const ARTICLES_PATH = path.join(process.cwd(), "content", "articles");

export function getAllArticleMetas(): ArticleMeta[] {
  const files = fs
    .readdirSync(ARTICLES_PATH)
    .filter((file) => file.endsWith(".mdx"));

  return files.map((fileName) => {
    const fullPath = path.join(ARTICLES_PATH, fileName);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);

    const frontmatter = data as ArticleFrontmatter;
    if (!frontmatter.title) {
      throw new Error(
        `MDX 파일 ${fileName} 에 'title' frontmatter가 없습니다.`,
      );
    }

    const slug = slugify(frontmatter.title);

    return {
      ...frontmatter,
      slug,
      filePath: fullPath,
    };
  });
}

export function findArticleMetaBySlug(slug: string): ArticleMeta | null {
  const metas = getAllArticleMetas();
  return metas.find((meta) => meta.slug === slug) ?? null;
}

type PaginatedResult = {
  articles: ArticleMeta[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export function getPaginatedArticles(
  page: number = 1,
  articlesPerPage = 10,
): PaginatedResult {
  const metas = getAllArticleMetas();

  const sortedArticles = orderBy(
    metas,
    [(item) => (item.date ? new Date(item.date).getTime() : 0)],
    ["desc"],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedArticles.length / articlesPerPage),
  );

  const currentPage = clamp(page, 1, totalPages);

  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const articles = sortedArticles.slice(startIndex, endIndex);

  return {
    articles,
    currentPage,
    totalPages,
    totalCount: sortedArticles.length,
  };
}
