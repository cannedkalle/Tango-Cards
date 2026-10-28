'use client';

import { LivesHearts, RestartIcon } from "./Icons";

/* Shared quiz shell: the chrome every quiz game shares, so titles,
 * subtitles, score strips, settings, and round labels stop drifting apart
 * from game to game. Games keep their own question, choice, and reveal
 * markup — this module owns only the frame around them, in one fixed
 * order: header, score strip, settings, round label, then the game.
 *
 * - QuizHeader: kicker above the game name, Start over top-right.
 * - ScoreStrip: the same three numbers everywhere — right, played,
 *   streak — plus a lives readout in lives mode. Every quiz game tracks
 *   a streak (consecutive correct rounds); a wrong answer or give-up
 *   resets it.
 * - SettingsPanel: play mode, difficulty, and content pool live in one
 *   collapsed panel, closed by default, with the current choice
 *   summarized on the toggle. Picking a setting collapses the panel
 *   again, so the question comes straight into view. Changing a setting
 *   still resets the score, exactly as before.
 * - RoundLabel: every game numbers its rounds "Round N" ("Round N of 10"
 *   in 10-questions mode) — no more Puzzle / Discovery / Wild card /
 *   Matchup variants. */

export function QuizHeader({ kicker, title, onStartOver }) {
  return <header className="qs-header"><div><span className="qs-kicker">{kicker}</span><h1 className="qs-title">{title}</h1></div><button className="pf-btn qs-start-over" type="button" onClick={onStartOver}><RestartIcon />Start over</button></header>;
}

export function ScoreStrip({ correct, played, streak, lives }) {
  return <div className="qs-score" aria-label="Your score">
    <span><strong>{correct}</strong> right</span>
    <span><strong>{played}</strong> played</span>
    <span><strong>{streak}</strong> streak</span>
    {lives !== null && lives !== undefined && <span><strong><LivesHearts lives={lives} /></strong> lives</span>}
  </div>;
}

export function SettingsPanel({ summary, children }) {
  /* A pick inside the panel collapses it again, so the question is the
   * next thing on screen. The summary itself is not a button, so opening
   * and closing the panel by tapping it is unaffected. */
  const closeOnPick = (event) => {
    if (event.target.closest && event.target.closest('button')) event.currentTarget.open = false;
  };
  return <details className="qs-settings" onClick={closeOnPick}>
    <summary className="qs-settings-summary"><span>Settings</span><span className="qs-settings-current">{summary}</span><span className="qs-settings-chevron" aria-hidden="true">▾</span></summary>
    <div className="qs-settings-body">{children}</div>
  </details>;
}

export function RoundLabel({ round, total }) {
  return <p className="qs-round">Round {round}{total ? ` of ${total}` : ''}</p>;
}
