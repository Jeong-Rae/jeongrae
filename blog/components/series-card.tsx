"use client";

import { Badge } from "@/components/ui/badge";
import type { SeriesGroup } from "@/lib/mdx/articles";
import { useCircleIndexNavigator } from "@/hook/useIndexNavigator";
import { useScheduleEffect } from "@/hook/useScheduleEffect";
import { isEmpty, isNil } from "es-toolkit/compat";

export function SeriesCard({ series }: { series: SeriesGroup }) {
  const { series: seriesTitle, articles } = series;
  const episodes = articles.map(({ title }) => title);
  const latestArticle = articles[articles.length - 1];
  const { thumbnail = "/placeholder.svg", summary = "" } = latestArticle ?? {};

  const episodeCountLabel = `${articles.length}편 연재 중`;

  if (isEmpty(episodes)) return null;

  const {
    item: currentEpisode,
    length: episodeLength,
    goNext,
  } = useCircleIndexNavigator<string>({ items: episodes });

  useScheduleEffect({
    every: "3s",
    do: goNext,
    until: () => episodeLength <= 1,
  });

  const episodeTitle = isNil(currentEpisode) ? episodes[0] : currentEpisode;

  return (
    <div className="border border-border rounded-lg hover:border-foreground/20 transition-colors">
      <div className="p-4">
        <div className="flex flex-row-reverse gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={thumbnail}
              alt={seriesTitle}
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
            <div className="text-foreground/70 text-xs">{episodeTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
