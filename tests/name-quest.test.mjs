import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const bank = JSON.parse(readFileSync(new URL('../lib/name-quest/name-bank.json', import.meta.url)));
const source = readFileSync(new URL('../app/name-quest/Game.jsx', import.meta.url), 'utf8');
// Exercise the actual client selection functions without rendering React or JSX.
const context = vm.createContext({ entries: bank, animalPairs: [] });
vm.runInContext(source.slice(source.indexOf('const categories ='), source.indexOf('const getPokemonModeGroups =')), context);
const game = vm.runInContext('({ categories, getChoices, getPool, isConfusingDistractor })', context);
const expandedCategories = ['Dog Breed', 'Cheese', 'Board Game', 'Cloud Type', 'Dance Style', 'Musical Instrument'];

test('expanded categories have substantial banks and coverage in every difficulty mode', () => {
  for (const category of expandedCategories) {
    const entries = bank.filter(entry => entry.category === category);
    assert.ok(game.categories.includes(category), category);
    assert.ok(entries.length >= 20, category);
    for (const level of ['easy', 'standard', 'challenge']) {
      assert.ok(game.getPool(level, 'category').some(entry => entry.category === category), `${category}: ${level}`);
    }
    for (const entry of entries) {
      assert.ok(['easy', 'standard', 'challenge'].some(level => game.getPool(level, 'category').includes(entry)), `${entry.name} must be reachable`);
      assert.ok(game.getPool('standard', 'pokemon').includes(entry), `${entry.name} in Pokemon-or-not`);
      for (const field of ['subcategory', 'pronunciation', 'explanation']) assert.ok(entry[field]?.trim(), `${entry.name}: ${field}`);
      assert.ok(entry.acceptedAnswers.includes(category.toLowerCase()), entry.name);
      const choices = game.getChoices(entry);
      assert.equal(new Set(choices).size, 4, entry.name);
      assert.ok(choices.includes(category), entry.name);
      for (const other of choices.filter(choice => choice !== category)) {
        assert.ok(!game.isConfusingDistractor(category, other), `${entry.name}: ${other}`);
        assert.ok(!entry.acceptedAnswers.includes(other.toLowerCase()), `${entry.name}: accepted answer used as distractor`);
      }
    }
  }
});

test('overlapping category meanings are never opposing answers', () => {
  for (const [first, second] of [
    ['Dog Breed', 'Animal'], ['Dog Breed', 'Place'], ['Cheese', 'Dish'],
    ['Cheese', 'Place'], ['Board Game', 'Game'], ['Board Game', 'Place'],
    ['Dance Style', 'Dish'], ['Dance Style', 'Place'], ['Cloud Type', 'Science Term'],
    ['Cloud Type', 'Plant'], ['Musical Instrument', 'Art Term'],
  ]) {
    assert.ok(game.isConfusingDistractor(first, second), `${first}/${second}`);
    assert.ok(game.isConfusingDistractor(second, first), `${second}/${first}`);
  }
});

test('bank IDs are unique and flowers remain plants', () => {
  assert.equal(new Set(bank.map(entry => entry.id)).size, bank.length);
  assert.equal(new Set(bank.map(entry => entry.name.toLowerCase())).size, bank.length);
  assert.ok(!bank.some(entry => entry.category === 'Flower'));
  for (const name of ['Rafflesia', 'Zinnia', 'Hydrangea']) {
    assert.equal(bank.find(entry => entry.name === name)?.category, 'Plant');
  }
});

// The dealing helpers live after getPokemonModeGroups, so these tests run
// them from a second slice that reaches the component boundary, with the
// real pair prompts (the first context above keeps animalPairs empty).
const realPairs = JSON.parse(readFileSync(new URL('../lib/name-quest/pokemon-animal-pairs.json', import.meta.url)));
const dealContext = vm.createContext({ entries: bank, animalPairs: realPairs });
vm.runInContext(source.slice(source.indexOf('const categories ='), source.indexOf('export default function Game')), dealContext);
const deal = vm.runInContext('({ applyRecentWindow, pickNext, pickPairNext, RECENT_WINDOW_SIZE })', dealContext);

test('session window tracks the last 12 dealt ids', () => {
  assert.equal(deal.RECENT_WINDOW_SIZE, 12);
  const first = deal.applyRecentWindow([], 'a');
  assert.equal(first.length, 1);
  assert.equal(first[0], 'a');
  let recent = [];
  for (let i = 0; i < 12; i += 1) recent = deal.applyRecentWindow(recent, 'id-' + i);
  assert.equal(recent.length, 12);
  assert.equal(recent[0], 'id-0');
  recent = deal.applyRecentWindow(recent, 'id-12');
  assert.equal(recent.length, 12);
  assert.equal(recent[0], 'id-1');
  assert.equal(recent[11], 'id-12');
  // Re-dealing an id refreshes its recency instead of duplicating it.
  recent = deal.applyRecentWindow(recent, 'id-1');
  assert.equal(recent.length, 12);
  assert.equal(recent.filter(id => id === 'id-1').length, 1);
  assert.equal(recent[11], 'id-1');
});

test('pickNext avoids the session window and falls back when the window covers the pool', () => {
  const standardPool = vm.runInContext('getPool("standard", "category")', dealContext);
  assert.ok(standardPool.length > 12);
  let recent = [];
  let current = standardPool[0];
  for (let i = 0; i < 40; i += 1) {
    const next = deal.pickNext(standardPool, new Set(recent), current.id);
    assert.ok(!recent.includes(next.id), `round ${i} repeated inside the window: ${next.id}`);
    assert.notEqual(next.id, current.id);
    recent = deal.applyRecentWindow(recent, next.id);
    current = next;
  }
  // Tiny pools: the window covering everything still deals something new.
  const tiny = [{ id: 'a' }, { id: 'b' }];
  assert.equal(deal.pickNext(tiny, new Set(['a', 'b']), 'a').id, 'b');
  assert.equal(deal.pickNext([{ id: 'a' }], new Set(['a']), 'a').id, 'a');
});

test('pair mode avoids the session window', () => {
  let recent = [];
  for (let i = 0; i < 30; i += 1) {
    const next = deal.pickPairNext(new Set(recent));
    assert.ok(!recent.includes(next.answer.id), `pair round ${i} repeated inside the window: ${next.answer.id}`);
    recent = deal.applyRecentWindow(recent, next.answer.id);
  }
});
