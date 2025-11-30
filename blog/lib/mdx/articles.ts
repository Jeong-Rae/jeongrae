// lib/mdx/articles.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { slugify } from './slug'
import type { ArticleMeta, ArticleFrontmatter } from './types';

const ARTICLES_PATH = path.join(process.cwd(), 'content', 'articles');

export function getAllArticleMetas(): ArticleMeta[] {
  const files = fs.readdirSync(ARTICLES_PATH).filter((file) => file.endsWith('.mdx'));

  return files.map((fileName) => {
    const fullPath = path.join(ARTICLES_PATH, fileName);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(raw);

    const frontmatter = data as ArticleFrontmatter;
    if (!frontmatter.title) {
      throw new Error(`MDX 파일 ${fileName} 에 'title' frontmatter가 없습니다.`);
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
