import test from "node:test";
import assert from "node:assert/strict";
import {
  PAIRS,
  RIVALS,
  dealOptions,
  dealPair,
  eligibleDistractors,
  pairById,
} from "../lib/twin-terms/questions.mjs";
import { CATEGORIES, categoryById } from "../lib/twin-terms/categories.mjs";
import { DOMAINS, PAIR_BLOCKLIST } from "../lib/twin-terms/domains.mjs";

/* The 56 premade pairs from the pool era. Every one must still deal
 * with its original id, so saved games restore after the restructure. */
const ORIGINAL_PAIR_IDS = [
  "times-product", "diamond-mound", "corner-degree", "crust-mantle",
  "mirror-fold", "reed-keys", "foil-lunge", "pedal-hammer", "bar-pie",
  "fault-plate", "mass-volume", "subject-object", "fork-pin", "bluff-raise",
  "trump-trick", "seed-bracket", "legend-scale", "bull-bear",
  "interest-principal", "front-pressure", "school-pod", "bug-patch",
  "virus-worm", "resume-cover", "plot-setting", "half-quarter",
  "rare-medium", "lead-follow", "base-power", "derivative-integral",
  "slope-intercept", "precision-accuracy", "pole-field", "crest-trough",
  "wave-particle", "element-compound", "order-family", "carrier-trait",
  "beat-scoop", "person-number", "stress-meter", "hook-bridge",
  "score-arrangement", "dress-tech", "trailer-teaser",
  "reference-circulation", "court-appeal", "balance-statement",
  "audit-return", "charge-plea", "stock-reduce", "crown-king",
  "prune-graft", "prime-coat", "stud-beam", "shot-booster",
];

test("85 domains with three terms each generate 247 pairs (8 blocked)", () => {
  assert.equal(DOMAINS.length, 85);
  assert.equal(DOMAINS.reduce((sum, domain) => sum + domain.terms.length, 0), 255);
  assert.equal(PAIRS.length, 247);
  assert.equal(new Set(PAIRS.map((pair) => pair.id)).size, 247);
  assert.equal(
    new Set(PAIRS.map((pair) => [...pair.hints].sort().join("+"))).size,
    247,
  );
  assert.equal(new Set(PAIRS.map((pair) => pair.answer)).size, 85);
  for (const pair of PAIRS) {
    assert.equal(pair.hints.length, 2);
    assert.ok(pair.hints.every((hint) => typeof hint === "string" && hint.length > 0));
    assert.ok(pair.answer.length > 0);
    assert.ok(pair.why.length > 0);
    assert.equal(pairById(pair.id), pair);
  }
  assert.equal(pairById("no-such-pair"), null);
});

test("no term repeats within a domain, and every domain keeps its answer", () => {
  assert.equal(new Set(DOMAINS.map((domain) => domain.id)).size, 85);
  assert.equal(new Set(DOMAINS.map((domain) => domain.answer)).size, 85);
  for (const domain of DOMAINS) {
    const words = domain.terms.map((term) => term.word);
    assert.equal(new Set(words).size, words.length);
    assert.ok(words.every((word) => word.length > 0));
    assert.ok(domain.terms.every((term) => term.gloss.length > 0));
    assert.ok(categoryById(domain.category), `${domain.id}: unknown category`);
  }
});

test("every generated pair has exactly one claiming domain and avoids the blocklist", () => {
  for (const pair of PAIRS) {
    const claimants = DOMAINS.filter((domain) =>
      pair.hints.every((hint) => domain.terms.some((term) => term.word === hint)),
    );
    assert.equal(claimants.length, 1, `${pair.id}: ${claimants.length} claiming domains`);
    assert.equal(claimants[0].answer, pair.answer);
    assert.equal(claimants[0].category, pair.category);
    assert.ok(!PAIR_BLOCKLIST.has([...pair.hints].sort().join("+")));
  }
});

test("all 56 original pairs still deal under their original ids", () => {
  assert.equal(ORIGINAL_PAIR_IDS.length, 56);
  for (const id of ORIGINAL_PAIR_IDS) {
    assert.ok(pairById(id), `original pair ${id} no longer deals`);
  }
});

test("six general categories cover every domain and pair, none empty", () => {
  assert.equal(CATEGORIES.length, 6);
  assert.equal(new Set(CATEGORIES.map((category) => category.id)).size, 6);
  assert.equal(new Set(CATEGORIES.map((category) => category.name)).size, 6);
  const domainCounts = new Map(CATEGORIES.map((category) => [category.id, 0]));
  const pairCounts = new Map(CATEGORIES.map((category) => [category.id, 0]));
  for (const domain of DOMAINS) {
    domainCounts.set(domain.category, domainCounts.get(domain.category) + 1);
  }
  for (const pair of PAIRS) {
    const category = categoryById(pair.category);
    assert.ok(category, `${pair.id}: unknown category ${pair.category}`);
    pairCounts.set(pair.category, pairCounts.get(pair.category) + 1);
  }
  assert.deepEqual(
    [...domainCounts.entries()].sort(),
    [["arts", 18], ["games", 10], ["life", 11], ["math", 10], ["science", 24], ["society", 12]],
  );
  assert.deepEqual(
    [...pairCounts.entries()].sort(),
    [["arts", 52], ["games", 30], ["life", 32], ["math", 29], ["science", 71], ["society", 33]],
  );
  assert.equal(categoryById("no-such-category"), null);
});

test("spot-check the category mapping", () => {
  assert.equal(pairById("fork-pin").category, "games");
  assert.equal(pairById("diamond-mound").category, "games");
  assert.equal(pairById("slope-intercept").category, "math");
  assert.equal(pairById("crust-mantle").category, "science");
  assert.equal(pairById("legend-scale").category, "life");
  assert.equal(pairById("court-appeal").category, "society");
  assert.equal(pairById("hook-bridge").category, "arts");
  assert.equal(pairById("prune-graft").category, "life");
  assert.equal(pairById("person-number").category, "arts");
  assert.equal(pairById("audit-return").category, "life");
  assert.equal(pairById("subject-object").category, "arts");
  assert.equal(pairById("eye-surge").category, "science");
  assert.equal(pairById("agenda-minutes").category, "society");
  assert.equal(pairById("manuscript-imprint").category, "arts");
  assert.equal(pairById("shower-vows").category, "life");
  assert.equal(pairById("track-conductor").category, "life");
  assert.equal(pairById("track-signal").category, "life");
  assert.equal(pairById("mark-blocking").category, "arts");
});

test("category blurbs are distinct phrases that name no detailed subject", () => {
  const answers = PAIRS.map((pair) => pair.answer.toLowerCase());
  const blurbs = CATEGORIES.map((category) => category.blurb.toLowerCase());
  assert.equal(new Set(blurbs).size, 6);
  for (const category of CATEGORIES) {
    assert.ok(category.blurb.length > 0);
    for (const answer of answers) {
      assert.ok(
        !category.blurb.toLowerCase().includes(answer),
        `${category.id}: blurb names ${answer}`,
      );
    }
  }
});

test("rival exclusions are symmetric", () => {
  for (const [answer, rivals] of Object.entries(RIVALS)) {
    for (const rival of rivals) {
      assert.ok(
        (RIVALS[rival] || []).includes(answer),
        `${rival} should list ${answer} back`,
      );
    }
  }
});

test("give-up options hold the answer plus three distinct eligible distractors, never a rival", () => {
  for (const pair of PAIRS) {
    const eligible = eligibleDistractors(pair);
    assert.ok(!eligible.includes(pair.answer));
    assert.equal(new Set(eligible).size, eligible.length);
    for (const rival of RIVALS[pair.answer] || []) {
      assert.ok(!eligible.includes(rival));
    }
    for (let trial = 0; trial < 20; trial += 1) {
      const options = dealOptions(pair);
      assert.equal(options.length, 4);
      assert.equal(new Set(options).size, 4);
      assert.ok(options.includes(pair.answer));
      for (const option of options) {
        if (option !== pair.answer) assert.ok(eligible.includes(option));
      }
    }
  }
});

test("dealing avoids recent pairs and falls back to the full pool", () => {
  const allButOne = PAIRS.slice(0, -1).map((pair) => pair.id);
  assert.equal(dealPair(allButOne).id, PAIRS.at(-1).id);
  const all = PAIRS.map((pair) => pair.id);
  const dealt = dealPair(all);
  assert.ok(PAIRS.includes(dealt));
});
