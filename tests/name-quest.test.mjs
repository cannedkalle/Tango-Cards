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
