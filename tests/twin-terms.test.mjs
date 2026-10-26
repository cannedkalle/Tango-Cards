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

test("the pool holds 56 active pairs with unique ids, hint pairs, and answers", () => {
  assert.equal(PAIRS.length, 56);
  assert.equal(new Set(PAIRS.map((pair) => pair.id)).size, 56);
  assert.equal(
    new Set(PAIRS.map((pair) => [...pair.hints].sort().join("+"))).size,
    56,
  );
  assert.equal(new Set(PAIRS.map((pair) => pair.answer)).size, 56);
  for (const pair of PAIRS) {
    assert.equal(pair.hints.length, 2);
    assert.ok(pair.hints.every((hint) => typeof hint === "string" && hint.length > 0));
    assert.ok(pair.answer.length > 0);
    assert.ok(pair.why.length > 0);
    assert.equal(pairById(pair.id), pair);
  }
  assert.equal(pairById("no-such-pair"), null);
});

test("no hint word is spent twice across the pool", () => {
  const words = PAIRS.flatMap((pair) => pair.hints);
  assert.equal(new Set(words).size, words.length);
});

test("six general categories cover every pair, none empty", () => {
  assert.equal(CATEGORIES.length, 6);
  assert.equal(new Set(CATEGORIES.map((category) => category.id)).size, 6);
  assert.equal(new Set(CATEGORIES.map((category) => category.name)).size, 6);
  const counts = new Map(CATEGORIES.map((category) => [category.id, 0]));
  for (const pair of PAIRS) {
    const category = categoryById(pair.category);
    assert.ok(category, `${pair.id}: unknown category ${pair.category}`);
    counts.set(pair.category, counts.get(pair.category) + 1);
  }
  for (const [id, count] of counts) {
    assert.ok(count > 0, `category ${id} has no pairs`);
  }
  assert.deepEqual(
    [...counts.entries()].sort(),
    [["arts", 9], ["games", 7], ["life", 6], ["math", 8], ["science", 15], ["society", 11]],
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
});

test("category blurbs name broad fields, never a detailed subject", () => {
  const answers = new Set(PAIRS.map((pair) => pair.answer.toLowerCase()));
  for (const category of CATEGORIES) {
    assert.ok(category.blurb.length > 0);
    const items = category.blurb.split(",").map((item) => item.trim());
    assert.ok(items.length >= 2 && items.length <= 5);
    for (const item of items) {
      assert.ok(!answers.has(item.toLowerCase()), `${category.id}: blurb item ${item} is a specific answer`);
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
