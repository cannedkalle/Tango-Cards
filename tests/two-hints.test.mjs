import test from "node:test";
import assert from "node:assert/strict";
import {
  PAIRS,
  RIVALS,
  dealOptions,
  dealPair,
  eligibleDistractors,
  pairById,
} from "../lib/two-hints/questions.mjs";

test("the pool holds 58 active pairs with unique ids, hint pairs, and answers", () => {
  assert.equal(PAIRS.length, 58);
  assert.equal(new Set(PAIRS.map((pair) => pair.id)).size, 58);
  assert.equal(
    new Set(PAIRS.map((pair) => [...pair.hints].sort().join("+"))).size,
    58,
  );
  assert.equal(new Set(PAIRS.map((pair) => pair.answer)).size, 58);
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

test("options hold the answer plus three distinct eligible distractors, never a rival", () => {
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
  assert.ok(PAIRS.some((pair) => pair.id === dealPair(all).id));
});
