# App structure — one layout for every game

Purpose: anyone opening the repo should find any game's code in the same
places, and adding a game should mean following one pattern. This document
is the contract for the restructure that retires the iframe games.

## Canonical layout for a game with id `<id>`

```
app/<id>/page.jsx        Route. Thin: metadata + render <Game />.
app/<id>/Game.jsx        The game. Client component, default export.
app/<id>/*.css           The game's own styles, imported by page.jsx.
lib/<id>/               Game logic and data. Pure modules + JSON only.
tests/<id>.test.mjs     Logic tests, wired in package.json and CI.
```

Rules:

- `page.jsx` is thin. Metadata comes from the registry (`getAppById` +
  `pageTitle`, the name-quest pattern). Exception: wild-guess keeps its
  custom description directly in `page.jsx` — it is better copy than the
  generic registry line, and replacing it would lose it. Everything
  visible — nav, header, board, controls — lives in `Game.jsx`.
- `Game.jsx` owns its state and progress. Browser storage (localStorage)
  for progress, the wild-guess pattern. No server route per game, no fetch
  to a game API, unless the game genuinely needs a server (none does now).
- `lib/<id>/` modules imported by `Game.jsx` must be browser-safe: no
  `node:` imports, no `process.env`, no database access. Server-only code
  (if any) stays in the same `lib/<id>/` dir but is never imported by
  `Game.jsx` — the wild-guess precedent (`client-game.mjs` + `format.mjs`
  pure; `database.mjs` + `game.mjs` server-only).
- Game lib modules use `.mjs`. The repo has no `"type": "module"`, so
  `.js` files with import/export only work in the bundler, not under
  plain node tests. Repo-root `data/` stays where it is — the build
  scripts (`build-manifest`, `build-prompts`) read and write it.
- Game data files move unchanged in content. JSON imports directly from
  `lib/<id>/` (no fetch-before-first-question, no separate data route), so
  the game works offline once installed.
- Game CSS lives in `app/<id>/` and is scoped under the game's root class
  so it cannot leak into other games or the portal shell.
- No iframes, no `public/apps/`, no cross-frame messaging. The old
  standalone sources under `apps/` are deleted, not kept as fallback
  (git history keeps them).

## Shared, not per-game

- `app/components/` — components used by two or more games only
  (`PortalNav`, `Topbar`, `HomeSeriesGrid`, `RegisterServiceWorker`).
  A component used by one game lives with that game.
- `lib/apps.js` — the registry. Every entry has `ownership: "portal"` and
  no `publicPath`. Its API (`getAppById`, `APP_NAMES`) does not change.
- `lib/names.js`, `public/design-system/` — portal-wide naming and art.

## The one documented exception: Tango Cards

Tango is a multi-route game, so it keeps its sub-routes `app/[series]/`
and `app/packs/` exactly where they are — moving them would change public
URLs. Everything else follows the pattern: its lib files move to
`lib/tango-cards/` (`cards.js`, `packs.js`, `pack-state.js`,
`rarities.js`), and its single-game clients move to `app/tango-cards/`
(`GalleryClient`, `PacksClient`). Importers update their paths; no
behavior changes.

## Build, test, and PWA wiring

- `package.json`: `apps:import` is gone from `dev` and `build`;
  `scripts/import-apps.js` is deleted.
- Tests live in `tests/<id>.test.mjs` and are wired in `package.json`
  and `.github/workflows/ci.yml`.
- `public/sw.js`: no `/apps/` precache entries, no `/apps/` fetch
  branches, and the version bumps (`wkp-v1` → `wkp-v2`) so installed
  apps pick up the new worker.

## Rewrite rules (behavior preservation)

- Same game, same rules, same data, same visible copy. No new features,
  no balance changes, no URL changes. If the old game had a quirk players
  see, keep it and note it; do not silently "fix" it.
- If a standalone game reads anything from its `app.config.json`, carry
  that behavior over in the React version (or note why it is obsolete).
- After the rewrite, the game must build, pass its tests, and be playable
  from its route with no console errors and no network request to a game
  API or to `/apps/`.

## Principles (the standards every game follows)

These are the current rules, audited across all six games on 2026-10-25.
New work follows them; old deviations get fixed when touched.

- Browser-first. A game plays with no server dependency. Any server
  feature must be optional and degrade silently: the Tango Cards stats
  fetches are the precedent — they check `data?.configured`, swallow
  failures, and the game plays normally without them. No game may fail
  or hang because an optional API is unconfigured.
- Data bundled, not fetched. Game data ships with the game as a static
  import. Nothing is fetched before first play.
- One test file per game in `tests/`, wired in `package.json` and CI.
- Metadata on every route, via the registry pattern. No route without
  a title and description.
- `'use client'` only on interactive components. Pages stay server
  components.
- Game CSS colocated in `app/<id>/`, scoped under the game's root
  class. `globals.css` holds only the portal shell and rules genuinely
  shared by two or more games. Legacy exception: Tango Cards and Name
  Quest styles still live in `globals.css` — their rules share selectors
  across games and sub-routes, so splitting them blind risks silent visual
  regressions; they move only with a visual check. A class used by exactly
  one game lives with that game everywhere else.
- Registry honesty. Every entry carries the same fields, and `status`
  reflects reality: `published` once the game is live and verified.
