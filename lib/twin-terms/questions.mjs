/* Twin Terms questions: generated, not listed.
 *
 * The database is domains.mjs (domains with vetted terms). This module
 * is the dealer: it matches terms into questions at load time. A pair
 * is dealt only when it passes both gates:
 * - exactly one domain claims both its terms (the rival-kill rule,
 *   enforced here mechanically: a pair two domains could claim is
 *   ambiguous by construction and never deals);
 * - it is not on PAIR_BLOCKLIST (for phrase pairs found in generated
 *   combinations, e.g. a pair that completes a fixed phrase).
 *
 * Each pair keeps the old shape ({ id, hints, answer, category, why })
 * so the game, its progress restore, and the give-up options work
 * unchanged. Pair ids are the two hints in domain order, which is why
 * saved games from the premade-pair era still restore: every one of
 * the 55 original pairs is generated here with its original id.
 *
 * The reveal line is composed from the two terms' glosses, so no pair
 * needs a prewritten explanation.
 *
 * Distractor rule for the give-up choices: the specific answer plus
 * three other specific answers, except the named rivals below — pairs
 * where another answer could be defended as correct (a game vs its
 * close cousin, wave vs light). Adjacent answers that are merely hard
 * are fair distractors, not rivals. */

import { DOMAINS, PAIR_BLOCKLIST } from "./domains.mjs";

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function blockKey(wordA, wordB) {
  return [wordA, wordB].sort().join("+");
}

/* Map each term to the domains that claim it, so a pair's claimants
 * can be counted without scanning every domain per pair. */
const domainsByTerm = new Map();
for (const domain of DOMAINS) {
  for (const term of domain.terms) {
    if (!domainsByTerm.has(term.word)) domainsByTerm.set(term.word, []);
    domainsByTerm.get(term.word).push(domain);
  }
}

function claimingDomains(wordA, wordB) {
  return (domainsByTerm.get(wordA) || []).filter((domain) =>
    domain.terms.some((term) => term.word === wordB),
  );
}

export const PAIRS = [];
for (const domain of DOMAINS) {
  for (let first = 0; first < domain.terms.length; first += 1) {
    for (let second = first + 1; second < domain.terms.length; second += 1) {
      const termA = domain.terms[first];
      const termB = domain.terms[second];
      if (PAIR_BLOCKLIST.has(blockKey(termA.word, termB.word))) continue;
      const claimants = claimingDomains(termA.word, termB.word);
      if (claimants.length !== 1 || claimants[0] !== domain) continue;
      PAIRS.push({
        id: `${termA.word}-${termB.word}`,
        hints: [termA.word, termB.word],
        answer: domain.answer,
        category: domain.category,
        why: `${cap(termA.word)} ${termA.gloss}, and ${termB.word} ${termB.gloss}.`,
      });
    }
  }
}

const byId = new Map(PAIRS.map((pair) => [pair.id, pair]));

/* Answers that could be defended as correct for another pair's hints.
 * Both directions are listed so the exclusion holds whichever side is
 * the question. */
export const RIVALS = {
  "Poker": ["Card games"],
  "Card games": ["Poker"],
  "Checkers": ["Chess tactics"],
  "Chess tactics": ["Checkers"],
  "Waves": ["Light"],
  "Light": ["Waves"],
  "Weather": ["Weather alerts"],
  "Weather alerts": ["Weather"],
  // Content fix 2026-10-28: defensible cousins found by the content
  // audit. Each pair is listed both ways (the symmetry test enforces
  // it): a give-up round must never offer an answer the player could
  // defend as correct for the hints.
  "Maps": ["Charts"],
  "Charts": ["Maps"],
  "Fractions": ["Moon phases"],
  "Moon phases": ["Fractions"],
  "Music accidentals": ["Music notation"],
  "Music notation": ["Music accidentals", "Music composition"],
  "Music composition": ["Music notation", "Songwriting"],
  "Songwriting": ["Music composition"],
  "Grammar": ["Conjugation"],
  "Conjugation": ["Grammar"],
};

export function pairById(id) {
  return byId.get(id) || null;
}

function shuffle(items) {
  const rest = [...items];
  for (let index = rest.length - 1; index > 0; index -= 1) {
    const pick = Math.floor(Math.random() * (index + 1));
    [rest[index], rest[pick]] = [rest[pick], rest[index]];
  }
  return rest;
}

/* Deal one pair the player has not just seen. The no-repeat preference
 * never shrinks the pool to nothing: when every pair was recently seen,
 * the full pool deals again. */
export function dealPair(avoidIds = []) {
  const avoid = new Set(avoidIds);
  const fresh = PAIRS.filter((pair) => !avoid.has(pair.id));
  const pool = fresh.length ? fresh : PAIRS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* The answers a pair may be confused with: every other answer except its
 * named rivals. Deduplicated: several pairs now share one answer, and a
 * give-up round must never offer the same distractor twice. */
export function eligibleDistractors(pair) {
  const rivals = new Set(RIVALS[pair.answer] || []);
  return [...new Set(PAIRS.filter(
    (candidate) => candidate.answer !== pair.answer && !rivals.has(candidate.answer),
  ).map((candidate) => candidate.answer))];
}

/* Four options for the give-up reveal: the answer plus three distinct
 * eligible distractors, shuffled so the answer is never in a fixed
 * position. */
export function dealOptions(pair) {
  const distractors = shuffle(eligibleDistractors(pair)).slice(0, 3);
  return shuffle([pair.answer, ...distractors]);
}
