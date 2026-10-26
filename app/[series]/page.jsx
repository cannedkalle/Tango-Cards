import { notFound } from "next/navigation";
import { APP_NAMES } from "../../lib/apps";
import { pageTitle } from "../../lib/names";
import GalleryClient from "../tango-cards/GalleryClient";
import Topbar from "../components/Topbar";
import { bracketCount, countLabel, getSeriesByKey, seriesList } from "../../lib/tango-cards/cards.mjs";

export function generateStaticParams() {
  return seriesList.map((series) => ({ series: series.key }));
}

export async function generateMetadata({ params }) {
  const { series: seriesKey } = await params;
  const series = getSeriesByKey(seriesKey);
  return {
    title: series ? pageTitle(series.label + " - " + APP_NAMES.tangoCards) : pageTitle(APP_NAMES.tangoCards),
  };
}

export default async function SeriesPage({ params }) {
  const { series: seriesKey } = await params;
  const series = getSeriesByKey(seriesKey);

  if (!series) notFound();

  return (
    <>
      <Topbar
        eyebrow={APP_NAMES.tangoCards}
        title={series.label}
        stats={[countLabel(series.cards.length), `${series.label} ${bracketCount(series.cards.length)}`]}
      />
      <GalleryClient series={series} />
    </>
  );
}
