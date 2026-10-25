import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildFunComparisonCandidates, buildWildComparisonPairs, comparisonScore, createGame, isFunComparison, validateContent } from '../src/game.mjs';
const base = Object.fromEntries(await Promise.all(['objects','pairs','sources'].map(async name => [name, JSON.parse(await readFile(new URL(`../data/${name}.json`, import.meta.url), 'utf8'))])));
const expansion = JSON.parse(await readFile(new URL('../data/expansion.json', import.meta.url), 'utf8'));
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

test('100 seeded games complete three pools without repeats, score drift or answer-side bias', () => {
  const correctSides = new Set();
  for (let seed=1; seed<=100; seed++) {
    const game = createGame(pairs,seededRandom(seed));
    let previousId;
    let expected = 0;
    for (let cycle=1;cycle<=3;cycle++) {
      const seen = new Set();
      for(let i=0;i<pairs.length;i++) {
        const state=game.next();
        assert.equal(state.cycle,cycle);
        assert.equal(state.position,i+1);
        assert.notEqual(state.pair.id,previousId);
        assert.ok(!seen.has(state.pair.id)); seen.add(state.pair.id);
        assert.equal(game.next().pair.id,state.pair.id, 'cannot skip unanswered round');
        assert.equal(game.answer('not-a-choice'),null);
        correctSides.add(state.choices.indexOf(state.pair.earlierObjectId));
        const chosen=i%2===0?state.pair.earlierObjectId:state.choices.find(id=>id!==state.pair.earlierObjectId);
        if(i%2===0) expected++;
        const result=game.answer(chosen);
        assert.equal(result.correct,expected);
        assert.equal(result.answered,(cycle-1)*pairs.length+i+1);
        assert.equal(game.answer(chosen),null,'double taps do not score');
        previousId=state.pair.id;
      }
      assert.equal(seen.size,pairs.length);
    }
  }
  assert.deepEqual([...correctSides].sort(),[0,1]);
});

test('reset clears score and handles a one-pair pool', () => {
  const game=createGame([pairs[0]],()=>0);
  const first=game.next(); game.answer(first.pair.earlierObjectId);
  assert.equal(game.next().cycle,2);
  const reset=game.reset();
  assert.equal(reset.answered,0); assert.equal(reset.correct,0); assert.equal(reset.cycle,1); assert.equal(reset.selected,null);
  assert.throws(()=>createGame([]));
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

test('wild mode includes every clearly ordered pair, including oddball contrasts', () => {
  const wildPairs = buildWildComparisonPairs(content.objects);
  assert.ok(wildPairs.length > pairs.length);
  const paperLaptop = wildPairs.find(pair => pair.objectAId === 'paper' && pair.objectBId === 'laptop');
  assert.ok(paperLaptop);
  assert.equal(paperLaptop.earlierObjectId, 'paper');
  assert.ok(!wildPairs.some(pair => pair.objectAId === 'paper' && pair.objectBId === 'paper'));
});

test('all 93 reviewed additions have facts, related curated matchups, and wild coverage', async () => {
  const review = JSON.parse(await readFile(new URL('../data/expansion-review.json', import.meta.url), 'utf8'));
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
