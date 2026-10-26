/* Two Hints progress in the player's own browser storage, the wild-guess
 * pattern: the current puzzle and score survive a reload, a finished game
 * does not (results are ephemeral). Every load is validated — a stale save
 * from an older pool, or any bad value, returns null and starts fresh. */

import { PLAY_MODES } from "../quiz-play.mjs";
import { pairById } from "./questions.mjs";

const SAVE_KEY = "two-hints-save-v1";

export function saveProgress(state) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* Storage unavailable (private mode, quota): the game still plays. */
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* Nothing to clear. */
  }
}

export function loadProgress() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    if (!saved || typeof saved !== "object") return null;
    const pair = pairById(saved.pairId);
    if (!pair) return null;
    if (!PLAY_MODES.some((mode) => mode.id === saved.playMode)) return null;
    const played = Number(saved.played);
    const correct = Number(saved.correct);
    const lives = Number(saved.lives);
    if (![played, correct, lives].every(Number.isFinite)) return null;
    if (played < 0 || correct < 0 || correct > played || lives < 0 || lives > 3) return null;
    const options = Array.isArray(saved.options) ? saved.options : null;
    if (!options || options.length !== 4) return null;
    if (new Set(options).size !== 4 || !options.includes(pair.answer)) return null;
    const history = Array.isArray(saved.history)
      ? saved.history.filter((id) => pairById(id))
      : [];
    return { pair, options, playMode: saved.playMode, played, correct, lives, history };
  } catch {
    return null;
  }
}
