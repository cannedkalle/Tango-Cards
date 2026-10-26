import test from 'node:test';
import assert from 'node:assert/strict';
import { animals } from '../lib/animal-outsider/animals.mjs';
import { rootWords, taxonInfo } from '../lib/animal-outsider/taxa.mjs';
import { easyAnimalIds, getAnimalPool } from '../lib/animal-outsider/difficulty.mjs';
import {
  analyzeTriple,
  buildCandidateRound,
  describeTaxon,
  estimateDifficulty,
  findParallelBranch,
  generateRound,
  mostRecentSharedClade,
  roundKey,
  sharedPathFor,
} from '../lib/animal-outsider/game.mjs';

const byId = new Map(animals.map((animal) => [animal.id, animal]));
const animal = (id) => byId.get(id);

test('pool has 298 animals with unique ids and complete taxonomy', () => {
  assert.equal(animals.length, 298);
  assert.equal(new Set(animals.map((item) => item.id)).size, 298);
  for (const item of animals) {
    assert.equal(typeof item.id, 'string');
    assert.equal(typeof item.commonName, 'string');
    assert.equal(typeof item.scientificName, 'string');
    assert.deepEqual(
      Object.keys(item.taxonomy).sort(),
      ['class', 'family', 'genus', 'kingdom', 'order', 'phylum', 'species']
    );
    assert.equal(item.taxonomy.kingdom, 'Animalia');
    assert.ok(Array.isArray(item.clades) && item.clades.length > 0);
    assert.equal(item.clades[0], 'Animalia');
    for (const rank of ['phylum', 'class', 'order', 'family', 'genus']) {
      assert.ok(item.clades.includes(item.taxonomy[rank]), `${item.id} is missing ${item.taxonomy[rank]} from its clades`);
    }
  }
});

test('easy pool is the 64 familiar animals; standard pool is everything', () => {
  const easy = getAnimalPool(animals, 'easy');
  assert.equal(easy.length, 64);
  assert.equal(easyAnimalIds.size, 64);
  for (const item of easy) assert.ok(easyAnimalIds.has(item.id));
  assert.equal(getAnimalPool(animals, 'standard').length, 298);
});

test('mostRecentSharedClade scores the closest shared branch', () => {
  assert.deepEqual(mostRecentSharedClade(animal('dog'), animal('wolf')), { clade: 'Canis', score: 9 });
  assert.deepEqual(mostRecentSharedClade(animal('dog'), animal('cat')), { clade: 'Carnivora', score: 6 });
});

test('analyzeTriple picks the genuine outsider and rejects ties', () => {
  const foxRound = analyzeTriple([animal('dog'), animal('wolf'), animal('fox')]);
  assert.equal(foxRound.outsider.id, 'fox');
  assert.deepEqual(foxRound.pair.map((item) => item.id).sort(), ['dog', 'wolf']);
  assert.equal(foxRound.sharedClade, 'Canis');
  // At the analysis layer the cat trio is valid; the context rule in
  // buildCandidateRound is what rejects it (see the next test).
  const catRound = analyzeTriple([animal('dog'), animal('wolf'), animal('cat')]);
  assert.equal(catRound.outsider.id, 'cat');
  assert.equal(analyzeTriple([animal('dog'), animal('wolf'), animal('coyote')]), null);
});

test('buildCandidateRound enforces the shared-parent context rule', () => {
  const foxRound = buildCandidateRound([animal('dog'), animal('wolf'), animal('fox')]);
  assert.ok(foxRound);
  assert.equal(foxRound.outsider.id, 'fox');
  assert.equal(foxRound.level, 1);
  // The cat shares the pair's order but not its family, so the round has
  // no shared parent group for the outsider and is rejected.
  assert.equal(buildCandidateRound([animal('dog'), animal('wolf'), animal('cat')]), null);
});

test('estimateDifficulty ranks known branches', () => {
  const round = (sharedClade, pairIds, outsiderId) => ({
    sharedClade,
    pair: pairIds.map((id) => ({ id })),
    outsider: { id: outsiderId },
  });
  assert.equal(estimateDifficulty(round('Canis', ['dog', 'wolf'], 'fox')), 1);
  assert.equal(estimateDifficulty(round('Felidae', ['cat', 'lion'], 'dog')), 2);
  assert.equal(estimateDifficulty(round('Whippomorpha', ['orca', 'hippopotamus'], 'horse')), 4);
  assert.equal(estimateDifficulty(round('Dinosauria', ['chicken', 'crocodile'], 'lizard')), 5);
  assert.equal(estimateDifficulty(round('Carnivora', ['dog', 'cat'], 'bat')), 3);
});

test('generateRound deals valid outsider rounds from both pools', () => {
  for (const difficulty of ['easy', 'standard']) {
    const pool = getAnimalPool(animals, difficulty);
    for (let i = 0; i < 50; i += 1) {
      const round = generateRound(pool, []);
      assert.equal(round.choices.length, 3);
      assert.equal(new Set(round.choices.map((item) => item.id)).size, 3);
      assert.ok(round.choices.some((item) => item.id === round.outsider.id));
      assert.ok(round.pair.every((item) => round.choices.includes(item)));
      assert.ok(round.level >= 1 && round.level <= 5);
      const pairScore = mostRecentSharedClade(round.pair[0], round.pair[1]).score;
      assert.equal(round.sharedClade, mostRecentSharedClade(round.pair[0], round.pair[1]).clade);
      for (const member of round.pair) {
        assert.ok(pairScore > mostRecentSharedClade(member, round.outsider).score);
      }
    }
  }
});

test('generateRound respects the recent-round window', () => {
  const pool = getAnimalPool(animals, 'easy');
  let keys = [];
  for (let i = 0; i < 40; i += 1) {
    const round = generateRound(pool, keys);
    const key = roundKey(round);
    assert.ok(!keys.includes(key), `round ${key} repeated inside the recent window`);
    keys = [...keys, key].slice(-18);
  }
});

test('describeTaxon returns curated entries and inferred fallbacks', () => {
  const canis = describeTaxon('Canis');
  assert.equal(canis.rank, 'Genus');
  assert.equal(canis.literalMeaning, 'dog');
  const unknown = describeTaxon('NoSuchBranch');
  assert.equal(unknown.rank, 'Branch');
  assert.equal(unknown.literalMeaning, 'scientific branch name');
  assert.match(unknown.kidExplanation, /taxonomy branch/);
});

test('findParallelBranch finds the outsider-side branch', () => {
  const parallel = findParallelBranch(animal('fox'), 'Carnivora', 'Canis');
  assert.equal(parallel.name, 'Vulpes');
  assert.equal(findParallelBranch(animal('dog'), 'NoSuchClade', 'Canis'), null);
});

test('sharedPathFor lists the common branches', () => {
  const dogs = sharedPathFor(animal('dog'), animal('wolf'));
  assert.ok(dogs.includes('Canis') && dogs.includes('Carnivora'));
  const mixed = sharedPathFor(animal('dog'), animal('cat'));
  assert.ok(mixed.includes('Carnivora'));
  assert.ok(!mixed.includes('Canis') && !mixed.includes('Felidae'));
});

test('root words and taxon info are present', () => {
  assert.ok(rootWords.length > 0);
  for (const root of rootWords) {
    assert.equal(typeof root.root, 'string');
    assert.equal(typeof root.meaning, 'string');
    assert.ok(Array.isArray(root.examples) && root.examples.length > 0);
  }
  assert.equal(taxonInfo.Animalia.rank, 'Kingdom');
});
