import test from "node:test";
import assert from "node:assert/strict";
import { preloadImages } from "../lib/preload-images.mjs";

test("preloadImages is a no-op under node (no Image constructor)", () => {
  assert.equal(typeof Image, "undefined");
  assert.doesNotThrow(() => preloadImages(["https://example.com/a.jpg", null, undefined, ""]));
  assert.doesNotThrow(() => preloadImages([]));
  assert.doesNotThrow(() => preloadImages(null));
  assert.doesNotThrow(() => preloadImages(undefined));
});
