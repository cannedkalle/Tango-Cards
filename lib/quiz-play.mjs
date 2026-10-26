/* Shared play-mode rules for the quiz games (Balls in the Ballpark, Before
 * the Bulb, Name Quest, Animal Outsider).
 *
 * Every quiz game offers the same three play modes, in the same order, with
 * the same meaning:
 * - endless: play forever, the way these games always worked. No end screen.
 * - ten: exactly 10 answered rounds, then a results screen.
 * - lives: 3 lives. A wrong answer loses one; 0 lives ends the game with a
 *   results screen. A right answer never costs a life.
 * Switching mode (or difficulty, where a game has one) always resets the
 * score, so a mode's results are never mixed with another mode's rounds.
 * Games keep their own round engines and score displays; they call these
 * two pure functions so the end-of-game rules cannot drift apart. */

export const PLAY_MODES = [
  { id: 'endless', label: 'Endless' },
  { id: 'ten', label: '10 questions' },
  { id: 'lives', label: '3 lives' },
];

/* Lives after one answer. Only the survival mode changes the count. */
export function nextLives(mode, lives, wasCorrect) {
  if (mode !== 'lives') return lives;
  return wasCorrect ? lives : lives - 1;
}

/* Whether the game is over after `answered` answered rounds with `lives`
 * lives left. Endless never ends. */
export function isGameOver(mode, answered, lives) {
  if (mode === 'ten') return answered >= 10;
  if (mode === 'lives') return lives <= 0;
  return false;
}

/* Hearts for the survival score strip, e.g. 2 lives left -> '♥♥♡'. */
export function livesHearts(lives) {
  const left = Math.max(0, Math.min(3, lives));
  return '♥'.repeat(left) + '♡'.repeat(3 - left);
}
