import type { ArticleMeta } from "@/lib/mdx/types";
import { Repeat } from "@/lib/react/repeat";
import Link from "next/link";
import { Image } from "@jeongrae/ui";

export function RelatedSeries({ articles }: { articles: ArticleMeta[] }) {
  return (
    <section>
      <h2 className="text-[24px] font-bold text-[#191f28] mb-8">
        이어서 보면 글
      </h2>

      <div className="space-y-6">
        <Repeat.Each each={articles} itemKey={(article) => article.slug}>
          {(article) => (
            <Link
              href={`/articles/${article.slug}`}
              className="group flex gap-6 py-6 border-b border-border last:border-0 hover:opacity-80 transition-opacity"
            >
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-2">
                  <h3 className="font-bold text-[20px] leading-[1.6] text-[#4e5968] group-hover:text-[#3182f6] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm leading-[1.6] text-[#4e5968]">
                    {article.summary}
                  </p>
                </div>
                <div className="text-xs leading-[1.6] text-[#4e5968] mt-3">
                  {article.uploadAt} {article.author && `· ${article.author}`}
                </div>
              </div>
              <div className="flex-shrink-0 w-[130px] h-[90px] rounded-lg overflow-hidden">
                <Image
                  src={article.thumbnail ?? "/placeholder.svg"}
                  alt={article.title}
                  width={130}
                  height={90}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          )}
        </Repeat.Each>
      </div>
    </section>
  );
}
