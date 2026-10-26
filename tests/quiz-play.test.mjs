import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAY_MODES, nextLives, isGameOver, livesHearts } from '../lib/quiz-play.mjs';

test('play modes are endless, 10 questions, 3 lives, in that order', () => {
  assert.deepEqual(
    PLAY_MODES.map((mode) => mode.id),
    ['endless', 'ten', 'lives'],
  );
});

test('only survival mode loses a life, and only on a wrong answer', () => {
  assert.equal(nextLives('endless', 3, false), 3);
  assert.equal(nextLives('ten', 3, false), 3);
  assert.equal(nextLives('lives', 3, true), 3);
  assert.equal(nextLives('lives', 3, false), 2);
  assert.equal(nextLives('lives', 1, false), 0);
});

test('game over at 10 answered rounds, or at 0 lives, never in endless', () => {
  assert.equal(isGameOver('endless', 100, 3), false);
  assert.equal(isGameOver('ten', 9, 3), false);
  assert.equal(isGameOver('ten', 10, 3), true);
  assert.equal(isGameOver('lives', 4, 1), false);
  assert.equal(isGameOver('lives', 4, 0), true);
});

test('lives hearts show filled then empty hearts out of three', () => {
  assert.equal(livesHearts(3), '♥♥♥');
  assert.equal(livesHearts(2), '♥♥♡');
  assert.equal(livesHearts(0), '♡♡♡');
});
