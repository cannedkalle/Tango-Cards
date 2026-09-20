# Before the Bulb

**Which came first?** A playable invention-history guessing game for kids and families.

## Play locally

From the Kids Play Portal Apps workspace:

```sh
npm run dev:before-the-bulb
```

Open [Before the Bulb](http://127.0.0.1:4175/apps/before-the-bulb/). Serve the workspace root so the shared Playform stylesheet resolves correctly.

## Included in this MVP

- Two large answer cards with separate “What's this?” definitions.
- One locked-in guess, encouraging feedback, both dates, and one sourced fun fact.
- Expandable source links and explanations of historical milestones.
- Session score, restart, randomized card order, and 426 shuffled comparisons with no repeats until the pool is exhausted.
- Responsive layouts, keyboard controls, focus management, and reduced-motion support.
- Bundled local content; no accounts, backend, LLM, or gameplay API calls.

The starter content contains **181 inventions, 426 curated comparisons, and 183 reference sources**. It is a playable core MVP, not the larger 100-object content release proposed in the brief. Facts may recur when an invention appears in another pairing. Progress resets when the page reloads. Once loaded, a session runs without the server; opening source links and reloading still require connectivity.

Content planning and future audits use [`docs/content-taxonomy.md`](docs/content-taxonomy.md), which checks domain coverage and separates ancient ancestors from recognizable modern forms.

## Files

- `index.html`, `styles.css`, `assets/`: game interface and local bulb mark.
- `src/game.mjs`: content validation, shuffle, scoring, and round state.
- `src/main.mjs`: content loading and accessible UI rendering.
- `data/objects.json`, `data/pairs.json`, `data/sources.json`: auditable content.
- `tests/game.test.mjs`: data integrity and game behavior tests.
- [MVP brief](docs/mvp-brief.md), [future ideas](docs/future-ideas.md), and [original summary](docs/original-chatgpt-summary.txt).

## Verify

```sh
npm run test:before-the-bulb
npm run verify
```

Tests cover all content references and chronology, ambiguous/duplicate pairs, 100 seeded games across three complete pools (127,800 answers), score accuracy, invalid and double answers, shuffled answer positions, cycle boundaries, reset, and single-pair behavior.

See [QA notes](docs/qa.md) for browser checks and editorial decisions. This app remains local WIP and is not published to the portal.
