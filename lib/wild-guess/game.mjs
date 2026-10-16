import { randomBytes, randomInt } from 'node:crypto';
import { database } from './database.mjs';
import { subjectCategories } from './subjects.mjs';

const CATEGORY_PROMPTS = {
  count: 'Which are there more of?',
  duration: 'Which takes longer?',
  weight: 'Which weighs more?',
  frequency: 'Which has the shorter gap between events?',
  length: 'Which is longer?',
  area: 'Which covers more area?',
  volume: 'Which takes up more space?',
  speed: 'Which moves or grows faster?',
};
const SCALE_NAMES = ['one', 'tens', 'hundreds', 'thousands', 'tens of thousands', 'hundreds of thousands', 'millions', 'tens of millions', 'hundreds of millions', 'billions', 'tens of billions', 'hundreds of billions', 'trillions', 'tens of trillions', 'hundreds of trillions', 'quadrillions', 'tens of quadrillions', 'hundreds of quadrillions', 'quintillions', 'tens of quintillions', 'hundreds of quintillions', 'sextillions', 'tens of sextillions', 'hundreds of sextillions', 'septillions', 'tens of septillions', 'hundreds of septillions', 'octillions', 'tens of octillions', 'hundreds of octillions', 'nonillions'];

export function scaleName(magnitude) {
  return SCALE_NAMES[magnitude] || `10 to the power of ${magnitude}`;
}

const DURATION_SCALES = new Map([
  [3, 'minutes'],
  [4, 'hours'],
  [5, 'days'],
  [6, 'weeks'],
  [7, 'months'],
  [8, 'years'],
  [9, 'decades'],
  [10, 'centuries'],
  [11, 'thousands of years'],
  [12, 'tens of thousands of years'],
  [13, 'hundreds of thousands of years'],
  [14, 'millions of years'],
  [15, 'tens of millions of years'],
  [16, 'hundreds of millions of years'],
  [17, 'billions of years'],
]);

const FREQUENCY_SCALES = new Map([
  [-8, 'hundred-millionths per second'],
  [-7, 'ten-millionths per second'],
  [-6, 'millionths per second'],
  [-5, 'hundred-thousandths per second'],
  [-4, 'ten-thousandths per second'],
  [-3, 'thousandths per second'],
  [-2, 'hundredths per second'],
  [-1, 'tenths per second'],
  [0, 'a few per second'],
]);

const LENGTH_SCALES = new Map([
  [0, 'a few meters'],
  [1, 'tens of meters'],
  [2, 'hundreds of meters'],
  [3, 'kilometers'],
  [4, 'tens of kilometers'],
  [5, 'hundreds of kilometers'],
  [6, 'thousands of kilometers'],
  [7, 'tens of thousands of kilometers'],
  [8, 'hundreds of thousands of kilometers'],
  [9, 'millions of kilometers'],
  [10, 'tens of millions of kilometers'],
  [11, 'hundreds of millions of kilometers'],
  [12, 'billions of kilometers'],
]);

const AREA_SCALES = new Map([
  [0, 'a few square meters'],
  [1, 'tens of square meters'],
  [2, 'hundreds of square meters'],
  [3, 'thousands of square meters'],
  [4, 'tens of thousands of square meters'],
  [5, 'hundreds of thousands of square meters'],
  [6, 'a few square kilometers'],
  [7, 'tens of square kilometers'],
  [8, 'hundreds of square kilometers'],
  [9, 'thousands of square kilometers'],
  [10, 'tens of thousands of square kilometers'],
  [11, 'hundreds of thousands of square kilometers'],
  [12, 'millions of square kilometers'],
  [13, 'tens of millions of square kilometers'],
  [14, 'hundreds of millions of square kilometers'],
]);

const VOLUME_SCALES = new Map([
  [0, 'thousands of liters'],
  [1, 'tens of thousands of liters'],
  [3, 'millions of liters'],
  [6, 'billions of liters'],
  [8, 'hundreds of millions of cubic meters'],
  [9, 'about a cubic kilometer'],
  [11, 'hundreds of cubic kilometers'],
  [13, 'tens of thousands of cubic kilometers'],
  [18, 'billions of cubic kilometers'],
  [19, 'tens of billions of cubic kilometers'],
  [21, 'trillions of cubic kilometers'],
  [27, 'quadrillions of cubic kilometers'],
]);

const SPEED_SCALES = new Map([
  [-10, 'millimeters per year'],
  [-9, 'centimeters per year'],
  [-8, 'tens of centimeters per year'],
  [-7, 'meters per year'],
  [-6, 'centimeters per day'],
  [-5, 'tens of centimeters per day'],
  [-4, 'tens of meters per day'],
  [-3, 'hundreds of meters per day'],
  [-2, 'kilometers per day'],
  [-1, 'tens of kilometers per day'],
  [0, 'meters per second'],
  [1, 'tens of meters per second'],
]);

const rateRange = (label) => {
  const values = (label?.match(/\d[\d,]*(?:\.\d+)?/g) || []).map((value) => Number(value.replaceAll(',', '')));
  if (!values.length) return null;
  return { low: Math.min(...values), high: Math.max(...values) };
};

const intervalPhrase = (seconds) => {
  if (seconds < 2) return 'second';
  if (seconds < 30) return 'few seconds';
  if (seconds < 120) return 'minute or two';
  if (seconds < 3600) return 'few minutes';
  if (seconds < 10800) return 'few hours';
  if (seconds < 86400) return 'several hours';
  if (seconds < 172800) return 'day or two';
  if (seconds < 604800) return 'few days';
  if (seconds < 1209600) return 'week or two';
  if (seconds < 2592000) return 'few weeks';
  if (seconds < 7776000) return 'few months';
  if (seconds < 63072000) return 'several months';
  return 'few years';
};

const readableIntervalRange = (fastestSeconds, slowestSeconds) => {
  const max = slowestSeconds;
  const [divisor, unit] = max < 120 ? [1, 'second']
    : max < 7200 ? [60, 'minute']
      : max < 172800 ? [3600, 'hour']
        : max < 1209600 ? [86400, 'day']
          : max < 5184000 ? [604800, 'week']
            : max < 63072000 ? [2592000, 'month']
              : [31536000, 'year'];
  const rounded = (value) => {
    const converted = value / divisor;
    return converted < 10 ? Number(converted.toFixed(1)) : Math.round(converted);
  };
  const low = rounded(fastestSeconds);
  const high = rounded(slowestSeconds);
  if (low === high) return `about ${low} ${unit}${low === 1 ? '' : 's'}`;
  return `about ${low} to ${high} ${unit}s`;
};

export function formatScale(option, category) {
  if (category === 'frequency') {
    const rate = rateRange(option.scaleLabel);
    if (rate && rate.high < 1) return `one every ${intervalPhrase(1 / Math.sqrt(rate.low * rate.high))}`;
    return FREQUENCY_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} per second`;
  }
  if (category === 'length') return LENGTH_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of meters`;
  if (category === 'area') return AREA_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of square meters`;
  if (category === 'volume') return VOLUME_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of cubic meters`;
  if (category === 'speed') return SPEED_SCALES.get(option.magnitude) || option.scaleLabel;
  if (option.scaleLabel) return option.scaleLabel;
  if (category === 'weight') return `${scaleName(option.magnitude)} of kilograms`;
  if (category === 'duration') return DURATION_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of seconds`;
  return scaleName(option.magnitude);
}

export function formatRange(option, category) {
  if (category === 'frequency') {
    const rate = rateRange(option.scaleLabel);
    if (rate && rate.high < 1) return `It takes ${readableIntervalRange(1 / rate.high, 1 / rate.low)} for one to happen.`;
    return `A useful estimate is ${option.scaleLabel}.`;
  }
  if (['length', 'area', 'volume', 'speed'].includes(category) && option.scaleLabel) return `A useful estimate is ${option.scaleLabel}.`;
  if (option.magnitude >= 15 && category === 'weight') return `That is roughly a 1 followed by ${option.magnitude} zeros, measured in kilograms.`;
  if (option.magnitude >= 15 && category === 'count') return `That is roughly a 1 followed by ${option.magnitude} zeros.`;
  const low = formatScale({ magnitude: option.lowMagnitude }, category);
  const high = formatScale({ magnitude: option.highMagnitude }, category);
  if (low === high) return `A reasonable range stays around ${low}.`;
  return `Estimates range from ${low} to ${high}.`;
}

export function winningSide(comparison) {
  return comparison.left.magnitude > comparison.right.magnitude ? 0 : 1;
}

const publicComparison = (comparison) => ({
  id: comparison.id,
  prompt: comparison.prompt,
  sides: [comparison.left, comparison.right].map(({ label, emoji }) => ({ label, emoji })),
});

const revealRound = (row) => {
  const comparison = comparisonFromRow(row);
  const sides = [comparison.left, comparison.right].map((option) => ({
    label: option.label,
    emoji: option.emoji,
    scale: formatScale(option, comparison.category),
    scaleLead: 'Around',
    detail: formatRange(option, comparison.category),
  }));
  const correctChoice = winningSide(comparison);
  return { position: Number(row.position), prompt: comparison.prompt, sides, choice: Number(row.choice), correctChoice, correct: Boolean(row.correct) };
};

const subjectFromRow = (row, prefix) => ({
  id: row[`${prefix}_id`],
  label: row[`${prefix}_label`],
  emoji: row[`${prefix}_emoji`],
  magnitude: Number(row[`${prefix}_magnitude`]),
  lowMagnitude: Number(row[`${prefix}_low_magnitude`]),
  highMagnitude: Number(row[`${prefix}_high_magnitude`]),
  scaleLabel: row[`${prefix}_scale_label`] || null,
  note: row[`${prefix}_note`],
});

const comparisonFromRow = (row) => ({
  id: `${row.left_id}--${row.right_id}`,
  category: row.category,
  prompt: CATEGORY_PROMPTS[row.category],
  left: subjectFromRow(row, 'left'),
  right: subjectFromRow(row, 'right'),
});

const ROUND_SELECT = `SELECT r.position,r.choice,r.correct,
  l.category,
  l.id AS left_id,l.label AS left_label,l.emoji AS left_emoji,l.magnitude AS left_magnitude,l.low_magnitude AS left_low_magnitude,l.high_magnitude AS left_high_magnitude,l.scale_label AS left_scale_label,l.note AS left_note,
  rr.id AS right_id,rr.label AS right_label,rr.emoji AS right_emoji,rr.magnitude AS right_magnitude,rr.low_magnitude AS right_low_magnitude,rr.high_magnitude AS right_high_magnitude,rr.scale_label AS right_scale_label,rr.note AS right_note
  FROM wg_matchup_rounds r
  JOIN wg_subjects l ON l.id=r.left_subject_id AND l.version=r.left_subject_version
  JOIN wg_subjects rr ON rr.id=r.right_subject_id AND rr.version=r.right_subject_version`;

async function appendRound(id) {
  const db = database();
  const category = subjectCategories[randomInt(subjectCategories.length)];
  const pairing = `FROM wg_subjects l JOIN wg_subjects r ON l.category=r.category AND l.id<r.id
    AND (l.high_magnitude<r.low_magnitude OR r.high_magnitude<l.low_magnitude)
    WHERE l.active=1 AND r.active=1 AND l.category=$1`;
  const [{ eligible }] = await db.query(`SELECT COUNT(*) AS eligible ${pairing}`, [category]);
  if (Number(eligible) < 1) throw new Error('Not enough compatible subjects are available yet.');
  const [pair] = await db.query(`SELECT l.id AS left_id,l.version AS left_version,r.id AS right_id,r.version AS right_version ${pairing} ORDER BY l.slot,r.slot LIMIT 1 OFFSET $2`, [category, randomInt(Number(eligible))]);
  const [{ next_position }] = await db.query('SELECT COALESCE(MAX(position),-1)+1 AS next_position FROM wg_matchup_rounds WHERE session_id=$1', [id]);
  const flip = randomInt(2);
  const leftId = flip ? pair.right_id : pair.left_id;
  const leftVersion = flip ? pair.right_version : pair.left_version;
  const rightId = flip ? pair.left_id : pair.right_id;
  const rightVersion = flip ? pair.left_version : pair.right_version;
  await db.query('INSERT INTO wg_matchup_rounds(session_id,position,left_subject_id,left_subject_version,right_subject_id,right_subject_version) VALUES($1,$2,$3,$4,$5,$6)', [id, Number(next_position), leftId, leftVersion, rightId, rightVersion]);
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
  const rows = await db.query(`${ROUND_SELECT} JOIN wg_sessions s ON s.id=r.session_id WHERE s.id=$1 AND s.expires_at>$2 AND r.choice IS NULL ORDER BY r.position LIMIT 1`, [id, Date.now()]);
  if (!rows.length) return null;
  const [stats] = await db.query('SELECT COUNT(*) AS played, COALESCE(SUM(correct),0) AS correct FROM wg_matchup_rounds WHERE session_id=$1 AND choice IS NOT NULL', [id]);
  const [{ pending }] = await db.query('SELECT COUNT(*) AS pending FROM wg_matchup_rounds WHERE session_id=$1 AND choice IS NULL', [id]);
  const comparison = comparisonFromRow(rows[0]);
  return {
    current: { position: Number(rows[0].position), comparison: publicComparison(comparison) },
    stats: { played: Number(stats.played), correct: Number(stats.correct) },
    pending: Number(pending),
  };
}

export async function submitChoice(id, position, choice) {
  if (!Number.isInteger(position) || position < 0 || ![0, 1].includes(choice)) throw new Error('Choose one of the two answers.');
  const db = database();
  const rows = await db.query(`${ROUND_SELECT} JOIN wg_sessions s ON s.id=r.session_id WHERE r.session_id=$1 AND r.position=$2 AND s.expires_at>$3`, [id, position, Date.now()]);
  if (!rows.length) throw new Error('This game has expired. Start a new game.');
  const comparison = comparisonFromRow(rows[0]);
  const correctChoice = winningSide(comparison);
  const correct = Number(choice === correctChoice);
  const updated = await db.query('UPDATE wg_matchup_rounds SET choice=$1,correct=$2,answered_at=$3 WHERE session_id=$4 AND position=$5 AND choice IS NULL RETURNING position', [choice, correct, Date.now(), id, position]);
  if (!updated.length) return { game: await readGame(id), reveal: null };
  const [answered] = await db.query(`${ROUND_SELECT} WHERE r.session_id=$1 AND r.position=$2`, [id, position]);
  await appendRound(id);
  return { game: await readGame(id), reveal: revealRound(answered) };
}
