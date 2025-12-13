import type { SeriesGroup } from "@/lib/mdx/articles";
import { Repeat } from "@/lib/react/repeat";
import { SeriesCard } from "./series-card";

export function SeriesSectionClient({
  seriesList,
}: {
  seriesList: SeriesGroup[];
}) {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4">이달의 시리즈</h3>
      <div className="space-y-4">
        <Repeat.Each each={seriesList} itemKey={(series) => series.seriesSlug}>
          {(series) => <SeriesCard series={series} />}
        </Repeat.Each>
      </div>
    </div>
  );
}
