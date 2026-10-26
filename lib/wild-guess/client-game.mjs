/* Browser game engine for Balls in the Ballpark. Plays entirely from the
 * catalog that lives in the repo (subjects.mjs + comparisons.mjs), with the
 * player's progress kept in their own browser. No server database is needed:
 * this module is what lets the game run on the live site, and offline once
 * installed, exactly like the portal's other games. */

import { subjects, subjectCategories, validSubjectPairs } from './subjects.mjs';
import { winningSide } from './comparisons.mjs';
import { formatScale, formatRange } from './format.mjs';

const CATEGORY_PROMPTS = {
  count: 'Which are there more of?',
  duration: 'Which takes longer?',
  weight: 'Which weighs more?',
  frequency: 'Which has the shorter gap between events?',
  length: 'Which is longer?',
  area: 'Which covers more area?',
  volume: 'Which takes up more space?',
  speed: 'Which moves or grows faster?',
};

const byId = new Map(subjects.map((subject) => [subject.id, subject]));
const SAVE_KEY = 'wild-guess-save-v1';

/* Generate a matchup instead of picking from a fixed list: take the
 * quality pool for a category (non-overlapping ranges, within 1000x,
 * never part-vs-whole), drop anything the player has just seen, and deal
 * from what is left. The quality gates never relax; only the no-repeat
 * preference does, so this never returns null while a pool exists. Pass
 * the pair ids from recent rounds as avoid.pairIds to keep the same
 * matchup from coming straight back. */
export function generateComparison(category, avoid = {}) {
  const chosen =
    category ||
    subjectCategories[Math.floor(Math.random() * subjectCategories.length)];
  const pool = validSubjectPairs(chosen);
  if (!pool.length) return null;
  const avoidIds = new Set(avoid.pairIds || []);
  const pairId = ([a, b]) => `${a.id}--${b.id}`;
  const fresh = pool.filter(
    (pair) =>
      !avoidIds.has(pairId(pair)) && !avoidIds.has(pairId([pair[1], pair[0]])),
  );
  const candidates = fresh.length ? fresh : pool;
  const [first, second] =
    candidates[Math.floor(Math.random() * candidates.length)];
  const [left, right] = Math.random() < 0.5 ? [first, second] : [second, first];
  return {
    id: `${left.id}--${right.id}`,
    category: chosen,
    prompt: CATEGORY_PROMPTS[chosen],
    left,
    right,
  };
}

/* Backwards-compatible deal with no history: the same generator, with
 * nothing avoided. */
export function createComparison(avoid) {
  return generateComparison(undefined, avoid);
}

/* Score one answer and build the reveal, in the shape the board renders. */
export function buildReveal(comparison, choice) {
  const correctChoice = winningSide(comparison);
  const sides = [comparison.left, comparison.right].map((option) => ({
    label: option.label,
    emoji: option.emoji,
    scale: formatScale(option, comparison.category),
    scaleLead: 'Around',
    detail: formatRange(option, comparison.category),
  }));
  return {
    prompt: comparison.prompt,
    sides,
    choice,
    correctChoice,
    correct: choice === correctChoice,
  };
}

function canStore() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function saveProgress(state) {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
}

export function loadProgress() {
  if (!canStore()) return null;
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || 'null');
    if (!saved) return null;
    const left = byId.get(saved.leftId);
    const right = byId.get(saved.rightId);
    if (
      !left ||
      !right ||
      left.category !== saved.category ||
      right.category !== saved.category
    ) {
      return null;
    }
    return {
      comparison: {
        id: `${left.id}--${right.id}`,
        category: saved.category,
        prompt: CATEGORY_PROMPTS[saved.category],
        left,
        right,
      },
      position: saved.position || 0,
      played: saved.played || 0,
      correct: saved.correct || 0,
    };
  } catch {
    return null;
  }
}

export function clearProgress() {
  if (!canStore()) return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {}
}
