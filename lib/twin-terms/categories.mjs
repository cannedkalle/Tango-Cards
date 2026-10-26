/* Twin Terms categories: the six general categories the player chooses
 * from. The graded answer is one of these — a small fixed set, so
 * verification is exact. The blurbs explain what falls in, in broad
 * fields only: never a detailed subject, so the explanation can never
 * double as a lookup table for a pair's specific answer. The specific
 * answers (Baseball, Chess tactics, ...) live in questions.mjs and
 * appear only in the reveal and in the give-up choices. */

export const CATEGORIES = [
  { id: "games", name: "Games", blurb: "sports, video games, fun activities" },
  { id: "math", name: "Math", blurb: "numbers, shapes, equations" },
  { id: "science", name: "Science", blurb: "nature, matter, energy, technology" },
  { id: "society", name: "Society", blurb: "people, money, rules, media, language" },
  { id: "arts", name: "Arts", blurb: "music, stories, performance, film" },
  { id: "life", name: "Life", blurb: "food, home, nature" },
];

export function categoryById(id) {
  return CATEGORIES.find((category) => category.id === id) || null;
}
