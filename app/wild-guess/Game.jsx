'use client';

import { useEffect, useRef, useState } from 'react';
import PortalNav from '../components/PortalNav';
import { buildReveal, clearProgress, generateComparison, loadProgress, saveProgress } from '../../lib/wild-guess/client-game.mjs';

/* Balls in the Ballpark, played entirely in the browser: matchups are dealt
 * from the catalog that lives in the repo, and progress is kept in the
 * player's own browser storage. No server database is involved, so the game
 * works on the live site — and offline once installed — like the portal's
 * other games. */
export default function Game() {
  const [comparison, setComparison] = useState(null);
  const [position, setPosition] = useState(0);
  const [played, setPlayed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [reveal, setReveal] = useState(null);
  const [queued, setQueued] = useState(null);
  const [error, setError] = useState('');
  const heading = useRef(null);
  const historyRef = useRef([]);
  /* Deal through the generator, avoiding the last 12 matchups so the same
   * pairing does not come straight back. */
  const deal = () => {
    const next = generateComparison(undefined, { pairIds: historyRef.current });
    if (next) {
      historyRef.current = [...historyRef.current, next.id].slice(-12);
    }
    return next;
  };

  const startFresh = () => {
    historyRef.current = [];
    const next = deal();
    if (!next) {
      setError('No matchups are available yet.');
      return;
    }
    clearProgress();
    setComparison(next);
    setPosition(0);
    setPlayed(0);
    setCorrect(0);
    setReveal(null);
    setQueued(null);
    setError('');
    saveProgress({ leftId: next.left.id, rightId: next.right.id, category: next.category, position: 0, played: 0, correct: 0 });
  };

  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setComparison(saved.comparison);
      setPosition(saved.position);
      setPlayed(saved.played);
      setCorrect(saved.correct);
    } else {
      startFresh();
    }
  }, []);
  useEffect(() => { if (comparison) heading.current?.focus(); }, [comparison, reveal]);

  const choose = (choice) => {
    if (!comparison || reveal) return;
    const nextReveal = buildReveal(comparison, choice);
    const nextPlayed = played + 1;
    const nextCorrect = correct + (nextReveal.correct ? 1 : 0);
    setReveal(nextReveal);
    setPlayed(nextPlayed);
    setCorrect(nextCorrect);
    /* Deal the next round now, so reloading mid-reveal lands on it — the
     * same resume behavior the server game had. */
    const upNext = deal();
    setQueued(upNext);
    if (upNext) {
      saveProgress({ leftId: upNext.left.id, rightId: upNext.right.id, category: upNext.category, position: position + 1, played: nextPlayed, correct: nextCorrect });
    } else {
      saveProgress({ leftId: comparison.left.id, rightId: comparison.right.id, category: comparison.category, position, played: nextPlayed, correct: nextCorrect });
    }
  };

  const next = () => {
    if (queued) {
      setComparison(queued);
      setPosition(position + 1);
      setReveal(null);
      setQueued(null);
      setError('');
      return;
    }
    const nextComparison = deal();
    if (!nextComparison) {
      setError('No matchups are available yet.');
      return;
    }
    const nextPosition = position + 1;
    setReveal(null);
    setComparison(nextComparison);
    setPosition(nextPosition);
    setQueued(null);
    setError('');
    saveProgress({ leftId: nextComparison.left.id, rightId: nextComparison.right.id, category: nextComparison.category, position: nextPosition, played, correct });
  };

  const winnerCopy = reveal ? reveal.prompt.includes('shorter gap')
    ? `${reveal.sides[reveal.correctChoice].label} happens more often.`
    : reveal.prompt.includes('takes longer')
      ? `${reveal.sides[reveal.correctChoice].label} takes longer.`
      : reveal.prompt.includes('weighs')
        ? `${reveal.sides[reveal.correctChoice].label} weighs more.`
        : reveal.prompt.includes('covers more')
          ? `${reveal.sides[reveal.correctChoice].label} covers more area.`
        : reveal.prompt.includes('takes up more')
          ? `${reveal.sides[reveal.correctChoice].label} takes up more space.`
          : reveal.prompt.includes('moves or grows faster')
            ? `${reveal.sides[reveal.correctChoice].label} is faster.`
        : reveal.prompt.includes('is longer')
          ? `${reveal.sides[reveal.correctChoice].label} is longer.`
          : `${reveal.sides[reveal.correctChoice].label} has more.`
    : '';

  return <><PortalNav/><main className="wg"><header className="wg-heading"><div><span className="wg-kicker">Two wild possibilities. One bigger answer.</span><h1>Balls in the Ballpark<span aria-hidden="true">?</span></h1></div><p>Which one<br/>is bigger?</p></header><div className="wg-layout"><section className="wg-board">
    {error && <div className="wg-error" role="alert">{error} <button onClick={startFresh}>Start over</button></div>}
    {!comparison ? <div className="wg-loading">Finding a curious matchup…</div> : <>
      <div className="wg-score" aria-label="Your score"><div><strong>{correct}</strong><span>right</span></div><div><strong>{played}</strong><span>played</span></div></div>
      {reveal ? <div className="wg-comparison-reveal" role="status">
        <p className="wg-result-kicker">{reveal.correct ? 'You called it!' : 'Plot twist!'}</p>
        <h2 ref={heading} tabIndex={-1}>{winnerCopy}</h2>
        <div className="wg-reveal-sides">{reveal.sides.map((option, index) => <article className={index === reveal.correctChoice ? 'is-winner' : ''} key={option.label}><span className="wg-option-emoji" aria-hidden="true">{option.emoji}</span><h3>{option.label}</h3><p className="wg-scale-answer">{option.scaleLead} <strong>{option.scale}</strong></p><p>{option.detail}</p>{index === reveal.correctChoice && <span className="wg-winner-mark">{reveal.prompt.includes('shorter gap') ? 'Shorter gap ✓' : reveal.prompt.includes('moves or grows faster') ? 'Faster ✓' : reveal.prompt.includes('longer') ? 'Longer ✓' : reveal.prompt.includes('weighs') ? 'Heavier ✓' : reveal.prompt.includes('area') ? 'More area ✓' : reveal.prompt.includes('space') ? 'More space ✓' : 'More ✓'}</span>}</article>)}</div>
        <button className="pf-primary" onClick={next}>Next matchup →</button>
      </div> : <>
        <p className="wg-question-number">Matchup {played + 1}</p>
        <h2 className="wg-question" ref={heading} tabIndex={-1}>{comparison.prompt}</h2>
        <div className="wg-choice-grid">{[comparison.left, comparison.right].map((option, index) => <button key={option.label} onClick={() => choose(index)}><span className="wg-option-emoji" aria-hidden="true">{option.emoji}</span><strong>{option.label}</strong><span className="wg-pick-label">Pick this one</span></button>)}</div>
      </>}
    </>}
  </section></div></main></>;
}
