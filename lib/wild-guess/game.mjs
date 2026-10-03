import { randomBytes, randomInt } from 'node:crypto';
import { database } from './database.mjs';

export const MAGNITUDE_OPTIONS = ['ones', 'tens', 'hundreds', 'thousands', 'tens of thousands', 'hundreds of thousands', 'millions', 'tens of millions', 'hundreds of millions', 'billions'];

export function magnitudeFor(value) { return Math.floor(Math.log10(value)); }

export function scoreMagnitude(magnitude, question) {
  if (!Number.isInteger(magnitude) || magnitude < 0 || magnitude >= MAGNITUDE_OPTIONS.length) throw new Error('Choose one of the available scales.');
  return Math.max(0, 100 - 50 * Math.abs(magnitude - magnitudeFor(question.target)));
}

const publicQuestion = (question) => ({ id: question.id, prompt: question.prompt, unit: question.unit, magnitudes: MAGNITUDE_OPTIONS });
const reveal = (row) => {
  const question = JSON.parse(row.content);
  return { position: Number(row.position), question: publicQuestion(question), magnitude: row.magnitude, score: row.score, answer: { target: question.target, low: question.low, high: question.high, caveat: question.caveat, sources: question.sources } };
};

async function appendRound(id) {
  const db = database();
  const [{ count }] = await db.query('SELECT COUNT(*) AS count FROM wg_questions WHERE active=1');
  if (Number(count) < 2) throw new Error('Not enough questions are available yet.');
  const previous = await db.query('SELECT question_id FROM wg_rounds WHERE session_id=$1 ORDER BY position DESC LIMIT 1', [id]);
  const exclude = previous[0]?.question_id || '';
  const [{ eligible }] = await db.query('SELECT COUNT(*) AS eligible FROM wg_questions WHERE active=1 AND id<>$1', [exclude]);
  const offset = randomInt(Number(eligible));
  const [question] = await db.query('SELECT id,version FROM wg_questions WHERE active=1 AND id<>$1 ORDER BY slot LIMIT 1 OFFSET $2', [exclude, offset]);
  const [{ next_position }] = await db.query('SELECT COALESCE(MAX(position),-1)+1 AS next_position FROM wg_rounds WHERE session_id=$1', [id]);
  await db.query('INSERT INTO wg_rounds(session_id,position,question_id,question_version) VALUES($1,$2,$3,$4)', [id, Number(next_position), question.id, question.version]);
}

export async function createGame() {
  const id = randomBytes(32).toString('hex');
  const now = Date.now();
  await database().query('INSERT INTO wg_sessions(id,created_at,expires_at) VALUES($1,$2,$3)', [id, now, now + 7 * 86400000]);
  await appendRound(id);
  return id;
}

export async function readGame(id) {
  if (!/^[a-f0-9]{64}$/.test(id || '')) return null;
  const db = database();
  const rows = await db.query('SELECT r.position,r.magnitude,r.score,q.content FROM wg_rounds r JOIN wg_sessions s ON s.id=r.session_id JOIN wg_questions q ON q.id=r.question_id AND q.version=r.question_version WHERE s.id=$1 AND s.expires_at>$2 AND r.magnitude IS NULL ORDER BY r.position LIMIT 1', [id, Date.now()]);
  if (!rows.length) return null;
  const [stats] = await db.query('SELECT COUNT(*) AS answered, COALESCE(SUM(CASE WHEN score=100 THEN 1 ELSE 0 END),0) AS on_target, COALESCE(SUM(CASE WHEN score=50 THEN 1 ELSE 0 END),0) AS close, COALESCE(SUM(CASE WHEN score=0 THEN 1 ELSE 0 END),0) AS miss FROM wg_rounds WHERE session_id=$1 AND magnitude IS NOT NULL', [id]);
  const [{ pending }] = await db.query('SELECT COUNT(*) AS pending FROM wg_rounds WHERE session_id=$1 AND magnitude IS NULL', [id]);
  return { current: { position: Number(rows[0].position), question: publicQuestion(JSON.parse(rows[0].content)) }, stats: Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, Number(value)])), pending: Number(pending) };
}

export async function submitMagnitude(id, position, magnitude) {
  if (!Number.isInteger(position) || position < 0) throw new Error('Choose a valid round.');
  const db = database();
  const rows = await db.query('SELECT q.content FROM wg_rounds r JOIN wg_questions q ON q.id=r.question_id AND q.version=r.question_version JOIN wg_sessions s ON s.id=r.session_id WHERE r.session_id=$1 AND r.position=$2 AND s.expires_at>$3', [id, position, Date.now()]);
  if (!rows.length) throw new Error('This game has expired. Start a new game.');
  const score = scoreMagnitude(magnitude, JSON.parse(rows[0].content));
  const updated = await db.query('UPDATE wg_rounds SET magnitude=$1,score=$2,answered_at=$3 WHERE session_id=$4 AND position=$5 AND magnitude IS NULL RETURNING position,magnitude,score', [magnitude, score, Date.now(), id, position]);
  if (!updated.length) return { game: await readGame(id), reveal: null };
  const answered = await db.query('SELECT r.position,r.magnitude,r.score,q.content FROM wg_rounds r JOIN wg_questions q ON q.id=r.question_id AND q.version=r.question_version WHERE r.session_id=$1 AND r.position=$2', [id, position]);
  await appendRound(id);
  return { game: await readGame(id), reveal: reveal(answered[0]) };
}
