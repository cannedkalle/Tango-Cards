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

/* Deal a random matchup: a random category, a random non-overlapping pair
 * from that category, sides flipped at random — the same deal the server
 * used to generate, now done in the browser. */
export function createComparison() {
  const category =
    subjectCategories[Math.floor(Math.random() * subjectCategories.length)];
  const pairs = validSubjectPairs(category);
  if (!pairs.length) return null;
  const [first, second] = pairs[Math.floor(Math.random() * pairs.length)];
  const [left, right] = Math.random() < 0.5 ? [first, second] : [second, first];
  return {
    id: `${left.id}--${right.id}`,
    category,
    prompt: CATEGORY_PROMPTS[category],
    left,
    right,
  };
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
