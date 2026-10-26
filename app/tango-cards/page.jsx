import { APP_NAMES, getAppById } from "../../lib/apps";
import { pageTitle, SITE_NAME } from "../../lib/names";
import HomeSeriesGrid from "../components/HomeSeriesGrid";
import Link from "next/link";
import Topbar from "../components/Topbar";
import { allCards, bracketCount, expectedCardsPerSeries, seriesList } from "../../lib/tango-cards/cards.mjs";

const app = getAppById("tango-cards");

export const metadata = {
  title: pageTitle(app.name),
  description: "Play " + app.name + " from " + SITE_NAME + ".",
};

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
        eyebrow="Card gallery"
        title={APP_NAMES.tangoCards}
        stats={[`${seriesList.length} series`, `${allCards().length} cards`]}
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
