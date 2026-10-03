import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const directory = mkdtempSync(path.join(tmpdir(), 'wild-guess-'));
process.env.WILD_GUESS_DB_PATH = path.join(directory, 'test.sqlite');
delete process.env.DATABASE_URL; delete process.env.POSTGRES_URL; delete process.env.POSTGRES_PRISMA_URL; delete process.env.POSTGRES_URL_NON_POOLING;
const { questions } = await import('../lib/wild-guess/questions.mjs');
const { createGame, readGame, submitMagnitude, scoreMagnitude, magnitudeFor } = await import('../lib/wild-guess/game.mjs');
const { database } = await import('../lib/wild-guess/database.mjs');
execFileSync(process.execPath, ['scripts/setup-wild-guess.mjs'], { env: process.env });

test('content has valid ranges and concise riddle copy', () => {
  for (const question of questions) {
    assert.ok(question.low > 0 && question.low <= question.target && question.high >= question.target);
    assert.ok(question.prompt.endsWith('?') && question.unit && question.caveat);
    assert.ok(Number.isInteger(question.version) && question.version > 0);
  }
});

test('magnitude scoring rewards the right scale without requiring an exact number', () => {
  const question = { target: 15700000 };
  assert.equal(magnitudeFor(question.target), 7);
  assert.equal(scoreMagnitude(7, question), 100);
  assert.equal(scoreMagnitude(6, question), 50);
  assert.equal(scoreMagnitude(8, question), 50);
  assert.equal(scoreMagnitude(5, question), 0);
  assert.throws(() => scoreMagnitude(10, question));
});

test('an endless game records outcomes, keeps answers secret, and adds another question', async () => {
  const id = await createGame();
  let game = await readGame(id);
  assert.equal(game.stats.answered, 0);
  assert.deepEqual(game.stats, { answered: 0, on_target: 0, close: 0, miss: 0 });
  assert.ok(game.current.question.prompt);

  const first = game.current;
  const result = await submitMagnitude(id, first.position, 0);
  assert.equal(result.reveal.magnitude, 0);
  assert.ok(result.reveal.answer);
  assert.notEqual(result.game.current.position, first.position);
  assert.equal(result.game.stats.miss + result.game.stats.close + result.game.stats.on_target, 1);

  const second = result.game.current;
  const secondQuestion = questions.find((question) => question.id === second.question.id);
  const onTarget = await submitMagnitude(id, second.position, magnitudeFor(secondQuestion.target));
  assert.equal(onTarget.reveal.score, 100);
  assert.equal(onTarget.game.stats.on_target, 1);

  const third = onTarget.game.current;
  const thirdQuestion = questions.find((question) => question.id === third.question.id);
  const correctMagnitude = magnitudeFor(thirdQuestion.target);
  const closeMagnitude = correctMagnitude === 0 ? 1 : correctMagnitude - 1;
  const close = await submitMagnitude(id, third.position, closeMagnitude);
  assert.equal(close.reveal.score, 50);
  assert.equal(close.game.stats.close, 1);

  const beforeReplay = close.game.stats.answered;
  const replay = await submitMagnitude(id, third.position, closeMagnitude);
  assert.equal(replay.reveal, null);
  assert.equal(replay.game.stats.answered, beforeReplay);
  assert.notEqual(close.game.current.question.id, third.question.id);
  assert.equal(await readGame('invalid'), null);
});

test('seed is idempotent and foreign keys reject broken references', async () => {
  execFileSync(process.execPath, ['scripts/setup-wild-guess.mjs'], { env: process.env });
  assert.equal(Number((await database().query('SELECT COUNT(*) AS count FROM wg_questions'))[0].count), questions.length);
  await assert.rejects(database().query('INSERT INTO wg_rounds(session_id,position,question_id,question_version) VALUES($1,0,$2,1)', ['missing', 'missing']));
});

process.on('exit', () => rmSync(directory, { recursive: true, force: true }));
