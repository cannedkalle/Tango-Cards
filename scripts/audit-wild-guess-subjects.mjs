import { canonicalConceptKey, subjectCategories, subjects, validSubjectPairs } from '../lib/wild-guess/subjects.mjs';

const strict = process.argv.includes('--strict');
const keys = new Map();
const duplicates = [];
for (const subject of subjects) {
  const key = `${subject.category}:${canonicalConceptKey(subject.label)}`;
  if (keys.has(key)) duplicates.push([keys.get(key), subject.label]);
  keys.set(key, subject.label);
}

const opponentCounts = new Map(subjects.map((subject) => [subject.id, 0]));
for (const category of subjectCategories) {
  for (const [left, right] of validSubjectPairs(category)) {
    opponentCounts.set(left.id, opponentCounts.get(left.id) + 1);
    opponentCounts.set(right.id, opponentCounts.get(right.id) + 1);
  }
}

const unsourced = subjects.filter((subject) => !subject.sourceUrls?.length);
const stranded = subjects.filter((subject) => opponentCounts.get(subject.id) === 0);
const broad = subjects.filter((subject) => subject.highMagnitude - subject.lowMagnitude > 1);

console.log('Balls in the Ballpark subject audit');
for (const category of subjectCategories) {
  const categorySubjects = subjects.filter((subject) => subject.category === category);
  const sourced = categorySubjects.filter((subject) => subject.sourceUrls?.length).length;
  console.log(`${category}: ${categorySubjects.length} subjects, ${validSubjectPairs(category).length} matchups, ${sourced} source-linked`);
}
console.log(`total: ${subjects.length} subjects; ${unsourced.length} need source review; ${broad.length} span more than two magnitude buckets; ${stranded.length} have no opponent; ${duplicates.length} canonical duplicates`);

if (stranded.length) console.log(`no opponents: ${stranded.map((subject) => subject.label).join(' | ')}`);
if (broad.length) console.log(`broad ranges: ${broad.map((subject) => subject.label).join(' | ')}`);
if (duplicates.length) console.log(`duplicates: ${duplicates.map((pair) => pair.join(' <> ')).join(' | ')}`);

if (strict && (unsourced.length || broad.length || stranded.length || duplicates.length)) process.exitCode = 1;
