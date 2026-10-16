'use client';

import { useEffect, useRef, useState } from 'react';

export default function Game() {
  const [game, setGame] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const heading = useRef(null);
  const busy = useRef(false);

  async function request(body) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/wild-guess', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGame(data.game);
      if (data.reveal) setReveal(data.reveal);
    } catch (requestError) {
      setError(requestError.message || 'Could not connect. Try again.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  useEffect(() => { request({ action: 'start' }); }, []);
  useEffect(() => { if (game) heading.current?.focus(); }, [game, reveal]);

  const choose = (choice) => request({ action: 'choose', position: game.current.position, choice });
  const stats = game?.stats || { correct: 0, played: 0 };
  const comparison = game?.current.comparison;
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

  return <div className="wg-layout"><section className="wg-board" aria-busy={loading}>
    {error && <div className="wg-error" role="alert">{error} <button onClick={() => request({ action: 'start' })}>Reconnect</button></div>}
    {!game ? <div className="wg-loading">Finding a curious matchup…</div> : <>
      <div className="wg-score" aria-label="Your score"><div><strong>{stats.correct}</strong><span>right</span></div><div><strong>{stats.played}</strong><span>played</span></div></div>
      {reveal ? <div className="wg-comparison-reveal" role="status">
        <p className="wg-result-kicker">{reveal.correct ? 'You called it!' : 'Plot twist!'}</p>
        <h2 ref={heading} tabIndex={-1}>{winnerCopy}</h2>
        <div className="wg-reveal-sides">{reveal.sides.map((option, index) => <article className={index === reveal.correctChoice ? 'is-winner' : ''} key={option.label}><span className="wg-option-emoji" aria-hidden="true">{option.emoji}</span><h3>{option.label}</h3><p className="wg-scale-answer">{option.scaleLead} <strong>{option.scale}</strong></p><p>{option.detail}</p>{index === reveal.correctChoice && <span className="wg-winner-mark">{reveal.prompt.includes('shorter gap') ? 'Shorter gap ✓' : reveal.prompt.includes('moves or grows faster') ? 'Faster ✓' : reveal.prompt.includes('longer') ? 'Longer ✓' : reveal.prompt.includes('weighs') ? 'Heavier ✓' : reveal.prompt.includes('area') ? 'More area ✓' : reveal.prompt.includes('space') ? 'More space ✓' : 'More ✓'}</span>}</article>)}</div>
        <button className="pf-primary" onClick={() => setReveal(null)}>Next matchup →</button>
      </div> : <>
        <p className="wg-question-number">Matchup {stats.played + 1}</p>
        <h2 className="wg-question" ref={heading} tabIndex={-1}>{comparison.prompt}</h2>
        <div className="wg-choice-grid">{comparison.sides.map((option, index) => <button key={option.label} disabled={loading} onClick={() => choose(index)}><span className="wg-option-emoji" aria-hidden="true">{option.emoji}</span><strong>{option.label}</strong><span className="wg-pick-label">Pick this one</span></button>)}</div>
      </>}
    </>}
  </section></div>;
}
