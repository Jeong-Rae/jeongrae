import type { ReactElement } from "react";

export type ArticleFrontmatter = {
  title: string;
  summary: string;
  date: string;
  author?: string;
  thumbnail?: string;
  tags?: string[];
};

export type ArticleMeta = ArticleFrontmatter & {
  slug: string;
  filePath: string;
};

export type CompiledArticle = {
  meta: ArticleFrontmatter & {
    slug: string;
  };
  content: ReactElement;
};