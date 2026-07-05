import Link from "next/link";
import Topbar from "./components/Topbar";
import { allCards, bracketCount, countLabel, expectedCardsPerSeries, seriesList } from "../lib/cards";

export default function HomePage() {
  const incomplete = seriesList.filter((series) => series.cards.length !== expectedCardsPerSeries);

  return (
    <>
      <Topbar
        eyebrow="Generated card gallery"
        title="Tango Cards"
        stats={[`${seriesList.length} series`, `${allCards().length} generated images`]}
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

          <div className="home-grid">
            {seriesList.map((series) => {
              const cover = series.cards[0];
              const isComplete = series.cards.length === expectedCardsPerSeries;

              return (
                <Link className="series-card" href={series.href} key={series.key}>
                  {cover ? <img src={cover.src} alt="" loading="lazy" /> : <span className="missing-cover" />}
                  <span className="series-card-copy">
                    <span>
                      <span className="series-title">{series.label}</span>
                      <span className="series-action">Open gallery</span>
                    </span>
                    <span className={`series-count ${isComplete ? "" : "is-short"}`}>{countLabel(series.cards.length)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
