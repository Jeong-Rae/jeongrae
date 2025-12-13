import { isEmpty } from "es-toolkit/compat";

import { getSeriesGroups } from "@/lib/mdx/articles";
import { SeriesSectionClient } from "./series-section.client";

export function SeriesSection() {
  const seriesList = getSeriesGroups();

  if (isEmpty(seriesList)) return null;

  return <SeriesSectionClient seriesList={seriesList} />;
}
