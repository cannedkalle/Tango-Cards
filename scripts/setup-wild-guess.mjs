import { readFileSync } from 'node:fs';
import { database } from '../lib/wild-guess/database.mjs';
import { questions } from '../lib/wild-guess/questions.mjs';

const db = database();
const schema = readFileSync(new URL('../db/wild-guess/001-initial.sql', import.meta.url), 'utf8');
await db.batch(schema.split(';').map((statement) => statement.trim()).filter(Boolean).map((statement) => [statement]));

// Preserve local games while moving the MVP from five preassigned questions to
// an endless stream. The original `guess` column also rejected the "ones"
// scale, so it becomes the bounded `magnitude` value here.
const columns = db.kind === 'sqlite'
  ? await db.query('PRAGMA table_info(wg_rounds)')
  : await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'wg_rounds'");
const hasGuess = columns.some((column) => (column.name || column.column_name) === 'guess');
if (db.kind === 'sqlite') {
  const [{ sql }] = await db.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='wg_rounds'");
  if (hasGuess || sql.includes('BETWEEN 0 AND 4') || sql.includes('UNIQUE(session_id, question_id)')) {
    await db.batch([
      ['CREATE TABLE wg_rounds_rebuilt (session_id TEXT NOT NULL REFERENCES wg_sessions(id) ON DELETE CASCADE, position INTEGER NOT NULL CHECK(position >= 0), question_id TEXT NOT NULL, question_version INTEGER NOT NULL, magnitude INTEGER CHECK(magnitude BETWEEN 0 AND 9), score INTEGER CHECK(score BETWEEN 0 AND 100), answered_at BIGINT, PRIMARY KEY (session_id, position), FOREIGN KEY (question_id, question_version) REFERENCES wg_questions(id, version), CHECK ((magnitude IS NULL AND score IS NULL AND answered_at IS NULL) OR (magnitude IS NOT NULL AND score IS NOT NULL AND answered_at IS NOT NULL)))'],
      [`INSERT INTO wg_rounds_rebuilt(session_id,position,question_id,question_version,magnitude,score,answered_at) SELECT session_id,position,question_id,question_version,${hasGuess ? 'CAST(guess AS INTEGER)' : 'magnitude'},score,answered_at FROM wg_rounds`],
      ['DROP TABLE wg_rounds'],
      ['ALTER TABLE wg_rounds_rebuilt RENAME TO wg_rounds'],
    ]);
  }
} else {
  if (hasGuess) {
    await db.batch([
      ['ALTER TABLE wg_rounds RENAME COLUMN guess TO magnitude'],
      ['ALTER TABLE wg_rounds DROP CONSTRAINT IF EXISTS wg_rounds_guess_check'],
      ['ALTER TABLE wg_rounds ADD CONSTRAINT wg_rounds_magnitude_check CHECK(magnitude BETWEEN 0 AND 9)'],
    ]);
  }
  await db.batch([
    ['ALTER TABLE wg_rounds DROP CONSTRAINT IF EXISTS wg_rounds_position_check'],
    ['ALTER TABLE wg_rounds DROP CONSTRAINT IF EXISTS wg_rounds_session_id_question_id_key'],
    ['ALTER TABLE wg_rounds ADD CONSTRAINT wg_rounds_position_check CHECK(position >= 0)'],
  ]);
}

let inserted = 0;
for (const question of questions) {
  const existing = await db.query('SELECT version,slot FROM wg_questions WHERE id=$1 ORDER BY version DESC', [question.id]);
  if (existing.some((row) => Number(row.version) === question.version) || (existing[0] && Number(existing[0].version) > question.version)) continue;
  const [{ max_slot }] = await db.query('SELECT COALESCE(MAX(slot),0) AS max_slot FROM wg_questions');
  // Slots are immutable ordering keys. Always append so adding a new catalog
  // item cannot collide with an older catalog that used different ordering.
  const slot = Number(max_slot) + 1;
  const statements = [];
  if (existing.length) statements.push(['UPDATE wg_questions SET active=0 WHERE id=$1 AND active=1', [question.id]]);
  statements.push(['INSERT INTO wg_questions(id,version,slot,active,content) VALUES($1,$2,$3,1,$4)', [question.id, question.version, slot, JSON.stringify(question)]]);
  await db.batch(statements);
  inserted += 1;
}
// Retire removed prompts from selection. Their versions stay stored so any
// retained session still resolves to the exact question it was assigned.
const catalogPlaceholders = questions.map((_, index) => `$${index + 1}`).join(',');
await db.query(`UPDATE wg_questions SET active=0 WHERE active=1 AND id NOT IN (${catalogPlaceholders})`, questions.map((question) => question.id));
console.log(`Balls in the Ballpark: ${db.kind} schema ready; ${inserted} question versions added, ${questions.length} catalog versions checked.`);
