import HomeSeriesGrid from "../components/HomeSeriesGrid";
import Link from "next/link";
import Topbar from "../components/Topbar";
import { allCards, bracketCount, expectedCardsPerSeries, seriesList } from "../../lib/cards";
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { kofiUrl } from "../../lib/support";
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
=======
import { kofiUrl } from "../../lib/support";
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317

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
<<<<<<< HEAD
<<<<<<< HEAD
        eyebrow="Card gallery"
        title="Tango Cards"
        stats={[`${seriesList.length} series`, `${allCards().length} cards`]}
=======
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
        eyebrow="Generated card gallery"
        title="Tango Cards"
        stats={[`${seriesList.length} series`, `${allCards().length} generated images`]}
        supportUrl={kofiUrl}
<<<<<<< HEAD
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
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

          <Link className="pack-entry" href="/packs">
            <span>
              <strong>Open expansion packs</strong>
              <small>Pull digital cards, bank chances, and build a local collection.</small>
            </span>
            <b>Enter</b>
          </Link>

          <HomeSeriesGrid series={seriesSummaries} />
        </section>
      </main>
    </>
  );
}
