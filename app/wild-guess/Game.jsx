'use client';

import { useEffect, useRef, useState } from 'react';

const fmt = (value) => new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value);

export default function Game() {
  const [game, setGame] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [magnitude, setMagnitude] = useState(null);
  const heading = useRef(null);
  const busy = useRef(false);

  async function request(body) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/wild-guess', body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGame(data.game);
      if (data.reveal) setReveal(data.reveal);
      if (!body || body.action === 'start') setMagnitude(null);
    } catch (requestError) {
      setError(requestError.message || 'Could not connect. Try again.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  useEffect(() => { request({ action: 'start' }); }, []);
  useEffect(() => { if (game) heading.current?.focus(); }, [game, reveal]);

  const next = () => { setMagnitude(null); setReveal(null); };
  const tally = game?.stats || { on_target: 0, close: 0, miss: 0 };
  const round = game?.current;
  const revealMagnitude = reveal ? Math.floor(Math.log10(reveal.answer.target)) : 0;

  return <div className="wg-layout"><section className="wg-board" aria-busy={loading}>
    {error && <div className="wg-error" role="alert">{error} <button onClick={() => request({ action: 'start' })}>Reconnect</button></div>}
    {!game ? <div className="wg-loading">Finding your first big question…</div> : <>
      <div className="wg-tally" aria-label="Your results"><div><span>In the ballpark</span><strong>{tally.on_target}</strong></div><div><span>Almost there</span><strong>{tally.close}</strong></div><div><span>A long shot</span><strong>{tally.miss}</strong></div></div>
      {reveal ? <div className="wg-reveal" role="status"><div className={`wg-reveal-hero wg-reveal-${reveal.score}`}><p className="wg-result-kicker">{reveal.score === 100 ? 'In the ballpark!' : reveal.score === 50 ? 'Almost there!' : 'A long shot!'}</p><h2 ref={heading} tabIndex={-1}>The answer is…</h2><div className="wg-answer-card"><span>about</span><strong>{fmt(reveal.answer.target)}</strong><em>{reveal.question.unit}</em></div></div><div className="wg-callout"><div><span>Your call</span><strong>{reveal.question.magnitudes[reveal.magnitude]}</strong></div><div><span>The answer</span><strong>{reveal.question.magnitudes[revealMagnitude]}</strong></div></div><div className="wg-scale" aria-label={`Your call was ${reveal.question.magnitudes[reveal.magnitude]}; the answer is ${reveal.question.magnitudes[revealMagnitude]}`}><div className="wg-scale-track"><i className="wg-scale-player" style={{ left: `${(reveal.magnitude / 9) * 100}%` }} /><i className="wg-scale-answer" style={{ left: `${(revealMagnitude / 9) * 100}%` }} /></div><div><span>ones</span><span>billions</span></div></div><p className="wg-caveat">{reveal.answer.caveat}</p>{reveal.answer.sources.map((source) => <a className="wg-source" key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}<button className="pf-primary" onClick={next}>Next big question →</button></div> : <>
        <h2 className="wg-question" ref={heading} tabIndex={-1}>{round.question.prompt}</h2>
        <form onSubmit={(event) => { event.preventDefault(); if (magnitude !== null) request({ action: 'guess', position: round.position, magnitude }); }}>
          <fieldset className="wg-magnitudes" disabled={loading}>
            <legend className="wg-label">How big is the answer?</legend>
            <p>Pick the scale. No exact number needed.</p>
            <div className="wg-magnitude-grid">{round.question.magnitudes.map((label, index) => <button key={label} type="button" className="wg-magnitude-button" aria-pressed={magnitude === index} onClick={() => setMagnitude(index)}><strong>{label}</strong></button>)}</div>
          </fieldset>
          <div className="wg-actions"><button className="pf-primary" disabled={loading || magnitude === null}>{loading ? 'Saving…' : 'Lock in my scale →'}</button></div>
        </form>
      </>}
    </>}
  </section></div>;
}
