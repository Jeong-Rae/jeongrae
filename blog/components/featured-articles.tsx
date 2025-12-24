import { isEmpty } from "es-toolkit/compat";
import Link from "next/link";

import { getFeaturedArticles } from "@/lib/mdx/articles";
import { Repeat } from "@/lib/react/repeat";
import { Typography } from "./ui/typography";

export function FeaturedArticles() {
  const featuredArticles = getFeaturedArticles();

  if (isEmpty(featuredArticles)) return null;

  return (
    <div>
      <Typography.H5 className="font-bold text-lg mb-4 text-[#191f28]">
        추천글
      </Typography.H5>
      <div className="space-y-4">
        <Repeat.Each
          each={featuredArticles}
          itemKey={(article) => article.slug}
        >
          {({ slug, featured, title, author }) => {
            return (
              <Link
                href={`/articles/${slug}`}
                className="block group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-[#3182f6]">
                    {featured}
                  </span>
                  <div>
                    <Typography.H6 className="font-medium text-sm leading-snug mb-1 text-balance text-[#4e5968] group-hover:text-[#3182f6] transition-colors mt-0">
                      {title}
                    </Typography.H6>
                    <p className="text-[#6b7684] text-xs">
                      {author || "unknown"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          }}
        </Repeat.Each>
      </div>
    </div>
  );
}
