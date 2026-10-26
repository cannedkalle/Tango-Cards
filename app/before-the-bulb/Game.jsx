'use client';

import { useEffect, useRef, useState } from 'react';
import PortalNav from '../components/PortalNav';
import { createGame } from '../../lib/before-the-bulb/game.mjs';
import { PLAY_MODES, isGameOver, nextLives } from '../../lib/quiz-play.mjs';
import { ArrowRightIcon, LivesHearts, RestartIcon } from "../components/Icons";
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
    description: 'Fun date pairings, from close cousins to wild contrasts.',
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
  const [playMode, setPlayMode] = useState('endless');
  const [lives, setLives] = useState(3);
  const [over, setOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [snap, setSnap] = useState(null);
  const [defOpen, setDefOpen] = useState({});
  const startedRef = useRef(false);
  /* Session no-repeat window, shared by both pools: the last 12 dealt
   * pair ids, kept for the whole page session across mode switches,
   * play-mode switches, and restarts (a reload starts fresh, like the
   * score). Deals avoid it; the game itself holds no deck. */
  const recentRef = useRef([]);
  const track = (snap) => {
    if (snap.pair && recentRef.current[recentRef.current.length - 1] !== snap.pair.id) {
      recentRef.current = [...recentRef.current, snap.pair.id].slice(-12);
    }
    return snap;
  };
  const dealNext = (gameObj) => track(gameObj.next(recentRef.current));
  const focusRequest = useRef(null);
  const questionRef = useRef(null);
  const roundRef = useRef(null);
  const nextRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setSnap(dealNext(game));
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
    setLives(3);
    setOver(false);
    setShowResults(false);
    startedRef.current = true;
    focusRequest.current = 'question';
    setSnap(dealNext(nextGame));
  };

  /* Switching play mode starts a fresh game in the same pool, so one
   * mode's results never mix with another's. */
  const switchPlayMode = (nextPlayMode) => {
    if (nextPlayMode === playMode) return;
    const nextGame = createGame(MODES[mode].pairs);
    setGame(nextGame);
    setPlayMode(nextPlayMode);
    setDefOpen({});
    setLives(3);
    setOver(false);
    setShowResults(false);
    startedRef.current = true;
    focusRequest.current = 'question';
    setSnap(dealNext(nextGame));
  };

  const handleAnswer = (id) => {
    const result = game.answer(id);
    if (!result) return;
    setDefOpen({});
    focusRequest.current = 'next';
    setSnap(result);
    const wasCorrect = result.selected === result.pair.earlierObjectId;
    const nextLivesCount = nextLives(playMode, lives, wasCorrect);
    setLives(nextLivesCount);
    setOver(isGameOver(playMode, result.answered, nextLivesCount));
  };

  const handleNext = () => {
    if (over) {
      setShowResults(true);
      return;
    }
    focusRequest.current = 'question';
    setDefOpen({});
    setSnap(dealNext(game));
  };

  const handleRestart = () => {
    focusRequest.current = 'question';
    setDefOpen({});
    setLives(3);
    setOver(false);
    setShowResults(false);
    setSnap(track(game.reset(recentRef.current)));
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
  const roundText = !snap
    ? 'Warming up…'
    : over && showResults
      ? 'Results'
      : playMode === 'ten'
        ? `${activeMode.roundLabel} ${Math.min(snap.answered + 1, 10)} of 10`
        : `${activeMode.roundLabel} ${snap.answered + 1}`;
  const instruction = over && showResults
    ? 'Game over — here is how you did.'
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
                className="pf-btn"
                id="restart"
                type="button"
                onClick={handleRestart}
              >
                <RestartIcon />Start over
              </button>
            )}
          </div>
        </header>
        <section className="game" aria-labelledby="question">
          <div className="round-bar">
            <span className="pf-status-pill" id="round" ref={roundRef}>
              {roundText}
            </span>
            {playMode === 'lives' && (
              <span className="pf-status-pill" aria-label={`${lives} lives left`}>
                <LivesHearts lives={lives} />
              </span>
            )}
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
            <span className="mode-group-label">Pool</span>
            <div className="pf-pill-group" role="group" aria-label="Game modes">
              <button
                className="pf-pill"
                data-mode="curated"
                type="button"
                aria-pressed={mode === 'curated'}
                onClick={() => switchMode('curated')}
              >
                Curated
              </button>
              <button
                className="pf-pill"
                data-mode="wild"
                type="button"
                aria-pressed={mode === 'wild'}
                onClick={() => switchMode('wild')}
              >
                Wild
              </button>
            </div>
            <span className="mode-group-label">Play</span>
            <div className="pf-pill-group" role="group" aria-label="Play mode">
              {PLAY_MODES.map((play) => (
                <button
                  className="pf-pill"
                  key={play.id}
                  type="button"
                  aria-pressed={playMode === play.id}
                  onClick={() => switchPlayMode(play.id)}
                >
                  {play.label}
                </button>
              ))}
            </div>
            <p className="mode-note">
              <strong id="mode-title">{activeMode.title}</strong>
              <span id="mode-description">{activeMode.description}</span>
            </p>
          </section>
          {over && showResults ? (
            <section className="reveal" aria-labelledby="results-title">
              <div className="result-top">
                <div>
                  <p className="eyebrow">
                    {playMode === 'ten' ? '10 QUESTIONS DONE!' : 'OUT OF LIVES!'}
                  </p>
                  <h2 id="results-title">Here is how you did.</h2>
                </div>
                <span className="result-spark" aria-hidden="true">
                  ✦
                </span>
              </div>
              <p className="score">
                {snap.correct} / {snap.answered} correct
              </p>
              <div className="reveal-bottom">
                <p className="mode-note">
                  {playMode === 'ten'
                    ? 'Ten discoveries, one score.'
                    : `You got ${snap.correct} right in ${snap.answered} discoveries.`}
                </p>
                <button
                  className="pf-primary"
                  type="button"
                  onClick={handleRestart}
                >
                  Play again <ArrowRightIcon />
                </button>
              </div>
            </section>
          ) : (
            <>
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
                  className="pf-primary"
                  id="next"
                  type="button"
                  ref={nextRef}
                  onClick={handleNext}
                >
                  {over ? <>See results <ArrowRightIcon /></> : <>Next discovery <ArrowRightIcon /></>}
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
            </>
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
