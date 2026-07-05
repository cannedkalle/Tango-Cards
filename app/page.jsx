import HomeSeriesGrid from "./components/HomeSeriesGrid";
import Topbar from "./components/Topbar";
import { allCards, bracketCount, expectedCardsPerSeries, seriesList } from "../lib/cards";
import { kofiUrl } from "../lib/support";

export default function HomePage() {
  const incomplete = seriesList.filter((series) => series.cards.length !== expectedCardsPerSeries);
  const seriesSummaries = seriesList.map((series, index) => ({
    key: series.key,
    label: series.label,
    href: series.href,
    order: index,
    dateRank: index,
    cardCount: series.cards.length,
    expectedCount: expectedCardsPerSeries,
    coverSrc: series.cards[0]?.src || "",
  }));

  return (
    <>
      <Topbar
        eyebrow="Generated card gallery"
        title="Tango Cards"
        stats={[`${seriesList.length} series`, `${allCards().length} generated images`]}
        supportUrl={kofiUrl}
      />
      <main>
        <section className="home" aria-live="polite">
          {incomplete.length > 0 ? (
            <div className="warning" role="status">
              {incomplete
                .map((series) => `${series.label} has ${bracketCount(series.cards.length)}, expected ${bracketCount(expectedCardsPerSeries)}.`)
                .join(" ")}
            </div>
          ) : null}

          <HomeSeriesGrid series={seriesSummaries} />
        </section>
      </main>
    </>
  );
}
