'use client';

import { LivesHearts, RestartIcon } from "./Icons";

/* Shared quiz shell v2: the frame every quiz game shares, kept to two
 * rows plus one slim status line so that, with the menu collapsed, the
 * whole quiz (question + choices) fits the first screen on a phone.
 *
 * - Row 1 is PortalNav (site title + icon, Back to all apps), rendered
 *   by the game itself — it already exists on every game page.
 * - Row 2 is GameBar: game name + Start over + one options dropdown.
 *   Every setting a game has (play mode, difficulty, content pool)
 *   lives in the dropdown, closed by default, with the current choices
 *   summarized on the toggle. Picking a setting collapses the menu
 *   again and still resets the score, exactly as a visible control row
 *   did. No kicker, no tagline, no separate picker rows.
 * - StatusLine is one small plain-text line, never a box or a pill:
 *   round counter, right / played, streak, plus lives hearts in
 *   3-lives mode. Every quiz game tracks a streak (consecutive
 *   correct rounds); a wrong answer or give-up resets it. Rounds are
 *   always numbered "Round N" ("Round N of 10" in 10-question mode).
 * - Below that is the game itself: its question line, its choices, its
 *   reveal. Games keep their own question, choice, and reveal markup
 *   and styling — the shell owns only the frame. */

export function GameBar({ title, onStartOver, settingsSummary, children }) {
  /* A pick inside the menu collapses it again, so the question is the
   * next thing on screen. The toggle itself is not a button, so opening
   * and closing the menu by tapping it is unaffected. */
  const closeOnPick = (event) => {
    if (event.target.closest && event.target.closest('button')) event.currentTarget.open = false;
  };
  return <header className="qs-bar">
    <h1 className="qs-bar-title">{title}</h1>
    <div className="qs-bar-actions">
      <button className="pf-btn" type="button" onClick={onStartOver} aria-label="Start over"><RestartIcon /><span className="qs-start-label">Start over</span></button>
      <details className="qs-menu" onClick={closeOnPick}>
        <summary className="qs-menu-toggle">{settingsSummary}<span aria-hidden="true"> ▾</span></summary>
        <div className="qs-menu-body">{children}</div>
      </details>
    </div>
  </header>;
}

export function StatusLine({ round, total, correct, played, streak, lives }) {
  return <p className="qs-status">Round {round}{total ? ` of ${total}` : ''} · {correct} right · {played} played · streak {streak}{lives !== null && lives !== undefined && <> · <LivesHearts lives={lives} /> lives</>}</p>;
}
