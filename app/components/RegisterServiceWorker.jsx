"use client";

import { useEffect } from "react";

/* Registers the portal service worker (offline play + installability).
 * Production only: in development the worker would cache work-in-progress
 * files and make local edits look stale. Failures are silent by design:
 * the site works exactly as before without a service worker. */
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
