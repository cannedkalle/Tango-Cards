"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { bracketCount, countLabel } from "../../lib/cards";
import { formatRemaining, loadPackState, maxPullChances, pullIntervalMs, reconcilePackState, savePackState } from "../../lib/pack-state";

function readBinder() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem("tangoCardBinder") || "{}");
  } catch {
    return {};
  }
}

function readCollection() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem("tangoCardCollection") || "{}").collection || {};
  } catch {
    return {};
  }
}

function getVisitorId() {
  const key = "tangoCardsVisitorId";
  let visitorId = window.localStorage.getItem(key);

  if (!visitorId) {
    visitorId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

function recordFeedbackEvent(event) {
  if (typeof window === "undefined") return;

  const payload = {
    visitorId: getVisitorId(),
    ...event,
  };

  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

function BinderButton({ card, binder, onToggle }) {
  const inBinder = Boolean(binder[card.key]);

  return (
    <button type="button" className="binder-button" aria-pressed={inBinder} onClick={() => onToggle(card.key)}>
      <span aria-hidden="true">{inBinder ? "♥" : "♡"}</span>
      {inBinder ? "In binder" : "Add to binder"}
    </button>
  );
}

function GalleryPackLink({ series }) {
  const [packState, setPackState] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const nextState = loadPackState();
    setPackState(nextState);
    savePackState(nextState);

    const timer = window.setInterval(() => {
      const tickNow = Date.now();
      setNow(tickNow);
      setPackState((current) => {
        const nextPackState = reconcilePackState(current || nextState, tickNow);
        savePackState(nextPackState);
        return nextPackState;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const chances = packState?.chances || 0;
  const isReady = chances > 0;
  const remainingMs = packState ? packState.lastUpdatedAt + pullIntervalMs - now : 0;
  const href = `/packs?pack=${series.key}-pack`;
  const status = !packState
    ? "Checking timer"
    : isReady
      ? `${chances}/${maxPullChances} chances ready`
      : `Next in ${formatRemaining(remainingMs)}`;

  return (
    <Link className={`gallery-pack-link ${isReady ? "" : "is-waiting"}`} href={href} aria-disabled={!isReady}>
      <span>
        <strong>Open {series.label} pack</strong>
        <small>{status}</small>
      </span>
    </Link>
  );
}

export default function GalleryClient({ series }) {
  const dialogRef = useRef(null);
  const [viewMode, setViewMode] = useState("all");
  const [largeCards, setLargeCards] = useState(false);
  const [binder, setBinder] = useState({});
  const [collection, setCollection] = useState({});
  const [previewCard, setPreviewCard] = useState(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [didLoadBinder, setDidLoadBinder] = useState(false);

  if (!didLoadBinder && typeof window !== "undefined") {
    setBinder(readBinder());
    setCollection(readCollection());
    setDidLoadBinder(true);
  }

  useEffect(() => {
    function refreshCollection() {
      setCollection(readCollection());
    }

    refreshCollection();
    window.addEventListener("storage", refreshCollection);
    window.addEventListener("focus", refreshCollection);
    return () => {
      window.removeEventListener("storage", refreshCollection);
      window.removeEventListener("focus", refreshCollection);
    };
  }, []);

  const binderCount = series.cards.filter((card) => binder[card.key]).length;
  const visibleCards = useMemo(
    () => series.cards.filter((card) => viewMode === "all" || binder[card.key]),
    [binder, series.cards, viewMode],
  );

  function toggleBinder(key) {
    const card = series.cards.find((item) => item.key === key);

    setBinder((currentBinder) => {
      const nextBinder = { ...currentBinder };
      const isRemoving = Boolean(nextBinder[key]);

      if (isRemoving) {
        delete nextBinder[key];
      } else {
        nextBinder[key] = true;
      }

      window.localStorage.setItem("tangoCardBinder", JSON.stringify(nextBinder));

      if (card) {
        recordFeedbackEvent({
          eventType: isRemoving ? "removed_from_binder" : "added_to_binder",
          cardKey: card.key,
          cardId: card.id,
          seriesKey: series.key,
          seriesLabel: series.label,
        });
      }

      return nextBinder;
    });
  }

  function openPreview(card) {
    setPreviewCard(card);
    setPromptCopied(false);
    recordFeedbackEvent({
      eventType: "card_previewed",
      cardKey: card.key,
      cardId: card.id,
      seriesKey: series.key,
      seriesLabel: series.label,
    });
    window.requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function closePreview() {
    dialogRef.current?.close();
  }

  function ownershipLabel(card) {
    const count = collection[card.key]?.count || 0;
    return count > 1 ? `Owned x${count}` : count === 1 ? "Owned" : "Not owned";
  }

async function sharePrompt() {
  if (!previewCard?.prompt) return;

  const text = `${previewCard.title}\n\n${previewCard.prompt}`;
  const shareEvent = {
    eventType: "prompt_shared",
    cardKey: previewCard.key,
    cardId: previewCard.id,
    seriesKey: series.key,
    seriesLabel: series.label,
  };

  if (navigator.share) {
    try {
      await navigator.share({ title: previewCard.title, text });
      recordFeedbackEvent(shareEvent);
      return;
    } catch {
      // Fall through to clipboard when native share is cancelled or unavailable.
    }
  }

  await navigator.clipboard.writeText(text);
  recordFeedbackEvent(shareEvent);
  setPromptCopied(true);
}

  return (
    <main>
      <section className="gallery-section" aria-live="polite">
        <div className="gallery-header">
          <Link className="back-button" href="/">
            Back
          </Link>
          <h2>{`${series.label} ${bracketCount(series.cards.length)}`}</h2>
          <GalleryPackLink series={series} />
        </div>

        <div className="controls" aria-label="Gallery controls">
          <div className="segmented" aria-label="Binder view">
            <button type="button" aria-pressed={viewMode === "all"} onClick={() => setViewMode("all")}>
              All cards
            </button>
            <button type="button" aria-pressed={viewMode === "binder"} onClick={() => setViewMode("binder")}>
              My binder [{binderCount}]
            </button>
          </div>
          <div className="size-toggle" aria-label="Card size">
            <span className="size-toggle-label">Card size</span>
            <span className="size-toggle-options">
              <button type="button" aria-pressed={!largeCards} onClick={() => setLargeCards(false)}>
                Small
              </button>
              <button type="button" aria-pressed={largeCards} onClick={() => setLargeCards(true)}>
                Large
              </button>
            </span>
          </div>
        </div>

        <section className={`gallery ${largeCards ? "is-large" : ""}`}>
          {visibleCards.length === 0 ? (
            <div className="empty">Your binder is empty for this series.</div>
          ) : (
            visibleCards.map((card) => (
              <article className="card" data-key={card.key} key={card.key}>
                <button className="card-preview" type="button" data-key={card.key} onClick={() => openPreview(card)}>
                  <img src={card.src} alt={card.title} loading="lazy" />
                  <span className="card-meta">
                    <span className="card-title">{card.title}</span>
                    <span className="card-detail">
                      <span className="tag">{series.label}</span>
                      {card.number ? ` · #${card.number}` : ""} · <span className={collection[card.key] ? "owned-status is-owned" : "owned-status"}>{ownershipLabel(card)}</span>
                    </span>
                  </span>
                </button>
                <BinderButton card={card} binder={binder} onToggle={toggleBinder} />
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
                  <dt>Collection</dt>
                  <dd>{ownershipLabel(previewCard)}</dd>
                </div>
              </dl>
              <BinderButton card={previewCard} binder={binder} onToggle={toggleBinder} />
              {previewCard.prompt ? (
                <div className="prompt-share">
                  <label htmlFor="previewPrompt">Prompt</label>
                  <textarea id="previewPrompt" readOnly value={previewCard.prompt} />
                  <button className="share-prompt-button" type="button" onClick={sharePrompt}>
                    {promptCopied ? "Prompt copied" : "Share prompt"}
                  </button>
                </div>
              ) : (
                <p className="prompt-missing">Prompt unavailable for this card.</p>
              )}
            </aside>
          </div>
        ) : null}
      </dialog>
    </main>
  );
}
