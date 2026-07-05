"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { bracketCount, countLabel } from "../../lib/cards";

const ratingFilters = ["All", "Rated", "Unrated", "Favorites"];

function readRatings() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem("tangoCardRatings") || "{}");
  } catch {
    return {};
  }
}

function Rating({ card, ratings, onRate, label = "Rate this card" }) {
  const current = ratings[card.key] || 0;

  return (
    <span className="rating" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          type="button"
          className="star"
          data-rate={value}
          data-key={card.key}
          aria-label={`${value} star${value === 1 ? "" : "s"}`}
          aria-pressed={current === value}
          title={`${value} star${value === 1 ? "" : "s"}`}
          key={value}
          onClick={() => onRate(card.key, value)}
        >
          {value <= current ? "★" : "☆"}
        </button>
      ))}
    </span>
  );
}

export default function GalleryClient({ series }) {
  const dialogRef = useRef(null);
  const [ratingFilter, setRatingFilter] = useState("All");
  const [largeCards, setLargeCards] = useState(false);
  const [ratings, setRatings] = useState({});
  const [previewCard, setPreviewCard] = useState(null);
  const [didLoadRatings, setDidLoadRatings] = useState(false);

  if (!didLoadRatings && typeof window !== "undefined") {
    setRatings(readRatings());
    setDidLoadRatings(true);
  }

  const visibleCards = useMemo(
    () =>
      series.cards.filter((card) => {
        const rating = ratings[card.key] || 0;
        return (
          ratingFilter === "All" ||
          (ratingFilter === "Rated" && rating > 0) ||
          (ratingFilter === "Unrated" && rating === 0) ||
          (ratingFilter === "Favorites" && rating === 5)
        );
      }),
    [ratingFilter, ratings, series.cards],
  );

  function setRating(key, value) {
    setRatings((currentRatings) => {
      const nextRatings = {
        ...currentRatings,
        [key]: currentRatings[key] === value ? 0 : value,
      };

      window.localStorage.setItem("tangoCardRatings", JSON.stringify(nextRatings));
      return nextRatings;
    });
  }

  function openPreview(card) {
    setPreviewCard(card);
    window.requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function closePreview() {
    dialogRef.current?.close();
  }

  return (
    <main>
      <section className="gallery-section" aria-live="polite">
        <div className="gallery-header">
          <Link className="back-button" href="/">
            Back
          </Link>
          <h2>{`${series.label} ${bracketCount(series.cards.length)}`}</h2>
        </div>

        <div className="controls" aria-label="Gallery controls">
          <div className="segmented" aria-label="Rating filters">
            {ratingFilters.map((filter) => (
              <button
                type="button"
                data-rating-filter={filter}
                aria-pressed={filter === ratingFilter}
                key={filter}
                onClick={() => setRatingFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <button
            className={`icon-button ${largeCards ? "is-active" : ""}`}
            type="button"
            aria-label="Toggle large cards"
            title="Toggle large cards"
            onClick={() => setLargeCards((current) => !current)}
          >
            <span aria-hidden="true">□</span>
          </button>
        </div>

        <section className={`gallery ${largeCards ? "is-large" : ""}`}>
          {visibleCards.length === 0 ? (
            <div className="empty">No cards match this view.</div>
          ) : (
            visibleCards.map((card) => (
              <article className="card" data-key={card.key} key={card.key}>
                <button className="card-preview" type="button" data-key={card.key} onClick={() => openPreview(card)}>
                  <img src={card.src} alt={card.title} loading="lazy" />
                  <span className="card-meta">
                    <span className="card-title">{card.title}</span>
                    <span className="card-detail">
                      <span className="tag">{series.label}</span>
                      {card.number ? ` · #${card.number}` : ""} · {card.status}
                    </span>
                  </span>
                </button>
                <Rating card={card} ratings={ratings} onRate={setRating} />
              </article>
            ))
          )}
        </section>
      </section>

      <dialog
        className="preview-dialog"
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) closePreview();
        }}
      >
        <button className="close-button" type="button" aria-label="Close preview" onClick={closePreview}>
          ×
        </button>
        {previewCard ? (
          <div className="preview-shell">
            <img src={previewCard.src} alt={previewCard.title} />
            <aside>
              <p className="eyebrow">{series.label}</p>
              <h2>{previewCard.title}</h2>
              <dl>
                <div>
                  <dt>Card</dt>
                  <dd>{previewCard.number ? `#${previewCard.number}` : "Unnumbered"}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{previewCard.status}</dd>
                </div>
              </dl>
              <Rating card={previewCard} ratings={ratings} onRate={setRating} label="Rate preview card" />
              <a className="download-link" href={previewCard.src} download={`${previewCard.id}.jpg`}>
                Download JPG
              </a>
            </aside>
          </div>
        ) : null}
      </dialog>
    </main>
  );
}
