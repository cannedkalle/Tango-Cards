import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const directory = mkdtempSync(path.join(tmpdir(), 'wild-guess-'));
process.env.WILD_GUESS_DB_PATH = path.join(directory, 'test.sqlite');
delete process.env.DATABASE_URL; delete process.env.POSTGRES_URL; delete process.env.POSTGRES_PRISMA_URL; delete process.env.POSTGRES_URL_NON_POOLING;
const { comparisons, comparisonCategories, rangesOverlap } = await import('../lib/wild-guess/comparisons.mjs');
const { canonicalConceptKey, isPartWholePair, MAX_CLOSE_GAP, MIN_PAIRS_PER_CATEGORY, subjectCategories, subjects, subjectsOverlap, validSubjectPairs } = await import('../lib/wild-guess/subjects.mjs');
const { createGame, formatRange, formatScale, readGame, submitChoice, scaleName } = await import('../lib/wild-guess/game.mjs');
const { database } = await import('../lib/wild-guess/database.mjs');
execFileSync(process.execPath, ['scripts/setup-wild-guess.mjs'], { env: process.env });

test('proposal pool contains 100 clear, non-overlapping comparisons across four categories', () => {
  assert.equal(comparisons.length, 100);
  assert.equal(new Set(comparisons.map((comparison) => comparison.id)).size, 100);
  assert.deepEqual([...comparisonCategories].sort(), ['count', 'duration', 'frequency', 'weight']);
  for (const category of comparisonCategories) assert.ok(comparisons.filter((comparison) => comparison.category === category).length >= 20);
  for (const comparison of comparisons) {
    assert.equal(comparison.status, 'proposal');
    assert.ok(comparison.prompt.endsWith('?'));
    assert.ok(comparison.left.label && comparison.right.label && comparison.left.note && comparison.right.note);
    assert.equal(rangesOverlap(comparison), false, `${comparison.id} has overlapping ranges`);
    assert.notEqual(comparison.left.magnitude, comparison.right.magnitude);
  }
  const weight = comparisons.filter((comparison) => comparison.category === 'weight');
  const frequency = comparisons.filter((comparison) => comparison.category === 'frequency');
  assert.ok(weight.every((comparison) => comparison.prompt === 'Which weighs more?'));
  assert.ok(frequency.every((comparison) => comparison.prompt === 'Which has the shorter gap between events?'));
  assert.ok(frequency.every((comparison) => !/\bin one second\b|\bduring the same\b/i.test(`${comparison.left.label} ${comparison.right.label}`)));
  assert.ok(frequency.every((comparison) => comparison.left.scaleLabel && comparison.right.scaleLabel));
  assert.ok(frequency.every((comparison) => /per second$/.test(comparison.left.scaleLabel) && /per second$/.test(comparison.right.scaleLabel)));
});

test('subject pool deals close, non-overlapping, non-part-whole matchups', () => {
  assert.equal(subjects.length, 114);
  assert.equal(new Set(subjects.map((subject) => subject.id)).size, subjects.length);
  assert.equal(new Set(subjects.map((subject) => `${subject.category}:${canonicalConceptKey(subject.label)}`)).size, subjects.length);
  assert.deepEqual(subjects.filter((subject) => /\b(big|large|huge|long|full-grown|giant)\b/i.test(subject.label) && !/\bgiant tortoise\b/i.test(subject.label)).map((subject) => subject.label), []);
  assert.ok(subjects.filter((subject) => subject.category === 'frequency' && /wingbeats/i.test(subject.label)).length <= 3);
  assert.equal(subjects.some((subject) => subject.label === 'Two meals eaten by one person'), false);
  assert.equal(subjects.some((subject) => subject.label === 'Two ticks of a clock'), false);
  assert.deepEqual(Object.fromEntries(subjectCategories.map((category) => [category, validSubjectPairs(category).length])), {
    count: 47,
    duration: 50,
    weight: 38,
    frequency: 20,
    length: 24,
    area: 13,
    volume: 9,
    speed: 14,
  });
  const byId = new Map(subjects.map((subject) => [subject.id, subject]));
  for (const [a, b] of [
    ['count-ants-alive-on-earth', 'count-insects-alive-on-earth'],
    ['count-stars-your-eyes-can-see-in-a-dark-sky', 'count-stars-in-the-observable-universe'],
    ['duration-an-acorn-growing-into-a-full-sized-oak', 'duration-an-oak-trees-life'],
    ['weight-a-blue-whale', 'weight-all-the-blue-whales-on-earth'],
    ['weight-a-blue-whale', 'weight-all-whales-alive-today'],
    ['weight-all-the-blue-whales-on-earth', 'weight-all-whales-alive-today'],
    ['weight-earth', 'weight-all-eight-planets-together'],
    ['volume-the-water-in-lake-erie', 'volume-the-water-in-all-five-great-lakes'],
    ['area-the-great-barrier-reef-marine-park', 'area-the-pacific-ocean'],
    ['area-a-city-block', 'area-the-island-of-manhattan'],
  ]) {
    assert.ok(byId.get(a) && byId.get(b), `${a} / ${b} exist`);
    assert.equal(isPartWholePair(byId.get(a), byId.get(b)), true, `${a} vs ${b}`);
  }
  for (const category of subjectCategories) {
    const pairs = validSubjectPairs(category);
    assert.ok(pairs.length >= MIN_PAIRS_PER_CATEGORY, category);
    for (const [left, right] of pairs) {
      assert.equal(left.category, right.category);
      assert.equal(subjectsOverlap(left, right), false);
      assert.equal(isPartWholePair(left, right), false, `${left.id} vs ${right.id}`);
      const gap = Math.abs(left.magnitude - right.magnitude);
      // Every pool now deals within 1000x, including volume: the scale-up
      // batch gave volume enough close pairs that its floor pairs dropped out.
      assert.ok(gap <= MAX_CLOSE_GAP, `${left.id} vs ${right.id}: gap ${gap}`);
    }
  }
});

test('frequency no longer leans on the blue whale heartbeat, and retired subjects stay out', () => {
  const frequencyPairs = validSubjectPairs('frequency');
  const whalePairs = frequencyPairs.filter(([a, b]) => a.label.includes('blue whale') || b.label.includes('blue whale'));
  assert.equal(whalePairs.length, 4);
  assert.ok(whalePairs.length < frequencyPairs.length / 4, 'whale share under a quarter');
  for (const label of ['Two waves reaching one beach', 'The water in an Olympic competition pool', 'Two human heartbeats', 'Two ticks of a clock', 'Two meals eaten by one person']) {
    assert.equal(subjects.some((subject) => subject.label === label), false, label);
  }
});

test('generator deals quality matchups, spaces repeats, and never runs dry', async () => {
  const { generateComparison } = await import('../lib/wild-guess/client-game.mjs');
  const frequency = generateComparison('frequency');
  assert.equal(frequency.category, 'frequency');
  assert.equal(subjectsOverlap(frequency.left, frequency.right), false);
  assert.equal(isPartWholePair(frequency.left, frequency.right), false);
  const history = [];
  for (let round = 0; round < 200; round += 1) {
    const dealt = generateComparison(undefined, { pairIds: history });
    assert.ok(dealt, `round ${round} dealt`);
    assert.equal(subjectsOverlap(dealt.left, dealt.right), false);
    assert.equal(isPartWholePair(dealt.left, dealt.right), false);
    const gap = Math.abs(dealt.left.magnitude - dealt.right.magnitude);
    assert.ok(gap <= MAX_CLOSE_GAP, `${dealt.id}: gap ${gap}`);
    assert.ok(!history.includes(dealt.id) && !history.includes(`${dealt.right.id}--${dealt.left.id}`), `${dealt.id} repeated within window`);
    history.push(dealt.id);
    if (history.length > 12) history.shift();
  }
  const volumePairs = validSubjectPairs('volume');
  const avoided = volumePairs.flatMap(([a, b]) => [`${a.id}--${b.id}`, `${b.id}--${a.id}`]);
  const fallback = generateComparison('volume', { pairIds: avoided });
  assert.ok(fallback);
  assert.equal(fallback.category, 'volume');
});

test('magnitude labels stay readable at very large scales', () => {
  assert.equal(scaleName(3), 'thousands');
  assert.equal(scaleName(12), 'trillions');
  assert.equal(scaleName(23), 'hundreds of sextillions');
  assert.equal(formatScale({ magnitude: 19 }, 'weight'), 'tens of quintillions of kilograms');
  assert.equal(formatScale({ magnitude: 9 }, 'duration'), 'decades');
  assert.equal(formatScale({ magnitude: 6, scaleLabel: 'about 6,400 kilometers' }, 'length'), 'thousands of kilometers');
  assert.equal(formatScale({ magnitude: 11, scaleLabel: 'about 150 million kilometers' }, 'length'), 'hundreds of millions of kilometers');
  assert.equal(formatScale({ magnitude: 11, scaleLabel: 'about 344,000 square kilometers' }, 'area'), 'hundreds of thousands of square kilometers');
  assert.equal(formatScale({ magnitude: 1, scaleLabel: 'about 30 square meters' }, 'area'), 'tens of square meters');
  assert.equal(formatScale({ magnitude: 6, scaleLabel: 'about 2.6 million cubic meters' }, 'volume'), 'billions of liters');
  assert.equal(formatScale({ magnitude: 0, scaleLabel: 'about 7,500 liters' }, 'volume'), 'thousands of liters');
  assert.equal(formatScale({ magnitude: -5, scaleLabel: 'up to 90 centimeters per day' }, 'speed'), 'tens of centimeters per day');
  assert.equal(formatScale({ magnitude: 2, scaleLabel: 'about 200 per second' }, 'frequency'), 'hundreds per second');
  assert.equal(formatScale({ magnitude: -6, scaleLabel: 'about 0.000003 per second' }, 'frequency'), 'one every few days');
  assert.equal(formatScale({ magnitude: -1, scaleLabel: 'about 0.05 to 0.2 heartbeats per second' }, 'frequency'), 'one every few seconds');
  assert.equal(formatRange({ lowMagnitude: 18, highMagnitude: 20 }, 'weight'), 'Estimates range from quintillions of kilograms to hundreds of quintillions of kilograms.');
  assert.equal(formatRange({ magnitude: 2, scaleLabel: 'about 100 to 200 wingbeats per second' }, 'frequency'), 'A useful estimate is about 100 to 200 wingbeats per second.');
  assert.equal(formatRange({ magnitude: -1, scaleLabel: 'about 0.05 to 0.2 heartbeats per second' }, 'frequency'), 'It takes about 5 to 20 seconds for one to happen.');
  assert.equal(formatRange({ magnitude: 6, scaleLabel: 'about 6,400 to 6,800 kilometers' }, 'length'), 'A useful estimate is about 6,400 to 6,800 kilometers.');
  assert.equal(formatRange({ magnitude: 6, scaleLabel: 'about 2.6 million cubic meters' }, 'volume'), 'A useful estimate is about 2.6 million cubic meters.');
  assert.equal(formatRange({ magnitude: -9, scaleLabel: 'about 1 to 15 centimeters per year' }, 'speed'), 'A useful estimate is about 1 to 15 centimeters per year.');
  assert.equal(formatRange({ magnitude: 30, lowMagnitude: 30, highMagnitude: 31 }, 'weight'), 'That is roughly a 1 followed by 30 zeros, measured in kilograms.');
});

test('an endless game records a binary choice and conceals the answer until reveal', async () => {
  const id = await createGame();
  let game = await readGame(id);
  assert.deepEqual(game.stats, { played: 0, correct: 0 });
  assert.equal(game.pending, 1);
  assert.equal(game.current.comparison.sides.length, 2);
  assert.ok(game.current.comparison.sides.every((option) => !('scale' in option) && !('note' in option)));

  const first = game.current;
  const [storedPair] = await database().query(`SELECT l.low_magnitude AS left_low,l.high_magnitude AS left_high,r.low_magnitude AS right_low,r.high_magnitude AS right_high
    FROM wg_matchup_rounds m
    JOIN wg_subjects l ON l.id=m.left_subject_id AND l.version=m.left_subject_version
    JOIN wg_subjects r ON r.id=m.right_subject_id AND r.version=m.right_subject_version
    WHERE m.session_id=$1 AND m.position=$2`, [id, first.position]);
  assert.ok(Number(storedPair.left_high) < Number(storedPair.right_low) || Number(storedPair.right_high) < Number(storedPair.left_low));
  const result = await submitChoice(id, first.position, 0);
  assert.equal(result.reveal.sides.length, 2);
  assert.ok(result.reveal.sides.every((option) => option.scale && option.scaleLead && option.detail));
  assert.equal(result.game.stats.played, 1);
  assert.equal(result.game.stats.correct, Number(result.reveal.correct));
  assert.notEqual(result.game.current.position, first.position);

  const beforeReplay = result.game.stats.played;
  const replay = await submitChoice(id, first.position, 0);
  assert.equal(replay.reveal, null);
  assert.equal(replay.game.stats.played, beforeReplay);
  assert.equal(await readGame('invalid'), null);
});

test('seed is idempotent and generated-matchup foreign keys reject broken references', async () => {
  execFileSync(process.execPath, ['scripts/setup-wild-guess.mjs'], { env: process.env });
  assert.equal(Number((await database().query('SELECT COUNT(*) AS count FROM wg_subjects WHERE active=1'))[0].count), subjects.length);
  await assert.rejects(database().query('INSERT INTO wg_matchup_rounds(session_id,position,left_subject_id,left_subject_version,right_subject_id,right_subject_version) VALUES($1,0,$2,1,$3,1)', ['missing', 'missing-left', 'missing-right']));
});

process.on('exit', () => rmSync(directory, { recursive: true, force: true }));
