"use client";

import { EmptyArticle } from "@/components/article/empty-article";
import { isEmpty } from "es-toolkit/compat";
import type { ArticleMeta } from "@/lib/mdx/types";
import { Repeat } from "@/lib/react/repeat";

import Mesh185_1 from "@/public/mesh-185-1.png";
import Mesh185_2 from "@/public/mesh-185-2.png";
import Mesh757_1 from "@/public/mesh-757-1.png";
import Mesh757_2 from "@/public/mesh-757-2.png";

import { Image } from "../ui/image";

type ArticleListProps = {
  articles: ArticleMeta[];
};

const fallbackThumbnails = [Mesh185_1, Mesh185_2, Mesh757_1, Mesh757_2];

function pickMeshBySlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % fallbackThumbnails.length;
  return fallbackThumbnails[index];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (isEmpty(articles)) {
    return <EmptyArticle />;
  }

  return (
    <div className="space-y-6">
      <Repeat.Each each={articles} itemKey={(article) => article.slug}>
        {({
          title,
          slug,
          summary,
          uploadAt = "",
          author,
          thumbnail = pickMeshBySlug(slug),
        }) => (
          <a
            href={`/articles/${slug}`}
            className="group flex gap-6 py-6 border-b border-border last:border-0 hover:opacity-80 transition-opacity"
          >
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-2">
                  <h3 className="font-bold text-[20px] leading-[1.6] text-[#4e5968] group-hover:text-[#3182f6] transition-colors">
                    {title}
                  </h3>
                  {summary && (
                    <p className="text-sm leading-[1.6] text-[#4e5968]">
                      {summary}
                    </p>
                  )}
                </div>
                <div className="text-xs leading-[1.6] text-[#4e5968] mt-3">
                  {uploadAt} {author && `· ${author}`}
                </div>
              </div>
              <div className="flex-shrink-0 w-[130px] h-[130px] rounded-lg overflow-hidden">
                <Image
                  src={thumbnail}
                  alt={title}
                  width={130}
                  height={130}
                  className="w-full h-full object-cover"
                />
              </div>
            </a>
        )}
      </Repeat.Each>
    </div>
  );
}
