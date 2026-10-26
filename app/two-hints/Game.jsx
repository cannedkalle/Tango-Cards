'use client';

import { useEffect, useRef, useState } from 'react';
import PortalNav from '../components/PortalNav';
import { ArrowRightIcon, LivesHearts, RestartIcon } from "../components/Icons";
import { PLAY_MODES, isGameOver, nextLives } from '../../lib/quiz-play.mjs';
import { dealOptions, dealPair } from '../../lib/two-hints/questions.mjs';
import { clearProgress, loadProgress, saveProgress } from '../../lib/two-hints/progress.mjs';

/* Two Hints, played entirely in the browser: two words from one field's
 * own vocabulary, four possible fields to choose from, and the reveal
 * says why the pair belongs where it does. The pool lives in the repo,
 * progress lives in the player's own browser storage, no server involved.
 *
 * Quiz standard: Start over sits in the header, the Play mode row sits
 * above the puzzle, and the score strip shows lives (survival) or the
 * puzzle count (10 questions). Endless is the default and never ends.
 * The pool has no difficulty — the source pairs are ungraded — so this
 * game offers play modes only. */
export default function Game() {
  const [pair, setPair] = useState(null);
  const [options, setOptions] = useState([]);
  const [picked, setPicked] = useState(null);
  const [queued, setQueued] = useState(null);
  const [played, setPlayed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [playMode, setPlayMode] = useState('endless');
  const [lives, setLives] = useState(3);
  const [over, setOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const heading = useRef(null);
  const historyRef = useRef([]);
  /* Deal through the generator, avoiding the last 12 pairs so the same
   * puzzle does not come straight back. The history lives for the whole
   * page session: Play again and mode switches never clear it, so a fresh
   * game never re-deals a recent puzzle. Every deal stays an independent
   * random draw — there is no deck, no fixed order, no sequence to learn. */
  const deal = () => {
    const nextPair = dealPair(historyRef.current);
    historyRef.current = [...historyRef.current, nextPair.id].slice(-12);
    return { pair: nextPair, options: dealOptions(nextPair) };
  };

  const startFresh = (mode = playMode) => {
    const fresh = deal();
    clearProgress();
    setPair(fresh.pair);
    setOptions(fresh.options);
    setPicked(null);
    setQueued(null);
    setPlayed(0);
    setCorrect(0);
    setLives(3);
    setOver(false);
    setShowResults(false);
    saveProgress({ pairId: fresh.pair.id, options: fresh.options, playMode: mode, played: 0, correct: 0, lives: 3, history: historyRef.current });
  };

  /* Switching play mode resets the score, so one mode's results never mix
   * with another's. */
  const switchPlayMode = (nextMode) => {
    if (nextMode === playMode) return;
    setPlayMode(nextMode);
    startFresh(nextMode);
  };

  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      historyRef.current = saved.history;
      setPair(saved.pair);
      setOptions(saved.options);
      setPlayMode(saved.playMode);
      setPlayed(saved.played);
      setCorrect(saved.correct);
      setLives(saved.lives);
    } else {
      startFresh();
    }
  }, []);
  useEffect(() => { heading.current?.focus(); }, [pair, picked, showResults]);

  const choose = (option) => {
    if (!pair || picked) return;
    const isRight = option === pair.answer;
    const nextPlayed = played + 1;
    const nextCorrect = correct + (isRight ? 1 : 0);
    const nextLivesCount = nextLives(playMode, lives, isRight);
    const gameOver = isGameOver(playMode, nextPlayed, nextLivesCount);
    setPicked(option);
    setPlayed(nextPlayed);
    setCorrect(nextCorrect);
    setLives(nextLivesCount);
    setOver(gameOver);
    if (gameOver) {
      /* Results are ephemeral: a reload after the game ends starts fresh
       * rather than restoring a finished game. */
      setQueued(null);
      clearProgress();
      return;
    }
    /* Deal the next puzzle now, so reloading mid-reveal lands on it. */
    const upNext = deal();
    setQueued(upNext);
    saveProgress({ pairId: upNext.pair.id, options: upNext.options, playMode, played: nextPlayed, correct: nextCorrect, lives: nextLivesCount, history: historyRef.current });
  };

  const next = () => {
    if (queued) {
      setPair(queued.pair);
      setOptions(queued.options);
      setPicked(null);
      setQueued(null);
      return;
    }
    const fresh = deal();
    setPair(fresh.pair);
    setOptions(fresh.options);
    setPicked(null);
    saveProgress({ pairId: fresh.pair.id, options: fresh.options, playMode, played, correct, lives, history: historyRef.current });
  };

  const isRight = picked !== null && picked === pair?.answer;

  return <><PortalNav/><main className="two-hints"><header className="th-heading"><div><span className="th-kicker">Two words. One answer.</span><h1 className="pf-game-title">Two Hints</h1></div><div className="th-heading-actions"><button className="pf-btn" type="button" onClick={() => startFresh()}><RestartIcon />Start over</button></div></header><div className="th-layout"><section className="th-board">
    {!pair ? <div className="th-loading">Finding a curious pair…</div> : <>
      <div className="th-score" aria-label="Your score"><div><strong>{correct}</strong><span>right</span></div><div><strong>{played}</strong><span>played</span></div>{playMode === 'lives' && <div><strong><LivesHearts lives={lives} /></strong><span>lives</span></div>}</div>
      <div className="pf-pill-group" role="group" aria-label="Play mode">
        {PLAY_MODES.map((mode) => <button key={mode.id} className="pf-pill" type="button" aria-pressed={playMode === mode.id} onClick={() => switchPlayMode(mode.id)}>{mode.label}</button>)}
      </div>
      {over && showResults ? <div className="th-finish" role="status">
        <p className="th-result-kicker">{playMode === 'ten' ? '10 puzzles done!' : 'Out of lives!'}</p>
        <h2 ref={heading} tabIndex={-1}>Here is how you did.</h2>
        <p className="th-final-score">{correct}<span> / {played} right</span></p>
        <button className="pf-primary" onClick={() => startFresh()}>Play again <ArrowRightIcon /></button>
      </div> : <>
        <p className="th-question-number">Puzzle {played + 1}{playMode === 'ten' ? ' of 10' : ''}</p>
        <div className="th-hints" ref={picked ? null : heading} tabIndex={-1} aria-label={`Hints: ${pair.hints[0]} and ${pair.hints[1]}`}>
          <span className="th-hint th-hint-a">{pair.hints[0]}</span>
          <span className="th-plus" aria-hidden="true">+</span>
          <span className="th-hint th-hint-b">{pair.hints[1]}</span>
          <span className="th-mark" aria-hidden="true">?</span>
        </div>
        <p className="th-prompt">Which field do these words both belong to?</p>
        <div className="th-options">
          {options.map((option) => {
            const className = picked
              ? option === pair.answer
                ? 'is-correct'
                : option === picked
                  ? 'is-wrong'
                  : ''
              : '';
            return <button key={option} type="button" className={className} disabled={picked !== null} onClick={() => choose(option)}>{option}</button>;
          })}
        </div>
        {picked && <div className={`th-reveal ${isRight ? 'is-correct' : 'is-wrong'}`} role="status">
          <p className="th-result-kicker">{isRight ? 'You got it!' : 'Good try!'}</p>
          <h2 ref={heading} tabIndex={-1}>The answer is {pair.answer}.</h2>
          <p className="th-why">{pair.why}</p>
          <button className="pf-primary" onClick={over ? () => setShowResults(true) : next}>{over ? <>See results <ArrowRightIcon /></> : <>Next puzzle <ArrowRightIcon /></>}</button>
        </div>}
      </>}
    </>}
  </section></div></main></>;
}
