/* Fire-and-forget image cache warming.
 *
 * Call with the thumbnail URLs the next screen will need — the reveal photo
 * right after dealing a question, or the next round's option photos while the
 * current round is being answered. By the time those <img> tags render, the
 * bytes are already in the browser cache, so only the first question of a
 * session ever shows image-loading latency.
 *
 * Safe to call anywhere: the Image constructor only exists in browsers, so
 * this is a no-op under node (tests). Falsy entries are skipped. */
/* Retained so a just-preloaded image is not garbage-collected (and its
 * decoded bytes dropped) before the reveal shows it. Capped: only the
 * current and upcoming rounds matter. */
const live = [];
export function preloadImages(urls) {
  if (typeof Image === "undefined") return;
  for (const url of urls || []) {
    if (!url) continue;
    const img = new Image();
    img.src = url;
    live.push(img);
    while (live.length > 20) live.shift();
  }
}
