import test from "node:test";
import assert from "node:assert/strict";
import { DOMAINS } from "../lib/twin-terms/domains.mjs";
import { TWIN_TERM_IMAGES } from "../lib/twin-terms/images.mjs";

/* The pilot's contract: every domain answer has exactly one manifest entry —
 * a licensed Commons image, or an explicit null where no fitting photo
 * exists. A missing key is a gap, an orphan key is a typo, and a rejected
 * license (NC, ND, fair use) must never ship. */
const ALLOWED_LICENSE = /^(CC BY(-SA)?( \d\.\d)?|CC0|Public domain)/i;

test("every domain answer has a manifest entry", () => {
  assert.equal(Object.keys(TWIN_TERM_IMAGES).length, DOMAINS.length);
  for (const domain of DOMAINS) {
    assert.ok(
      domain.answer in TWIN_TERM_IMAGES,
      `missing image entry for ${domain.answer}`,
    );
  }
});

test("every manifest key is a real domain answer", () => {
  const answers = new Set(DOMAINS.map((domain) => domain.answer));
  for (const key of Object.keys(TWIN_TERM_IMAGES)) {
    assert.ok(answers.has(key), `orphan image entry: ${key}`);
  }
});

test("every non-null entry is a licensed Commons image", () => {
  for (const [answer, image] of Object.entries(TWIN_TERM_IMAGES)) {
    if (image === null) continue;
    assert.match(
      image.page,
      /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
      `${answer}: file page`,
    );
    assert.match(
      image.thumb,
      /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/[^?]+\?width=\d+$/,
      `${answer}: thumbnail URL`,
    );
    assert.ok(
      typeof image.author === "string" && image.author.length > 0,
      `${answer}: author`,
    );
    assert.match(image.license, ALLOWED_LICENSE, `${answer}: license`);
  }
});
