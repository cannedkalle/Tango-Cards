import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildFunComparisonCandidates, buildFunWildPairs, buildWildComparisonPairs, comparisonScore, createGame, isFunComparison, validateContent } from '../lib/before-the-bulb/game.mjs';
const base = Object.fromEntries(await Promise.all(['objects','pairs','sources'].map(async name => [name, JSON.parse(await readFile(new URL(`../lib/before-the-bulb/${name}.json`, import.meta.url), 'utf8'))])));
const expansion = JSON.parse(await readFile(new URL('../lib/before-the-bulb/expansion.json', import.meta.url), 'utf8'));
const content = { objects: [...base.objects, ...expansion.objects], pairs: [...base.pairs, ...expansion.pairs], sources: [...base.sources, ...expansion.sources] };
const { pairs } = content;
function seededRandom(seed) { return () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296); }

test('all bundled dates, references, unique pairs and answers validate', () => {
  assert.doesNotThrow(() => validateContent(content));
  const used = new Set(pairs.flatMap(p => [p.objectAId, p.objectBId]));
  assert.equal(used.size, content.objects.length);
  for (const object of content.objects) {
    assert.doesNotMatch(object.kidDefinition, /\b\d{3,4}\b|century|invented|before|after|earlier|later/i);
  }
  for (const pair of pairs) assert.ok(pair.funFact.split(/\s+/).length <= 35, pair.id);
});

test('rejects overlapping dates, wrong answers, duplicate pair directions and unknown sources', () => {
  let bad = structuredClone(content);
  bad.objects.find(o => o.id === 'airplane').yearStart = 1783;
  assert.throws(() => validateContent(bad), /chronology/);
  bad = structuredClone(content); bad.pairs[0].earlierObjectId = bad.pairs[0].objectBId;
  assert.throws(() => validateContent(bad), /chronology/);
  bad = structuredClone(content); bad.pairs.push({...bad.pairs[0],id:'reversed',objectAId:bad.pairs[0].objectBId,objectBId:bad.pairs[0].objectAId});
  assert.throws(() => validateContent(bad), /Invalid pair/);
  bad = structuredClone(content); bad.pairs[0].factSourceIds=['missing'];
  assert.throws(() => validateContent(bad), /missing fact/);
});

test('deals are independent draws that avoid the recent window and fall back to the full pool', () => {
  const game = createGame(pairs, seededRandom(7));
  /* Mirrors the component's session window: the last 12 dealt ids. */
  const recent = [];
  for (let i = 0; i < 200; i++) {
    const state = game.next(recent);
    assert.ok(!recent.includes(state.pair.id), `repeat within window: ${state.pair.id}`);
    assert.equal(game.next(recent).pair.id, state.pair.id, 'cannot skip unanswered round');
    recent.push(state.pair.id);
    if (recent.length > 12) recent.shift();
    game.answer(state.pair.earlierObjectId);
  }
  const allIds = pairs.map((pair) => pair.id);
  const fallback = game.next(allIds);
  assert.ok(allIds.includes(fallback.pair.id));
});

test('answering scores correctly, rejects double taps, and varies the answer side', () => {
  const game = createGame(pairs, seededRandom(11));
  let expected = 0;
  const correctSides = new Set();
  for (let i = 0; i < 100; i++) {
    const state = game.next();
    assert.equal(game.answer('not-a-choice'), null);
    correctSides.add(state.choices.indexOf(state.pair.earlierObjectId));
    const chosen = i % 2 === 0 ? state.pair.earlierObjectId : state.choices.find((id) => id !== state.pair.earlierObjectId);
    if (i % 2 === 0) expected++;
    const result = game.answer(chosen);
    assert.equal(result.correct, expected);
    assert.equal(result.answered, i + 1);
    assert.equal(game.answer(chosen), null, 'double taps do not score');
  }
  assert.deepEqual([...correctSides].sort(), [0, 1]);
});

test('reset clears score, deals outside the window, and handles a one-pair pool', () => {
  const game = createGame([pairs[0], pairs[1], pairs[2]], () => 0);
  const first = game.next();
  game.answer(first.pair.earlierObjectId);
  const reset = game.reset([first.pair.id]);
  assert.equal(reset.answered, 0);
  assert.equal(reset.correct, 0);
  assert.equal(reset.selected, null);
  assert.notEqual(reset.pair.id, first.pair.id);
  const solo = createGame([pairs[0]], () => 0);
  const only = solo.next();
  solo.answer(only.pair.earlierObjectId);
  const again = solo.reset([only.pair.id]);
  assert.equal(again.pair.id, only.pair.id, 'one-pair pool falls back to its only pair');
  assert.throws(() => createGame([]));
});

test('future matching rule favors related ideas and rejects disconnected matches', () => {
  const paper = content.objects.find(object => object.id === 'paper');
  const laptop = content.objects.find(object => object.id === 'laptop');
  const piano = content.objects.find(object => object.id === 'piano');
  const keyboard = content.objects.find(object => object.id === 'electronic-keyboard');
  const rocket = content.objects.find(object => object.id === 'rocket');
  const cube = content.objects.find(object => object.id === 'cube');
  const toothbrush = content.objects.find(object => object.id === 'toothbrush');
  const toothpaste = content.objects.find(object => object.id === 'toothpaste');
  const umbrella = content.objects.find(object => object.id === 'umbrella');
  assert.equal(isFunComparison(paper, laptop), false);
  assert.equal(isFunComparison(piano, keyboard), true);
  assert.equal(isFunComparison(rocket, cube), true);
  assert.equal(isFunComparison(toothbrush, toothpaste), true);
  assert.equal(comparisonScore(toothbrush, toothpaste), 3);
  assert.equal(isFunComparison({ id: 'ancient-a', category: 'History', yearStart: -500 }, { id: 'ancient-b', category: 'Nature', yearStart: -100 }), true);
  assert.equal(isFunComparison(umbrella, laptop), false);
  assert.ok(comparisonScore(piano, keyboard) > comparisonScore(rocket, cube));
  const candidates = buildFunComparisonCandidates([paper, laptop, piano, keyboard]);
  assert.ok(candidates.some(pair => pair.objectAId === 'piano' && pair.objectBId === 'electronic-keyboard'));
  assert.ok(!candidates.some(pair => pair.objectAId === 'paper' && pair.objectBId === 'laptop'));
});

test('wild builder includes every clearly ordered pair, including oddball contrasts', () => {
  const wildPairs = buildWildComparisonPairs(content.objects);
  assert.ok(wildPairs.length > pairs.length);
  const paperLaptop = wildPairs.find(pair => pair.objectAId === 'paper' && pair.objectBId === 'laptop');
  assert.ok(paperLaptop);
  assert.equal(paperLaptop.earlierObjectId, 'paper');
  assert.ok(!wildPairs.some(pair => pair.objectAId === 'paper' && pair.objectBId === 'paper'));
});

test('wild mode deals only fun comparisons', () => {
  const byId = new Map(content.objects.map(object => [object.id, object]));
  const all = buildWildComparisonPairs(content.objects);
  const fun = buildFunWildPairs(content.objects);
  assert.ok(fun.length > pairs.length);
  assert.ok(fun.length < all.length);
  const key = pair => [pair.objectAId, pair.objectBId].sort().join('|');
  const funKeys = new Set(fun.map(key));
  assert.ok(!funKeys.has('laptop|paper'));
  assert.ok(!funKeys.has('laptop|umbrella'));
  assert.ok(funKeys.has('electronic-keyboard|piano'));
  assert.ok(funKeys.has('cube|rocket'));
  for (const pair of fun) {
    const a = byId.get(pair.objectAId), b = byId.get(pair.objectBId);
    assert.ok(isFunComparison(a, b), pair.id);
    assert.equal(pair.earlierObjectId, a.yearEnd < b.yearStart ? a.id : b.id);
  }
});

test('all 93 reviewed additions have facts, related curated matchups, and wild coverage', async () => {
  const review = JSON.parse(await readFile(new URL('../lib/before-the-bulb/expansion-review.json', import.meta.url), 'utf8'));
  assert.equal(review.expectedAddedCount, 93);
  assert.equal(new Set(review.objectIds).size, 93);
  const objects = new Map(content.objects.map(object => [object.id, object]));
  const sourceIds = new Set(content.sources.map(source => source.id));
  const wild = buildWildComparisonPairs(content.objects);
  const wildKeys = new Set(wild.map(pair => [pair.objectAId, pair.objectBId].sort().join('|')));
  for (const id of review.objectIds) {
    const object = objects.get(id);
    assert.ok(object, `Missing requested addition: ${id}`);
    assert.ok(object.ambiguityNotes && object.funFact, id);
    assert.ok(object.factSourceIds?.length && object.factSourceIds.every(source => sourceIds.has(source)), id);
    const curated = pairs.filter(pair => pair.objectAId === id || pair.objectBId === id);
    assert.ok(curated.length >= 2, `Not enough curated appearances: ${id}`);
    for (const pair of curated) {
      assert.ok(isFunComparison(objects.get(pair.objectAId), objects.get(pair.objectBId)), pair.id);
      assert.ok(wildKeys.has([pair.objectAId, pair.objectBId].sort().join('|')), pair.id);
    }
    // Audit every possible matchup involving a new item, including ties/ranges.
    for (const other of content.objects) {
      if (other.id === id) continue;
      const ordered = object.yearEnd < other.yearStart || other.yearEnd < object.yearStart;
      assert.equal(wildKeys.has([id, other.id].sort().join('|')), ordered, `${id}/${other.id}`);
    }
  }
  assert.equal(objects.get('smartphone').yearStart, 1994);
  assert.equal(objects.get('multi-touch-smartphone').yearStart, 2007);
  assert.ok(wildKeys.has(['smartphone', 'multi-touch-smartphone'].sort().join('|')));
});
