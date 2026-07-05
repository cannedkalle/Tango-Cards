import { notFound } from "next/navigation";
import GalleryClient from "../components/GalleryClient";
import Topbar from "../components/Topbar";
import { bracketCount, countLabel, getSeriesByKey, seriesList } from "../../lib/cards";
import { kofiUrl } from "../../lib/support";

export function generateStaticParams() {
  return seriesList.map((series) => ({ series: series.key }));
}

export async function generateMetadata({ params }) {
  const { series: seriesKey } = await params;
  const series = getSeriesByKey(seriesKey);
  return {
    title: series ? `${series.label} - Tango Cards` : "Tango Cards",
  };
}

export default async function SeriesPage({ params }) {
  const { series: seriesKey } = await params;
  const series = getSeriesByKey(seriesKey);

  if (!series) notFound();

  return (
    <>
      <Topbar
        eyebrow="Tango Cards"
        title={series.label}
        stats={[countLabel(series.cards.length), `${series.label} ${bracketCount(series.cards.length)}`]}
        supportUrl={kofiUrl}
      />
      <GalleryClient series={series} />
    </>
  );
}
