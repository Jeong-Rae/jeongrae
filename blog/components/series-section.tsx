import { isEmpty } from "es-toolkit/compat";

import { getSeriesGroups } from "@/lib/mdx/articles";
import { SeriesSectionClient } from "./series-section.client";

export function SeriesSection() {
  const seriesList = getSeriesGroups();

  const isDisabled = true; // Note: development for test code

  if (isEmpty(seriesList) || isDisabled) return null;

  return <SeriesSectionClient seriesList={seriesList} />;
}
