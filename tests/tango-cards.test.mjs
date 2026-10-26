import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { emptyPackState, formatRemaining, maxPullChances, pullIntervalMs, reconcilePackState } from '../lib/tango-cards/pack-state.mjs';
import { rarityForCard, rarityLabels, rarityOrder } from '../lib/tango-cards/rarities.mjs';

test('pack chances start full and refill on the 12-hour clock', () => {
  const fresh = emptyPackState();
  assert.equal(fresh.chances, maxPullChances);
  assert.equal(maxPullChances, 4);
  assert.equal(pullIntervalMs, 12 * 60 * 60 * 1000);
  const now = Date.now();
  const drained = { ...fresh, chances: 1, lastUpdatedAt: now - 25 * 60 * 60 * 1000 };
  assert.equal(reconcilePackState(drained, now).chances, 3);
  const capped = reconcilePackState({ ...fresh, chances: 3, lastUpdatedAt: now - 48 * 60 * 60 * 1000 }, now);
  assert.equal(capped.chances, 4);
  assert.equal(capped.lastUpdatedAt, now);
});

test('remaining time formats as HH:MM:SS', () => {
  assert.equal(formatRemaining(0), '00:00:00');
  assert.equal(formatRemaining(3661000), '01:01:01');
  assert.equal(formatRemaining(-5), '00:00:00');
});

test('rarity follows prompt first, then card number', () => {
  assert.equal(rarityForCard({ prompt: 'Rarity: Ultra Rare', number: 1 }), 'ultra-rare');
  assert.equal(rarityForCard({ prompt: '', number: 20 }), 'ultra-rare');
  assert.equal(rarityForCard({ prompt: '', number: 10 }), 'rare');
  assert.equal(rarityForCard({ prompt: '', number: 8 }), 'uncommon');
  assert.equal(rarityForCard({ prompt: '', number: 3 }), 'common');
  assert.deepEqual(rarityOrder, ['common', 'uncommon', 'rare', 'ultra-rare']);
  assert.equal(rarityLabels['ultra-rare'], 'Ultra Rare');
});

test('card data covers all five series', () => {
  const cards = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url)));
  const sources = new Set(cards.map((card) => card.series));
  for (const source of ['Series A', 'Series B', 'Series C', 'Series D Final', 'Series D2 Final']) {
    assert.ok(sources.has(source), source);
  }
  assert.ok(cards.length >= 100);
  for (const card of cards) {
    assert.ok(card.id, 'card id');
    assert.ok(card.series, 'card series');
  }
});
