"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function countLabel(count) {
  return `[${count}] ${count === 1 ? "card" : "cards"}`;
}

export default function HomeSeriesGrid({ series }) {
  const [popularity, setPopularity] = useState({});
  const [popularityLoaded, setPopularityLoaded] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/series-popularity?days=30")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !data?.configured) return;
        setPopularity(data.counts || {});
        setPopularityLoaded(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedSeries = useMemo(
    () => {
      const sorted = [...series];

      sorted.sort((a, b) => {
        if (sortBy === "date") {
          return b.dateRank - a.dateRank || a.order - b.order;
        }

        if (sortBy === "name") {
          return a.label.localeCompare(b.label, undefined, { numeric: true });
        }

        const popularityDelta = (popularity[b.key] || 0) - (popularity[a.key] || 0);
        return popularityDelta || a.order - b.order;
      });

      return sorted;
    },
    [popularity, series, sortBy],
  );

  return (
    <>
      <div className="home-sort" aria-label="Sort series">
        <span className="home-sort-label">Sort by</span>
        <span className="home-sort-options">
          <button type="button" aria-pressed={sortBy === "name"} onClick={() => setSortBy("name")}>
            Series name
          </button>
          <button type="button" aria-pressed={sortBy === "popularity"} onClick={() => setSortBy("popularity")}>
            Popularity
          </button>
          <button type="button" aria-pressed={sortBy === "date"} onClick={() => setSortBy("date")}>
            Date
          </button>
        </span>
      </div>

      <div className="home-grid">
        {sortedSeries.map((item) => {
          const isComplete = item.cardCount === item.expectedCount;
          const addCount = popularity[item.key] || 0;

          return (
            <Link className="series-card" href={item.href} key={item.key}>
              {item.coverSrc ? <img src={item.coverSrc} alt="" loading="lazy" /> : <span className="missing-cover" />}
              <span className="series-card-copy">
                <span>
                  <span className="series-title">{item.label}</span>
                  <span className="series-action">Open gallery</span>
                </span>
                <span className={`series-count ${isComplete ? "" : "is-short"}`}>{countLabel(item.cardCount)}</span>
              </span>
              {sortBy === "popularity" && popularityLoaded ? <span className="popularity-note">{addCount} binder adds in 30 days</span> : null}
            </Link>
          );
        })}
      </div>
    </>
  );
}
