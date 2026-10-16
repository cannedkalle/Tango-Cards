# Balls in the Ballpark: comparison database and MVP

## Product decision

The player sees two possibilities and picks which is bigger. There is no typing, arithmetic, or magnitude vocabulary before the choice. Each reveal says “Around,” shows the order of magnitude prominently, and follows it with one short sentence describing a reasonable range. Play continues as an endless random stream and records only choices and whether they were correct.

The curated runtime database contains 94 reusable subjects across count, duration, weight, frequency, length, area, volume, and speed. The game can generate 581 valid matchups by pairing any two subjects in the same category whose conservative ranges do not overlap. The smaller pool is intentional: a strict independent review retired ambiguous, repetitive, arithmetic-like, and trivia-like records. See the [subject database](wild-guess-subject-database.csv), the [editorial pipeline](wild-guess-editorial-pipeline.md), and the [original numbered proposal sheet](wild-guess-comparison-proposals.md).

### Editorial bar

Every comparison must meet all of these rules before publication:

- A child can picture both sides without specialist knowledge.
- The wording is natural and contains no conversion exercise or unnecessary conditions.
- Both sides have independently defensible order-of-magnitude ranges.
- Conservative ranges do not overlap; a plausible change of assumptions cannot reverse the winner.
- The result rewards intuition and is ideally surprising.
- The scale is hidden inside a familiar object, body, creature, or process rather than recalled from a specification sheet.

All current records remain proposals. Generated pairs pass the mechanical non-overlap test, but editorial approval and source validation are still required before publication. A mechanically valid pair may still be dull or awkward, so future curation can add pair-level exclusions without returning to a hardcoded question list.

## Database design

The relational model separates reusable measurements, generated matchups, and anonymous play history:

- `wg_subjects`: one versioned row per measurable subject. Typed columns hold its category, label, emoji, central magnitude, conservative low/high magnitudes, kid-friendly scale label, editorial note, and source URLs. Active subjects are indexed by category and range for pairing.
- `wg_matchup_rounds`: stores the two subject versions selected for a round, their randomized screen order, the binary choice, correctness, and answer time. The pair exists only as a played round; questions are generated rather than stored as fixed content.
- `wg_comparisons`: retains the original 100 authored proposals as editorial provenance. Runtime selection no longer depends on this table.
- Counts use items, weights use kilograms, lengths use meters, areas use square meters, volumes use cubic meters, and speeds use meters per second internally. Reveals translate those values into natural scales such as kilometers, square kilometers, liters, centimeters per year, or meters per day. Durations use seconds internally but reveal natural spans such as days, years, or centuries. Frequency stores events per second so the larger value identifies the shorter gap.
- `wg_sessions`: random bearer identifier plus creation and expiry timestamps. Sessions contain no names or contact information.

Subject versions are never overwritten, so a content correction cannot change a matchup already assigned to a player. Removed subjects are retired from selection while retained rounds can still resolve them. Left/right orientation is stored per round so the larger answer cannot develop a visible position pattern.

SQLite remains the persistent local development database. Hosted use is implemented for Neon-compatible Postgres. At larger catalog sizes, replace random OFFSET selection with indexed random-slot seeks or prebuilt category decks. Play-history growth is one compact row per answer; schedule bounded deletion of expired sessions before public traffic.

## Run locally

```sh
npm run wild-guess:setup
npm run wild-guess:proposals
npm run wild-guess:subjects
npm run dev
```

Open `/wild-guess`. The local database defaults to `.local/wild-guess.sqlite`. `WILD_GUESS_DB_PATH` selects another persistent path.

## Hosted database setup

Set `DATABASE_URL` (or `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`) to a Neon-compatible Postgres endpoint, then run `npm run wild-guess:setup` once with that environment before deployment. Use a migration-capable role for setup and a least-privilege runtime role for requests. Production deliberately has no implicit local-file fallback.

## Verification

`npm run wild-guess:test` verifies the curated subject pool, every generated non-overlapping pair, removal of retired trivia subjects, canonical concept uniqueness, rejection of ambiguous size adjectives, frequency-theme diversity, readable magnitude labels, answer concealment, endless next-question flow, replay protection, idempotent seeding, and foreign keys. `npm run build` runs the portal’s visual checks and production compilation. The CSV exposes which records still need source review. A real hosted Postgres smoke test remains required before publication.
