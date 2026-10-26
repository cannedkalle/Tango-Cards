/* Whimsical Kids Portal service worker.
 *
 * Strategy, in one line: pages and game data are network-first so updates
 * always flow through, while app files (scripts, styles, images) are cached on first visit so installed play works offline.
 * Bump VERSION to force every installed copy onto a fresh cache. */

const VERSION = "wkp-v2";
const CORE_CACHE = `wkp-core-${VERSION}`;
const RUNTIME_CACHE = `wkp-runtime-${VERSION}`;

/* Precached on install: the portal shell, the manifest and icons.
 * Everything else is cached on first visit. */
const CORE = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

const RUNTIME_MAX_ENTRIES = 250;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) =>
        Promise.allSettled(CORE.map((url) => cache.add(url))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CORE_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

/* Versioned app files and media. Safe to cache-first: Next.js chunks are
 * content-hashed, and game art changes ship with a VERSION bump. */
function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/design-system/") ||
    pathname.startsWith("/lab-art/") ||
    /\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/.test(pathname)
  );
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await Promise.all(
      keys
        .slice(0, keys.length - maxEntries)
        .map((key) => cache.delete(key)),
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
    trimCache(cache, RUNTIME_MAX_ENTRIES);
  }
  return response;
}

async function networkFirst(request, fallback) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallback) return fallback();
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;
  const pathname = url.pathname;

  if (pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, null));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, async () => {
        const core = await caches.open(CORE_CACHE);
        return (await core.match("/")) || Response.error();
      }),
    );
    return;
  }

  if (isStaticAsset(pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request, null));
});
