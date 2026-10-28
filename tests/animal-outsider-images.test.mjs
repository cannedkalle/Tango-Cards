import test from "node:test";
import assert from "node:assert/strict";
import { animals } from "../lib/animal-outsider/animals.mjs";
import { ANIMAL_OUTSIDER_IMAGES } from "../lib/animal-outsider/images.mjs";

/* The Outsider contract, same shape as the Twin/Bulb image tests: every
 * animal id has exactly one manifest entry — a licensed Commons photo, or
 * an explicit null where no fitting photo exists. A missing key is a gap,
 * an orphan key is a typo, and a rejected license (NC, ND, fair use) must
 * never ship. The allowlist extends Twin's with GFDL, a free Commons
 * license: the mosquito photo is GFDL 1.2-only per the Commons API, and
 * the manifest records the true license rather than swapping the photo.
 * Port suffixes (CC BY-SA 3.0 us, CC BY-SA 2.5 ca) pass on their prefix. */
const ALLOWED_LICENSE = /^(CC BY(-SA)?( \d\.\d)?|CC0|Public domain|GFDL( \d\.\d)?)/i;

/* No nulls at present: every animal has a photo. The list stays so a
 * future gap must be added here deliberately — a new null fails loudly
 * instead of slipping in. */
const KNOWN_NULLS = [];

test("every animal id has a manifest entry", () => {
  assert.equal(Object.keys(ANIMAL_OUTSIDER_IMAGES).length, animals.length);
  for (const animal of animals) {
    assert.ok(
      animal.id in ANIMAL_OUTSIDER_IMAGES,
      `missing image entry for ${animal.id}`,
    );
  }
});

test("every manifest key is a real animal id", () => {
  const ids = new Set(animals.map((animal) => animal.id));
  for (const key of Object.keys(ANIMAL_OUTSIDER_IMAGES)) {
    assert.ok(ids.has(key), `orphan image entry: ${key}`);
  }
});

test("every non-null entry is a licensed Commons image", () => {
  for (const [id, image] of Object.entries(ANIMAL_OUTSIDER_IMAGES)) {
    if (image === null) continue;
    assert.match(
      image.page,
      /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
      `${id}: file page`,
    );
    assert.match(
      image.thumb,
      /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/[^?]+\?width=\d+$/,
      `${id}: thumbnail URL`,
    );
    assert.ok(
      typeof image.author === "string" && image.author.length > 0,
      `${id}: author`,
    );
    assert.match(image.license, ALLOWED_LICENSE, `${id}: license`);
  }
});

test("null entries are exactly the known gaps", () => {
  const nulls = Object.entries(ANIMAL_OUTSIDER_IMAGES)
    .filter(([, image]) => image === null)
    .map(([id]) => id);
  assert.deepEqual(nulls, KNOWN_NULLS);
});
