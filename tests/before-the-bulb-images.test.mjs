import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BULB_IMAGES } from "../lib/before-the-bulb/images.mjs";

/* Same contract as the Twin Terms pilot: every invention id has exactly one
 * manifest entry — a licensed Commons image, or an explicit null where no
 * fitting photo exists (and, for Bulb, no image may show a legible year or
 * date — that check is editorial, done during sourcing, not here). */
const ALLOWED_LICENSE = /^(CC BY(-SA)?( \d\.\d)?|CC0|Public domain|Free Art License|SIL Open Font License)/i;

const base = JSON.parse(
  await readFile(new URL("../lib/before-the-bulb/objects.json", import.meta.url), "utf8"),
);
const expansion = JSON.parse(
  await readFile(new URL("../lib/before-the-bulb/expansion.json", import.meta.url), "utf8"),
);
const inventions = [...base, ...expansion.objects];

test("every invention id has a manifest entry", () => {
  assert.equal(Object.keys(BULB_IMAGES).length, inventions.length);
  for (const invention of inventions) {
    assert.ok(
      invention.id in BULB_IMAGES,
      `missing image entry for ${invention.id}`,
    );
  }
});

test("every manifest key is a real invention id", () => {
  const ids = new Set(inventions.map((invention) => invention.id));
  for (const key of Object.keys(BULB_IMAGES)) {
    assert.ok(ids.has(key), `orphan image entry: ${key}`);
  }
});

test("every non-null entry is a licensed Commons image", () => {
  for (const [id, image] of Object.entries(BULB_IMAGES)) {
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
