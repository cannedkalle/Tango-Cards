'use client';

import { useEffect, useRef, useState } from 'react';
import PortalNav from '../components/PortalNav';
import { createGame } from '../../lib/before-the-bulb/game.mjs';
import {
  objectMap,
  objects,
  pairs,
  sourceMap,
  wildPairs,
} from '../../lib/before-the-bulb/content.mjs';

/* Same modes, titles, descriptions, labels, and pool copy as the standalone
 * game. The game keeps no saved progress (the standalone did not either):
 * reloading starts a fresh score, by design. */
const MODES = {
  curated: {
    pairs,
    title: 'Curated mode',
    description: 'Hand-picked matchups with a bright little fact.',
    roundLabel: 'Discovery',
    poolLabel: `${objects.length} inventions · ${pairs.length} curated discoveries`,
  },
  wild: {
    pairs: wildPairs,
    title: 'Wild mode',
    description: 'Every clear date pairing. Expect oddball surprises!',
    roundLabel: 'Wild card',
    poolLabel: `${objects.length} inventions · ${wildPairs.length} wild possibilities`,
  },
};

function sourceLinks(ids) {
  return ids.map((id) => {
    const source = sourceMap.get(id);
    return (
      <p key={id}>
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          {`${source.publisher} · ${source.title} ↗`}
        </a>
      </p>
    );
  });
}

export default function Game() {
  const [game, setGame] = useState(() => createGame(MODES.curated.pairs));
  const [mode, setMode] = useState('curated');
  const [snap, setSnap] = useState(null);
  const [defOpen, setDefOpen] = useState({});
  const startedRef = useRef(false);
  const focusRequest = useRef(null);
  const questionRef = useRef(null);
  const roundRef = useRef(null);
  const nextRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setSnap(game.next());
  }, []);

  useEffect(() => {
    if (!snap) return;
    if (focusRequest.current === 'question') {
      questionRef.current?.focus({ preventScroll: true });
      roundRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else if (focusRequest.current === 'next') {
      nextRef.current?.focus({ preventScroll: true });
      revealRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    focusRequest.current = null;
  }, [snap]);

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    const nextGame = createGame(MODES[nextMode].pairs);
    setGame(nextGame);
    setMode(nextMode);
    setDefOpen({});
    startedRef.current = true;
    focusRequest.current = 'question';
    setSnap(nextGame.next());
  };

  const handleAnswer = (id) => {
    const result = game.answer(id);
    if (!result) return;
    setDefOpen({});
    focusRequest.current = 'next';
    setSnap(result);
  };

  const handleNext = () => {
    focusRequest.current = 'question';
    setDefOpen({});
    setSnap(game.next());
  };

  const handleRestart = () => {
    focusRequest.current = 'question';
    setDefOpen({});
    setSnap(game.reset());
  };

  const activeMode = MODES[mode];
  const answered = snap !== null && snap.selected !== null;
  const pair = snap?.pair ?? null;
  const earlier = pair ? objectMap.get(pair.earlierObjectId) : null;
  const later =
    pair && snap
      ? objectMap.get(snap.choices.find((id) => id !== earlier.id))
      : null;
  const isCorrect = answered && snap.selected === earlier.id;
  const roundText = snap
    ? `${activeMode.roundLabel} ${snap.answered + 1}`
    : 'Warming up…';
  const instruction = snap
    ? snap.cycle > 1 && snap.position === 1
      ? `You explored every ${
          mode === 'curated' ? 'curated discovery' : 'wild possibility'
        }! Let’s try a fresh shuffle.`
      : 'Two bright ideas. Tap the one that came earlier.'
    : 'Two bright ideas. Tap the one that came earlier.';
  const announcement = answered
    ? `${isCorrect ? 'Correct!' : 'Good guess!'} ${earlier.name} came first. ${
        earlier.dateDisplay
      }; ${later.name}, ${later.dateDisplay}. ${pair.funFact}`
    : '';

  return (
    <div className="before-the-bulb">
      <main className="shell">
        <header className="masthead">
          <PortalNav />
          <div className="game-brand-row">
            <p className="app-eyebrow">Before the Bulb</p>
            {snap && (
              <button
                className="quiet"
                id="restart"
                type="button"
                onClick={handleRestart}
              >
                Start over <span aria-hidden="true">↺</span>
              </button>
            )}
          </div>
        </header>
        <section className="game" aria-labelledby="question">
          <div className="round-bar">
            <span className="round-pill" id="round" ref={roundRef}>
              {roundText}
            </span>
            <span
              id="score"
              className="score"
              aria-label={
                snap
                  ? `${snap.correct} correct out of ${snap.answered} answered`
                  : undefined
              }
            >
              {snap ? snap.correct : 0}{' '}
              <span>/ {snap ? snap.answered : 0} correct</span>
            </span>
          </div>
          <div className="intro">
            <p className="eyebrow">A LITTLE TRIP THROUGH TIME</p>
            <h1 id="question" tabIndex={-1} ref={questionRef}>
              Which came first?
            </h1>
            <p id="instruction">{instruction}</p>
          </div>
          <section className="mode-picker" aria-label="Choose game mode">
            <div className="mode-options" role="group" aria-label="Game modes">
              <button
                className="mode-option"
                data-mode="curated"
                type="button"
                aria-pressed={mode === 'curated'}
                onClick={() => switchMode('curated')}
              >
                <span aria-hidden="true">✦</span> Curated
              </button>
              <button
                className="mode-option"
                data-mode="wild"
                type="button"
                aria-pressed={mode === 'wild'}
                onClick={() => switchMode('wild')}
              >
                <span aria-hidden="true">⚡</span> Wild
              </button>
            </div>
            <p className="mode-note">
              <strong id="mode-title">{activeMode.title}</strong>
              <span id="mode-description">{activeMode.description}</span>
            </p>
          </section>
          <div
            className="choices"
            id="choices"
            aria-label="Choose the earlier invention"
          >
            {snap &&
              snap.choices.map((id, index) => {
                const object = objectMap.get(id);
                const isEarlier = answered && id === earlier.id;
                const isChosen = answered && id === snap.selected;
                const status = !answered
                  ? 'Tap to choose'
                  : isEarlier
                    ? isChosen
                      ? '✓ You got it! Came first'
                      : '✓ This one came first'
                    : isChosen
                      ? 'Your guess · came later'
                      : 'Came later';
                return (
                  <article
                    key={id}
                    className={`choice-card${
                      isEarlier ? ' is-earlier' : ''
                    }${isChosen ? ' is-chosen' : ''}`}
                  >
                    <button
                      className="pick"
                      type="button"
                      disabled={answered}
                      aria-label={`Choose ${object.name}`}
                      onClick={() => handleAnswer(id)}
                    >
                      <span className="choice-letter" aria-hidden="true">
                        {index === 0 ? 'A' : 'B'}
                      </span>
                      <span className="object-art" aria-hidden="true">
                        {object.icon}
                      </span>
                      <strong className="object-name">{object.name}</strong>
                      <span className="choice-status">{status}</span>
                    </button>
                    <button
                      className="definition-toggle"
                      type="button"
                      aria-label={`What's this: ${object.name}?`}
                      aria-expanded={!!defOpen[id]}
                      aria-controls={`definition-${id}`}
                      onClick={() =>
                        setDefOpen((open) => ({ ...open, [id]: !open[id] }))
                      }
                    >
                      {defOpen[id]
                        ? 'Got it! Close definition'
                        : 'What’s this?'}
                    </button>
                    {defOpen[id] && (
                      <p className="definition" id={`definition-${id}`}>
                        {object.kidDefinition}
                      </p>
                    )}
                  </article>
                );
              })}
          </div>
          {answered && (
            <section
              className="reveal"
              aria-labelledby="result-title"
              ref={revealRef}
            >
              <div className="result-top">
                <div>
                  <p className="eyebrow" id="feedback">
                    {isCorrect
                      ? 'YOU’VE GOT A BRIGHT MIND!'
                      : 'A LITTLE SURPRISE!'}
                  </p>
                  <h2 id="result-title">{`${earlier.name} came first!`}</h2>
                </div>
                <span className="result-spark" aria-hidden="true">
                  ✦
                </span>
              </div>
              <div className="dates" id="dates">
                {snap.choices.map((id) => {
                  const object = objectMap.get(id);
                  const isEarlier = object.id === earlier.id;
                  return (
                    <div
                      key={id}
                      className={`date ${
                        isEarlier ? 'is-earlier' : 'is-later'
                      }`}
                    >
                      <span className="label">
                        {isEarlier ? 'Came first' : 'Came later'}
                      </span>
                      <strong>{object.dateDisplay}</strong>
                      <h3>{object.name}</h3>
                      <p>{object.dateBasis}</p>
                    </div>
                  );
                })}
              </div>
              <div className="fact">
                <span aria-hidden="true">💡</span>
                <div>
                  <h3 id="fact-heading">
                    {pair.funFact
                      ? 'A bright little fact'
                      : 'A wild little thought'}
                  </h3>
                  <p id="fact">
                    {pair.funFact ||
                      'A wild time-travel matchup! Check the dates to see how far apart these ideas are.'}
                  </p>
                </div>
              </div>
              <div className="reveal-bottom">
                <details id="source-details">
                  <summary>Dates & sources</summary>
                  <p className="source-note">
                    Inventions take shape over time. These dates mark the
                    specific milestones shown above.
                  </p>
                  <div id="sources">
                    {[earlier, later].map((object) => (
                      <div className="source-item" key={object.id}>
                        <strong>{`${object.name}: ${object.dateDisplay}`}</strong>
                        <p>{object.ambiguityNotes}</p>
                        {sourceLinks(object.dateSourceIds)}
                      </div>
                    ))}
                    {pair.factSourceIds?.length ? (
                      <div className="source-item">
                        <strong>Fun fact source</strong>
                        {sourceLinks(pair.factSourceIds)}
                      </div>
                    ) : null}
                  </div>
                </details>
                <button
                  className="next"
                  id="next"
                  type="button"
                  ref={nextRef}
                  onClick={handleNext}
                >
                  Next discovery <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          )}
          <p
            className="sr-only"
            id="announcement"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcement}
          </p>
          {!answered && (
            <p className="reassurance" id="reassurance">
              No timer. Just a little curiosity.
            </p>
          )}
        </section>
        <footer>
          <span>
            Made for curious minds <span aria-hidden="true">✦</span>
          </span>
          <span id="pool">{snap ? activeMode.poolLabel : ''}</span>
        </footer>
        <noscript>
          <p>
            This game needs JavaScript enabled to show its invention cards.
          </p>
        </noscript>
      </main>
    </div>
  );
}
