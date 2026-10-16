import { writeFileSync } from 'node:fs';
import { comparisons } from '../lib/wild-guess/comparisons.mjs';
import { formatScale, winningSide } from '../lib/wild-guess/game.mjs';

const lines = [
  '# Balls in the Ballpark: 100 comparison proposals',
  '',
  'These are proposals for editorial review, grouped by measurement category. The stored figures are broad orders of magnitude, not precise answers. Every pair passes the catalog rule that its conservative magnitude ranges do not overlap.',
  '',
];

let number = 1;
for (const category of ['count', 'duration', 'weight', 'frequency']) {
  const categoryComparisons = comparisons.filter((comparison) => comparison.category === category);
  const winnerHeading = category === 'frequency' ? 'Shorter-gap proposal' : category === 'duration' ? 'Longer proposal' : category === 'weight' ? 'Heavier proposal' : 'More-numerous proposal';
  lines.push(`## ${category[0].toUpperCase()}${category.slice(1)} (${categoryComparisons.length})`, '', `| # | Option A | Option B | ${winnerHeading} | Reveal scale |`, '|---:|---|---|---|---|');
  for (const comparison of categoryComparisons) {
    const winner = winningSide(comparison) === 0 ? comparison.left : comparison.right;
    lines.push(`| ${number} | ${comparison.left.label} | ${comparison.right.label} | ${winner.label} | ${formatScale(winner, comparison.category)} |`);
    number += 1;
  }
  lines.push('');
}

writeFileSync(new URL('../docs/wild-guess-comparison-proposals.md', import.meta.url), `${lines.join('\n')}\n`);
console.log(`Wrote ${comparisons.length} comparison proposals.`);
