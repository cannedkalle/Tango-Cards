'use client';

import { useEffect, useRef, useState } from 'react';
import PortalNav from '../components/PortalNav';
import { ArrowRightIcon, LivesHearts, RestartIcon } from "../components/Icons";
import { PLAY_MODES, isGameOver, nextLives } from '../../lib/quiz-play.mjs';
import { dealOptions, dealPair } from '../../lib/twin-terms/questions.mjs';
import { CATEGORIES, categoryById } from '../../lib/twin-terms/categories.mjs';
import { clearProgress, loadProgress, saveProgress } from '../../lib/twin-terms/progress.mjs';

/* Twin Terms, played entirely in the browser: two words from one field's
 * own vocabulary, and six general categories to choose from. The graded
 * answer is the category — a small fixed set, so verification is exact:
 * figure out what the words are about, then place them. The specific
 * term (Baseball, Chess tactics) is the payoff in the reveal, and the
 * give-up swaps the general choices for the specific answers, so giving
 * up still teaches the specific term. The pool lives in the repo,
 * progress lives in the player's own browser storage, no server involved.
 *
 * Quiz standard: Start over sits in the header, the Play mode row sits
 * above the puzzle, and the score strip shows lives (survival) or the
 * puzzle count (10 questions). Endless is the default and never ends.
 * The pool has no difficulty — the source pairs are ungraded — so this
 * game offers play modes only. In lives mode, a failed round (a wrong
 * category, or a give-up) costs a life. */
export default function Game() {
  const [pair, setPair] = useState(null);
  const [pickedCategory, setPickedCategory] = useState(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [options, setOptions] = useState(null);
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
  const deal = () => dealPair(historyRef.current);

  const resetRound = (nextPair) => {
    historyRef.current = [...historyRef.current, nextPair.id].slice(-12);
    setPair(nextPair);
    setPickedCategory(null);
    setGaveUp(false);
    setOptions(null);
    setPicked(null);
    setQueued(null);
  };

  const saveSearching = (nextPair, mode, nextPlayed, nextCorrect, nextLivesCount) => {
    saveProgress({ pairId: nextPair.id, playMode: mode, played: nextPlayed, correct: nextCorrect, lives: nextLivesCount, history: historyRef.current });
  };

  const startFresh = (mode = playMode) => {
    const fresh = deal();
    clearProgress();
    resetRound(fresh);
    setPlayed(0);
    setCorrect(0);
    setLives(3);
    setOver(false);
    setShowResults(false);
    saveSearching(fresh, mode, 0, 0, 3);
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
      setGaveUp(saved.gaveUp);
      setPicked(saved.picked);
      setPlayMode(saved.playMode);
      setPlayed(saved.played);
      setCorrect(saved.correct);
      setLives(saved.lives);
    } else {
      startFresh();
    }
  }, []);
  useEffect(() => { heading.current?.focus(); }, [pair, pickedCategory, picked, showResults]);

  const chooseCategory = (categoryId) => {
    if (!pair || pickedCategory || gaveUp) return;
    const isRight = categoryId === pair.category;
    const nextPlayed = played + 1;
    const nextCorrect = correct + (isRight ? 1 : 0);
    const nextLivesCount = nextLives(playMode, lives, isRight);
    const gameOver = isGameOver(playMode, nextPlayed, nextLivesCount);
    setPickedCategory(categoryId);
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
    historyRef.current = [...historyRef.current, upNext.id].slice(-12);
    setQueued(upNext);
    saveProgress({ pairId: upNext.id, playMode, played: nextPlayed, correct: nextCorrect, lives: nextLivesCount, history: historyRef.current });
  };

  const giveUp = () => {
    if (!pair || pickedCategory || gaveUp) return;
    const revealed = dealOptions(pair);
    const nextPlayed = played + 1;
    const nextLivesCount = nextLives(playMode, lives, false);
    const gameOver = isGameOver(playMode, nextPlayed, nextLivesCount);
    setOptions(revealed);
    setGaveUp(true);
    setPlayed(nextPlayed);
    setLives(nextLivesCount);
    setOver(gameOver);
    saveProgress({ pairId: pair.id, options: revealed, gaveUp: true, picked: null, playMode, played: nextPlayed, correct, lives: nextLivesCount, history: historyRef.current });
  };

  const pick = (option) => {
    if (!gaveUp || picked !== null) return;
    setPicked(option);
    saveProgress({ pairId: pair.id, options, gaveUp: true, picked: option, playMode, played, correct, lives, history: historyRef.current });
  };

  const seeResults = () => {
    clearProgress();
    setShowResults(true);
  };

  const next = () => {
    if (queued) {
      setPair(queued);
      setPickedCategory(null);
      setGaveUp(false);
      setOptions(null);
      setPicked(null);
      setQueued(null);
      return;
    }
    const fresh = deal();
    resetRound(fresh);
    saveSearching(fresh, playMode, played, correct, lives);
  };

  const categoryName = pair ? (categoryById(pair.category) || {}).name : '';
  const categoryRight = pickedCategory !== null && pickedCategory === pair?.category;
  const revealed = pickedCategory !== null || picked !== null;

  return <><PortalNav/><main className="twin-terms"><header className="th-heading"><div><span className="th-kicker">Two words. One shared field.</span><h1 className="pf-game-title">Twin Terms</h1></div><div className="th-heading-actions"><button className="pf-btn" type="button" onClick={() => startFresh()}><RestartIcon />Start over</button></div></header><div className="th-layout"><section className="th-board">
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
        <div className="th-hints" ref={revealed ? null : heading} tabIndex={-1} aria-label={`Hints: ${pair.hints[0]} and ${pair.hints[1]}`}>
          <span className="th-hint th-hint-a">{pair.hints[0]}</span>
          <span className="th-plus" aria-hidden="true">+</span>
          <span className="th-hint th-hint-b">{pair.hints[1]}</span>
          <span className="th-mark" aria-hidden="true">?</span>
        </div>
        {!gaveUp && <>
          <p className="th-prompt">Both words come from the same field. Pick its category.</p>
          <div className="th-categories">
            {CATEGORIES.map((category) => {
              const className = pickedCategory
                ? category.id === pair.category
                  ? 'is-correct'
                  : category.id === pickedCategory
                    ? 'is-wrong'
                    : ''
                : '';
              return <button key={category.id} type="button" className={className} disabled={pickedCategory !== null} onClick={() => chooseCategory(category.id)}>{category.name}</button>;
            })}
          </div>
          <p className="th-legend">{CATEGORIES.map((category) => `${category.name} (${category.blurb})`).join(' · ')}</p>
          {pickedCategory === null && <button className="pf-btn th-give-up" type="button" onClick={giveUp}>Give up — specific choices</button>}
        </>}
        {gaveUp && <>
          <p className="th-prompt">The specific answers — pick one to see the reveal.</p>
          <div className="th-options">
            {options.map((option) => {
              const className = picked
                ? option === pair.answer
                  ? 'is-correct'
                  : option === picked
                    ? 'is-wrong'
                    : ''
                : '';
              return <button key={option} type="button" className={className} disabled={picked !== null} onClick={() => pick(option)}>{option}</button>;
            })}
          </div>
        </>}
        {revealed && <div className={`th-reveal ${categoryRight ? 'is-correct' : ''}`} role="status">
          <p className="th-result-kicker">{pickedCategory !== null ? (categoryRight ? 'You got it!' : 'Good try!') : 'Here is the answer.'}</p>
          <h2 ref={heading} tabIndex={-1}>These words belong to {categoryName}.</h2>
          <p className="th-specific">The specific answer is {pair.answer}.</p>
          <p className="th-why">{pair.why}</p>
          <button className="pf-primary" onClick={over ? seeResults : next}>{over ? <>See results <ArrowRightIcon /></> : <>Next puzzle <ArrowRightIcon /></>}</button>
        </div>}
      </>}
    </>}
  </section></div></main></>;
}
