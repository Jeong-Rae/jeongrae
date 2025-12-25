"use client";

import Link from "next/link";

import { Image } from "@/components/ui/image";
import type { ArticleMeta } from "@/lib/mdx/types";
import { cn } from "@/lib/utils";

import Mesh185_1 from "@/public/mesh-185-1.png";
import Mesh185_2 from "@/public/mesh-185-2.png";
import Mesh757_1 from "@/public/mesh-757-1.png";
import Mesh757_2 from "@/public/mesh-757-2.png";
import { Typography } from "../ui/typography";

type ArticleItemProps = {
  article: ArticleMeta;
  variant?: "list" | "overlay";
  onSelect?: () => void;
  className?: string;
  isActive: boolean;
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

const sharedStyles = {
  container:
    "group flex gap-6 py-6 px-2 rounded-lg transition-colors hover:bg-muted/50",
  content: "flex-1 flex flex-col justify-between min-w-0",
  headingWrapper: "space-y-2",
  title:
    "font-bold text-[20px] leading-[1.6] text-[var(--color-slate-700)] transition-colors line-clamp-2 group-hover:text-primary",
  summary: "text-sm leading-[1.6] text-[var(--color-slate-500)] line-clamp-2",
  meta: "text-xs leading-[1.6] text-[var(--color-slate-500)] mt-3",
  imageWrapper: "flex-shrink-0 w-[130px] h-[130px] rounded-lg overflow-hidden",
  imageClassName:
    "w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.2]",
  imageSize: { width: 130, height: 130 },
};

const variantStyles = {
  list: sharedStyles,
  overlay: sharedStyles,
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

function Heading({
  title,
  className,
  isActive,
}: {
  title: string;
  className?: string;
  isActive: boolean;
}) {
  return (
    <Typography.H5
      className={cn(className, {
        "text-primary": isActive,
      })}
    >
      {title}
    </Typography.H5>
  );
}

function Summary({ text, className }: { text: string; className?: string }) {
  return <Typography.P className={cn("!mt-0", className)}>{text}</Typography.P>;
}

function Meta({
  uploadAt,
  author,
  className,
}: {
  uploadAt: string;
  author?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {uploadAt} {author && `· ${author}`}
    </div>
  );
}

function Thumbnail({
  src,
  alt,
  width,
  height,
  wrapperClassName,
  imageClassName,
  isActive,
}: {
  src: string | import("next/image").StaticImageData;
  alt: string;
  width: number;
  height: number;
  wrapperClassName?: string;
  imageClassName?: string;
  isActive: boolean;
}) {
  return (
    <div className={wrapperClassName}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(imageClassName, {
          "scale-[1.2]": isActive,
        })}
      />
    </div>
  );
}

export function ArticleItem({
  article,
  variant = "list",
  onSelect,
  className,
  isActive,
}: ArticleItemProps) {
  const styles = variantStyles[variant];
  const { slug, thumbnail, title, summary, uploadAt, author } = article;
  const resolvedThumbnail = thumbnail ?? pickMeshBySlug(slug);

  return (
    <Link
      href={`/articles/${slug}`}
      onClick={onSelect}
      className={cn(
        styles.container,
        {
          "bg-muted/50": isActive,
        },
        className,
      )}
    >
      <div className={styles.content}>
        <div className={styles.headingWrapper}>
          <Heading title={title} className={styles.title} isActive={isActive} />

          {summary && <Summary className={styles.summary} text={summary} />}
        </div>

        <Meta uploadAt={uploadAt} author={author} className={styles.meta} />
      </div>

      <Thumbnail
        src={resolvedThumbnail}
        alt={title}
        width={styles.imageSize.width}
        height={styles.imageSize.height}
        wrapperClassName={styles.imageWrapper}
        imageClassName={styles.imageClassName}
        isActive={isActive}
      />
    </Link>
  );
}
