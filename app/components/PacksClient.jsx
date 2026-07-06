"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cardsPerPull, maxPullChances, pullIntervalMs } from "../../lib/packs";
import { emptyPackState, formatRemaining, loadPackState, reconcilePackState, savePackState } from "../../lib/pack-state";
import { rarityLabels, rarityOrder } from "../../lib/rarities";

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

function chooseByOdds(odds) {
  const roll = Math.random();
  let running = 0;

  for (const item of odds) {
    running += item.rate;
    if (roll <= running) return item.rarity;
  }

  return odds[odds.length - 1].rarity;
}

function chooseCard(pack, cards) {
  const rarity = chooseByOdds(pack.odds);
  const candidates = cards.filter((card) => card.rarity === rarity);
  const pool = candidates.length > 0 ? candidates : cards;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pullCards(pack, cards) {
  return Array.from({ length: cardsPerPull }, () => chooseCard(pack, cards));
}

export default function PacksClient({ packs, series, initialPackKey }) {
  const [state, setState] = useState(emptyPackState);
  const [selectedPackKey, setSelectedPackKey] = useState(initialPackKey || packs[0]?.key || "");
  const [now, setNow] = useState(Date.now());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextState = loadPackState();
    setState(nextState);
    setLoaded(true);
    savePackState(nextState);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
      setState((current) => {
        const nextState = reconcilePackState(current, Date.now());
        savePackState(nextState);
        return nextState;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const selectedPack = packs.find((pack) => pack.key === selectedPackKey) || packs[0];
  const selectedSeries = series.find((item) => item.key === selectedPack?.seriesKey) || series[0];
  const ownedKeys = Object.keys(state.collection || {});
  const totalCopies = ownedKeys.reduce((sum, key) => sum + (state.collection[key]?.count || 0), 0);
  const nextChanceMs = state.chances >= maxPullChances ? 0 : state.lastUpdatedAt + pullIntervalMs - now;
  const chanceLabel = loaded
    ? state.chances >= maxPullChances
      ? "Fully charged"
      : `Next in ${formatRemaining(nextChanceMs)}`
    : "Checking timer";

  const collectionCards = useMemo(() => {
    const cards = series.flatMap((item) => item.cards);
    return cards
      .filter((card) => state.collection?.[card.key])
      .map((card) => ({
        ...card,
        count: state.collection[card.key].count,
      }))
      .sort((a, b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity) || a.series.localeCompare(b.series) || a.number.localeCompare(b.number));
  }, [series, state.collection]);

  function openPack() {
    if (!selectedPack || !selectedSeries || state.chances <= 0) return;

    const pulledCards = pullCards(selectedPack, selectedSeries.cards);
    const pulledAt = new Date().toISOString();

    recordFeedbackEvent({
      eventType: "pack_opened",
      cardId: selectedPack.key,
      seriesKey: selectedSeries.key,
      seriesLabel: selectedSeries.label,
    });

    setState((current) => {
      const collection = { ...current.collection };

      pulledCards.forEach((card) => {
        const existing = collection[card.key] || { count: 0, firstPulledAt: pulledAt };
        collection[card.key] = {
          ...existing,
          count: existing.count + 1,
          lastPulledAt: pulledAt,
        };
      });

      const nextState = {
        ...current,
        chances: Math.max(0, current.chances - 1),
        collection,
        recentPull: pulledCards.map((card) => card.key),
        recentPullPackLabel: selectedPack.label,
      };

      savePackState(nextState);
      return nextState;
    });
  }

  const recentCards = state.recentPull
    .map((key) => series.flatMap((item) => item.cards).find((card) => card.key === key))
    .filter(Boolean);

  return (
    <main>
      <section className="packs-layout">
        <div className="pack-status">
          <Link className="back-button" href="/">
            Back
          </Link>
          <div>
            <p className="eyebrow">Digital pulls</p>
            <h2>Expansion Packs</h2>
          </div>
          <div className="chance-meter" aria-live="polite">
            <span>{loaded ? state.chances : 0}/{maxPullChances} chances</span>
            <small>{chanceLabel}</small>
          </div>
        </div>

        <div className="pack-grid">
          {packs.map((pack) => (
            <button
              className="pack-card"
              type="button"
              aria-pressed={pack.key === selectedPack?.key}
              key={pack.key}
              onClick={() => setSelectedPackKey(pack.key)}
            >
              {pack.coverSrc ? <img src={pack.coverSrc} alt="" /> : null}
              <span>
                <strong>{pack.label}</strong>
                <small>{pack.description}</small>
              </span>
            </button>
          ))}
        </div>

        <section className="pack-opener">
          <div className="pack-copy">
            <p className="eyebrow">{selectedPack?.seriesLabel}</p>
            <h2>{selectedPack?.label}</h2>
            <p>{cardsPerPull} digital cards per pull. Each card slot rolls independently. Pull chances refresh every 12 hours and bank up to {maxPullChances}.</p>
            <div className="odds-row" aria-label="Pack odds">
              {selectedPack?.odds.map((item) => (
                <span className={`rarity-pill rarity-${item.rarity}`} key={item.rarity}>
                  {rarityLabels[item.rarity]} {Math.round(item.rate * 100)}%
                </span>
              ))}
            </div>
            <button className="open-pack-button" type="button" disabled={state.chances <= 0} onClick={openPack}>
              {state.chances > 0 ? "Open pack" : "No chances ready"}
            </button>
          </div>

          <div className="recent-pull-panel">
            {recentCards.length > 0 ? (
              <>
                <div className="pull-panel-header">
                  <p className="eyebrow">{state.recentPullPackLabel ? `Last pull · ${state.recentPullPackLabel}` : "Last pull"}</p>
                  <span>{recentCards.length} cards</span>
                </div>
                <div className="recent-pull" aria-live="polite">
                  {recentCards.map((card, index) => (
                    <article className={`pull-card rarity-border-${card.rarity}`} key={`${card.key}-${index}`}>
                      <img src={card.src} alt={card.title} />
                      <span>{card.title}</span>
                      <small>{rarityLabels[card.rarity]}</small>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-pull">
                <strong>Ready when you are.</strong>
                <span>Choose a pack and open your first pull.</span>
              </div>
            )}
          </div>
        </section>

        <section className="collection-section">
          <div className="collection-header">
            <div>
              <p className="eyebrow">Local collection</p>
              <h2>My Collection</h2>
            </div>
            <span className="series-count">{ownedKeys.length}/80 unique · {totalCopies} copies</span>
          </div>

          {collectionCards.length > 0 ? (
            <div className="collection-grid">
              {collectionCards.map((card) => (
                <article className={`collection-card rarity-border-${card.rarity}`} key={card.key}>
                  <img src={card.src} alt={card.title} />
                  <span>
                    <strong>{card.title}</strong>
                    <small>{card.series} · {rarityLabels[card.rarity]}</small>
                  </span>
                  <b>×{card.count}</b>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">Your collection is empty.</div>
          )}
        </section>
      </section>
    </main>
  );
}
