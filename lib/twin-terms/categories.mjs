/* Twin Terms categories: the six general categories the player chooses
 * from. The graded answer is one of these — a small fixed set, so
 * verification is exact. Each blurb is a short phrase that says what
 * the category is, never a detailed subject, so the explanation can
 * never double as a lookup table for a pair's specific answer. The
 * phrases are deliberately distinguished: Life is everyday life (what
 * you do day to day), Society is the social sciences (how societies
 * work), not social interaction. The specific answers (Baseball, Chess
 * tactics, ...) live in domains.mjs and appear only in the reveal
 * and in the give-up choices. */

export const CATEGORIES = [
  { id: "games", name: "Games", blurb: "play and sport" },
  { id: "math", name: "Math", blurb: "numbers and shapes" },
  { id: "science", name: "Science", blurb: "nature and how things work" },
  { id: "society", name: "Society", blurb: "how societies work" },
  { id: "arts", name: "Arts", blurb: "words, music, stage, and screen" },
  { id: "life", name: "Life", blurb: "everyday life" },
];

export function categoryById(id) {
  return CATEGORIES.find((category) => category.id === id) || null;
}
