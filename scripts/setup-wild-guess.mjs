import { readFileSync } from 'node:fs';
import { database } from '../lib/wild-guess/database.mjs';
import { questions } from '../lib/wild-guess/questions.mjs';
import { comparisons } from '../lib/wild-guess/comparisons.mjs';
import { subjectCategories, subjects, validSubjectPairs } from '../lib/wild-guess/subjects.mjs';

const db = database();
const schema = readFileSync(new URL('../db/wild-guess/001-initial.sql', import.meta.url), 'utf8');
await db.batch(schema.split(';').map((statement) => statement.trim()).filter(Boolean).map((statement) => [statement]));
const comparisonSchema = readFileSync(new URL('../db/wild-guess/002-comparisons.sql', import.meta.url), 'utf8');
await db.batch(comparisonSchema.split(';').map((statement) => statement.trim()).filter(Boolean).map((statement) => [statement]));
const subjectSchema = readFileSync(new URL('../db/wild-guess/003-subject-pool.sql', import.meta.url), 'utf8');
await db.batch(subjectSchema.split(';').map((statement) => statement.trim()).filter(Boolean).map((statement) => [statement]));

// SQLite cannot widen a CHECK constraint in place. Preserve every subject
// version and matchup while adding new measurement categories to older DBs.
if (db.kind === 'sqlite') {
  const [{ sql: subjectTableSql }] = await db.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='wg_subjects'");
  if (!subjectTableSql.includes("'speed'") || !subjectTableSql.includes('sources_json')) {
    await db.query('PRAGMA foreign_keys=OFF');
    try {
      await db.batch([
        ["CREATE TABLE wg_subjects_rebuilt (id TEXT NOT NULL, version INTEGER NOT NULL CHECK(version > 0), slot INTEGER NOT NULL UNIQUE, category TEXT NOT NULL CHECK(category IN ('count','duration','weight','frequency','length','area','volume','speed')), label TEXT NOT NULL, emoji TEXT NOT NULL, magnitude INTEGER NOT NULL, low_magnitude INTEGER NOT NULL, high_magnitude INTEGER NOT NULL, scale_label TEXT, note TEXT NOT NULL, sources_json TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), PRIMARY KEY (id,version), CHECK(low_magnitude <= magnitude AND magnitude <= high_magnitude))"],
        ['INSERT INTO wg_subjects_rebuilt(id,version,slot,category,label,emoji,magnitude,low_magnitude,high_magnitude,scale_label,note,active) SELECT id,version,slot,category,label,emoji,magnitude,low_magnitude,high_magnitude,scale_label,note,active FROM wg_subjects'],
        ['DROP TABLE wg_subjects'],
        ['ALTER TABLE wg_subjects_rebuilt RENAME TO wg_subjects'],
        ['CREATE INDEX wg_subjects_pairing ON wg_subjects(active,category,low_magnitude,high_magnitude,id)'],
      ]);
    } finally {
      await db.query('PRAGMA foreign_keys=ON');
    }
  }
} else {
  const constraints = await db.query("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='wg_subjects'::regclass AND contype='c'");
  if (constraints.some((constraint) => constraint.definition.includes('category') && !constraint.definition.includes('speed'))) {
    await db.batch([
      ['ALTER TABLE wg_subjects DROP CONSTRAINT IF EXISTS wg_subjects_category_check'],
      ["ALTER TABLE wg_subjects ADD CONSTRAINT wg_subjects_category_check CHECK(category IN ('count','duration','weight','frequency','length','area','volume','speed'))"],
    ]);
  }
  await db.query("ALTER TABLE wg_subjects ADD COLUMN IF NOT EXISTS sources_json TEXT NOT NULL DEFAULT '[]'");
}

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

let comparisonsInserted = 0;
for (const [index, comparison] of comparisons.entries()) {
  const existing = await db.query('SELECT version FROM wg_comparisons WHERE id=$1 ORDER BY version DESC', [comparison.id]);
  if (existing.some((row) => Number(row.version) === comparison.version) || (existing[0] && Number(existing[0].version) > comparison.version)) continue;
  const [{ max_slot }] = await db.query('SELECT COALESCE(MAX(slot),0) AS max_slot FROM wg_comparisons');
  const statements = [];
  if (existing.length) statements.push(['UPDATE wg_comparisons SET active=0 WHERE id=$1 AND active=1', [comparison.id]]);
  statements.push(['INSERT INTO wg_comparisons(id,version,slot,category,active,content) VALUES($1,$2,$3,$4,1,$5)', [comparison.id, comparison.version, Math.max(index + 1, Number(max_slot) + 1), comparison.category, JSON.stringify(comparison)]]);
  await db.batch(statements);
  comparisonsInserted += 1;
}
const comparisonPlaceholders = comparisons.map((_, index) => `$${index + 1}`).join(',');
await db.query(`UPDATE wg_comparisons SET active=0 WHERE active=1 AND id NOT IN (${comparisonPlaceholders})`, comparisons.map((comparison) => comparison.id));

const subjectMatches = (row, subject) => row
  && row.category === subject.category
  && row.label === subject.label
  && row.emoji === subject.emoji
  && Number(row.magnitude) === subject.magnitude
  && Number(row.low_magnitude) === subject.lowMagnitude
  && Number(row.high_magnitude) === subject.highMagnitude
  && (row.scale_label || null) === (subject.scaleLabel || null)
  && row.note === subject.note
  && row.sources_json === JSON.stringify(subject.sourceUrls || []);

let subjectsInserted = 0;
let [{ max_slot: maxSubjectSlot }] = await db.query('SELECT COALESCE(MAX(slot),0) AS max_slot FROM wg_subjects');
for (const subject of subjects) {
  const [latest] = await db.query('SELECT * FROM wg_subjects WHERE id=$1 ORDER BY version DESC LIMIT 1', [subject.id]);
  if (subjectMatches(latest, subject)) {
    await db.query('UPDATE wg_subjects SET active=1 WHERE id=$1 AND version=$2', [subject.id, latest.version]);
    continue;
  }
  const version = latest ? Number(latest.version) + 1 : 1;
  maxSubjectSlot = Number(maxSubjectSlot) + 1;
  await db.batch([
    ['UPDATE wg_subjects SET active=0 WHERE id=$1 AND active=1', [subject.id]],
    ['INSERT INTO wg_subjects(id,version,slot,category,label,emoji,magnitude,low_magnitude,high_magnitude,scale_label,note,sources_json,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,1)', [subject.id, version, maxSubjectSlot, subject.category, subject.label, subject.emoji, subject.magnitude, subject.lowMagnitude, subject.highMagnitude, subject.scaleLabel || null, subject.note, JSON.stringify(subject.sourceUrls || [])]],
  ]);
  subjectsInserted += 1;
}
const subjectPlaceholders = subjects.map((_, index) => `$${index + 1}`).join(',');
await db.query(`UPDATE wg_subjects SET active=0 WHERE active=1 AND id NOT IN (${subjectPlaceholders})`, subjects.map((subject) => subject.id));
const matchupCount = subjectCategories.reduce((total, category) => total + validSubjectPairs(category).length, 0);
console.log(`Balls in the Ballpark: ${db.kind} schema ready; ${subjectsInserted} subject versions added, ${subjects.length} subjects make ${matchupCount} valid matchups.`);
