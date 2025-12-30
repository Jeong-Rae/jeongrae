"use client";

import type { SeriesGroup } from "@/lib/mdx/articles";
import { useCircleIndexNavigator, useScheduleEffect } from "@jeongrae/hook";
import { Badge, Image } from "@jeongrae/ui";
import Link from "next/link";

export function SeriesCard({ series }: { series: SeriesGroup }) {
  const { series: seriesTitle, articles } = series;
  const episodes = articles.map(({ title, slug }) => ({ title, slug }));
  const latestArticle = articles[articles.length - 1];
  const { thumbnail = "/placeholder.svg", summary = "" } = latestArticle ?? {};

  const episodeCountLabel = `${articles.length}편 연재 중`;

  const {
    item: currentEpisode,
    length: episodeLength,
    goNext,
  } = useCircleIndexNavigator<{ title: string; slug: string }>({
    items: episodes,
  });

  const hasEpisodes = episodes.length > 0;

  useScheduleEffect({
    every: "3s",
    do: goNext,
    until: () => !hasEpisodes || episodeLength <= 1,
  });

  if (!hasEpisodes) return null;

  const episodeTitle = currentEpisode?.title ?? episodes[0].title;
  const titleSlug = currentEpisode?.slug ?? latestArticle?.slug ?? "";

  return (
    <div className="border border-border rounded-lg hover:border-foreground/20 transition-colors">
      <div className="p-4">
        <div className="flex flex-row-reverse gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={thumbnail}
              alt={seriesTitle}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">{seriesTitle}</h4>
            <p className="text-muted-foreground text-xs leading-relaxed mb-2">
              {summary}
            </p>
            <Badge variant="secondary" className="mb-2 text-xs">
              {episodeCountLabel}
            </Badge>
            <Link href={`/articles/${titleSlug}`}>
              <div className="text-foreground/70 text-xs">{episodeTitle}</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
