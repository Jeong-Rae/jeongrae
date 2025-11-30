import type { ReactElement } from "react";

export type ArticleMedia = {
    thumbnail: {
        url: string;
        alt: string;
    }
}

export type ArticleFrontmatter = {
  title: string;
  summary: string;
  date: string;
  author?: string;
  media?: ArticleMedia;
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