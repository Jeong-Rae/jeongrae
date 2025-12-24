"use client";

import { EmptyArticle } from "@/components/article/empty-article";
import { isEmpty } from "es-toolkit/compat";
import { ArticleItem } from "@/components/article/article-item";
import type { ArticleMeta } from "@/lib/mdx/types";
import { Repeat } from "@/lib/react/repeat";

type ArticleListProps = {
  articles: ArticleMeta[];
};

export function ArticleList({ articles }: ArticleListProps) {
  if (isEmpty(articles)) {
    return <EmptyArticle />;
  }

  return (
    <div>
      <Repeat.Each each={articles} itemKey={(article) => article.slug}>
        {(article) => <ArticleItem article={article} isActive={false} />}
      </Repeat.Each>
    </div>
  );
}
