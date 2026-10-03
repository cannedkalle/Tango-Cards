# Balls in the Ballpark: database evaluation and MVP

## Product decision

An endless stream of estimation puzzles, each answered by selecting an order of magnitude such as thousands, millions, or billions. The exact number is intentionally not part of play. Each reveal is counted as In the ballpark (right scale), Almost there (one scale away), or A long shot. Each reveal shows the approximate answer and a brief framing note, without step-by-step calculations. No account, timer, public leaderboard, or personal information. The catalog uses playful thought experiments where needed; the termite scenario, for example, is deliberately imaginary rather than a biological prediction. Only the golf-ball diameter is externally sourced (USGA link included in its reveal).

### Question bar

Every question must meet all of these rules before entering the pool:

- A child can picture the objects and scale without specialist knowledge.
- The question sounds curious and natural on its own; it is not a disguised calculation exercise.
- The answer is a broad order-of-magnitude bucket, never a demand for a precise number.
- A surprising result is a bonus, especially when it makes the player rethink an everyday object.

## Why a relational database

The catalog is small and read-heavy; play records grow with every session. Separate immutable question versions from sessions and per-round answers. A corrected answer must not change a game already in progress. Sessions pin exact question versions. A relational database provides foreign keys, transactional game creation and conditional writes that prevent duplicate scoring across tabs/retries. Browser storage cannot provide these guarantees or durable shared content.

Keep the existing Next.js + Neon/Postgres architecture for hosted use. SQLite is a real file-backed local development database, not the production scaling strategy. No hosted database credentials were available during implementation; the local database is initialized and the Postgres adapter/schema are implemented, but the hosted path still needs integration validation against a configured Neon database. Node 22.16+ is required for the local SQLite driver; Node 24+ is recommended.

## Schema

- `wg_questions`: composite `(id, version)` key, unique ordering slot, active flag, versioned JSON content stored as text. Content contains the prompt, unit, broad answer range, display target, reveal caveat, and optional source links. A new revision receives a new slot and version; the prior version is retired from selection without deletion. The seeder never overwrites an existing version.
- `wg_sessions`: cryptographically random bearer identifier, creation and expiry timestamps. Seven-day anonymous sessions; HttpOnly, SameSite=Strict cookies, Secure in production. No names or contact details.
- `wg_rounds`: one appended question at a time per session, composite primary key `(session_id, position)`, pinned question version, nullable magnitude/score/answer time. Magnitude is an integer from 0 (ones) through 9 (billions), so every displayed choice, including ones, can persist. This is both assignment and one-attempt record. The session tally counts In the ballpark, Almost there, and A long shot rows.

A session begins with one question. A conditional UPDATE records the first selected scale only, then appends a fresh question; repeat submissions do not append another one. Scores and answer keys stay server-side until that round is answered. Players choose an order of magnitude from ones through billions; the stored selection is its scale index rather than a claimed exact answer. Current game reads one pending round and a small aggregate tally. Session and question primary keys support these joins; `(active, slot)` supports catalog selection; expiry has an index for retention cleanup.

## Scale evaluation

At 10,000 games/day, five rounds produce 50,000 round rows/day, or roughly 1.5 million/month before retention. Actual storage depends on indexes and engine overhead: measure rather than promise a fixed capacity. Start with one managed Postgres database and stateless web instances. Request work is bounded to five rounds; no whole-history reads, cached in-memory scores, or per-request schema creation.

The MVP catalog picker uses an indexed ordered walk from a random OFFSET and wraps, then shuffles the five picks. This is appropriate for a small curated catalog but gives correlated sets and OFFSET work grows with catalog size. At tens of thousands of active questions, move to a compact published slot catalog with indexed random-slot seeks (or prebuilt shuffled decks), plus category/difficulty columns and indexes only when filtering is added. Do not sort the full question table randomly on each request.

Sessions expire logically after seven days. Before public production, schedule bounded deletion batches of expired sessions (cascades delete their rounds), or explicitly select a longer analytics retention policy. Do not delete pinned questions while retained rounds reference them. For high sustained write volume, monitor database latency, connection/request rates, row growth, and index size; archive or time-partition attempts only when measurements justify it. Store future art in object storage, not database rows. Add edge rate limits/bot protection before public traffic: the anonymous cookie is isolation, not an abuse-proof identity. No public leaderboard is included.

## Run locally

```
npm run wild-guess:setup
npm run dev
```

Open `/wild-guess` (also listed on the portal). The default database is `.local/wild-guess.sqlite`, ignored by Git. `WILD_GUESS_DB_PATH` selects another persistent local path. The game resumes through a seven-day server cookie, including after reload/restart. Clearing cookies loses access to that anonymous game.

## Hosted database setup

Set `DATABASE_URL` (or the portal's existing `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`) to a Neon-compatible Postgres endpoint. The setup command reads `.env.local` when present. Run `npm run wild-guess:setup` once against that database before deploying through the portal's existing Vercel pipeline. Setup is idempotent: it preserves an existing question version and promotes a newly supplied higher version while retiring the old one. Use a migration-capable role for setup and a least-privilege runtime role for serving traffic.

No local-file fallback is allowed on Vercel or in production without an explicitly configured local database path. Missing database setup produces a recoverable unavailable state rather than pretending guesses were saved. Keep credentials in environment secrets, never source control.

## Verification

`npm run wild-guess:test` covers magnitude scoring, the zero/ones selection, seed integrity/idempotency, persistence across processes, answer-key concealment, round ordering, replay/concurrency safety, isolation, expiry, and foreign keys. `npm run build` includes the portal's visual token/asset checks. Browser interaction/visual QA and a real hosted Postgres test remain separate checks; neither is implied by a passing build.

Technical references: [Node SQLite](https://nodejs.org/download/release/v25.1.0/docs/api/sqlite.html), [Neon driver](https://github.com/neondatabase/serverless/blob/main/CONFIG.md).
