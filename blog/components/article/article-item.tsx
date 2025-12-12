"use client";

import Link from "next/link";

import { Image } from "@/components/ui/image";
import type { ArticleMeta } from "@/lib/mdx/types";
import { cn } from "@/lib/utils";

import Mesh185_1 from "@/public/mesh-185-1.png";
import Mesh185_2 from "@/public/mesh-185-2.png";
import Mesh757_1 from "@/public/mesh-757-1.png";
import Mesh757_2 from "@/public/mesh-757-2.png";

type ArticleItemProps = {
  article: ArticleMeta;
  variant?: "list" | "overlay";
  onSelect?: () => void;
  className?: string;
};

const fallbackThumbnails = [Mesh185_1, Mesh185_2, Mesh757_1, Mesh757_2];

function pickMeshBySlug(slug: string) {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = slug.charCodeAt(index) + ((hash << 5) - hash);
  }
  const selectedIndex = Math.abs(hash) % fallbackThumbnails.length;
  return fallbackThumbnails[selectedIndex];
}

const variantStyles = {
  list: {
    container:
      "group flex gap-6 py-6 border-b border-border last:border-0 hover:opacity-80 transition-opacity",
    content: "flex-1 flex flex-col justify-between min-w-0",
    headingWrapper: "space-y-2",
    title:
      "font-bold text-[20px] leading-[1.6] text-[var(--color-shark-800)] group-hover:text-[#3182f6] transition-colors",
    summary: "text-sm leading-[1.6] text-[var(--color-shark-700)]",
    meta: "text-xs leading-[1.6] text-[var(--color-shark-700)] mt-3",
    imageWrapper:
      "flex-shrink-0 w-[130px] h-[130px] rounded-lg overflow-hidden",
    imageClassName: "w-full h-full object-cover",
    imageSize: { width: 130, height: 130 },
  },
  overlay: {
    container:
      "flex items-start justify-between gap-4 py-5 border-b border-border hover:bg-muted/50 transition-colors px-2 rounded-lg",
    content: "flex-1 min-w-0",
    headingWrapper: "space-y-2",
    title:
      "font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2",
    summary: "text-sm text-muted-foreground line-clamp-2 mb-3",
    meta: "text-xs text-muted-foreground",
    imageWrapper: "flex-shrink-0",
    imageClassName: "rounded-lg object-cover w-[130px] h-[90px]",
    imageSize: { width: 130, height: 90 },
  },
} satisfies Record<
  NonNullable<ArticleItemProps["variant"]>,
  {
    container: string;
    content: string;
    headingWrapper: string;
    title: string;
    summary: string;
    meta: string;
    imageWrapper: string;
    imageClassName: string;
    imageSize: { width: number; height: number };
  }
>;

export function ArticleItem({
  article,
  variant = "list",
  onSelect,
  className,
}: ArticleItemProps) {
  const styles = variantStyles[variant];
  const { slug, thumbnail, title, summary, uploadAt, author } = article;
  const resolvedThumbnail = thumbnail ?? pickMeshBySlug(slug);

  return (
    <Link
      href={`/articles/${slug}`}
      onClick={onSelect}
      className={cn(styles.container, className)}
    >
      <div className={styles.content}>
        <div className={styles.headingWrapper}>
          <h3 className={styles.title}>{title}</h3>
          {summary && <p className={styles.summary}>{summary}</p>}
        </div>
        <div className={styles.meta}>
          {uploadAt} {author && `· ${author}`}
        </div>
      </div>
      <div className={styles.imageWrapper}>
        <Image
          src={resolvedThumbnail}
          alt={title}
          width={styles.imageSize.width}
          height={styles.imageSize.height}
          className={styles.imageClassName}
        />
      </div>
    </Link>
  );
}
