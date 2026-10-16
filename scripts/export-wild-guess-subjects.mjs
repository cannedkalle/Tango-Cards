import { writeFileSync } from 'node:fs';
import { formatRange, formatScale } from '../lib/wild-guess/game.mjs';
import { subjectCategories, subjects, validSubjectPairs } from '../lib/wild-guess/subjects.mjs';

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const opponentCounts = new Map();
for (const category of subjectCategories) {
  for (const [left, right] of validSubjectPairs(category)) {
    opponentCounts.set(left.id, (opponentCounts.get(left.id) || 0) + 1);
    opponentCounts.set(right.id, (opponentCounts.get(right.id) || 0) + 1);
  }
}

const headings = ['id', 'category', 'label', 'emoji', 'order_of_magnitude', 'range_explanation', 'low_magnitude', 'high_magnitude', 'valid_opponents', 'editorial_note', 'source_urls', 'evidence_status'];
const lines = [headings.map(csv).join(',')];
for (const subject of subjects) {
  lines.push([
    subject.id,
    subject.category,
    subject.label,
    subject.emoji,
    formatScale(subject, subject.category),
    formatRange(subject, subject.category),
    subject.lowMagnitude,
    subject.highMagnitude,
    opponentCounts.get(subject.id) || 0,
    subject.note,
    (subject.sourceUrls || []).join(' | '),
    subject.sourceUrls?.length ? 'source-linked' : 'needs-source-review',
  ].map(csv).join(','));
}

writeFileSync(new URL('../docs/wild-guess-subject-database.csv', import.meta.url), `${lines.join('\n')}\n`);
console.log(`Wrote ${subjects.length} subjects and their valid-opponent counts.`);
