# Balls in the Ballpark editorial pipeline

The subject pool grows through a staged review. A large brainstorm is never copied directly into the playable database.

## 1. Creative discovery

Explore familiar bodies, creatures, objects, natural processes, and places for hidden scales. New categories are welcome when their comparison prompt is immediately understandable. Every proposal includes a precise subject label, base unit, central estimate, conservative low/high order-of-magnitude bounds, a kid-friendly reveal, an explanation, and source links.

Reject a proposal during discovery when the answer is printed on the object, commonly memorized trivia, obtainable by a short conversion, dependent on arbitrary conditions, or too uncertain to keep a stable winner.

## 2. Experience review

An independent reviewer evaluates the proposal without seeing the desired pool size. A subject passes only when a child can picture it, the scale must be estimated rather than recalled or calculated, and the result creates a curious comparison. Reviewers may retain a small number of familiar calibration anchors, but anchors must not dominate a category.

## 3. Similarity review

A separate pass clusters proposals by underlying idea. It chooses one canonical wording for duplicate measurements and limits repeated patterns such as animal wingbeats, container-filling counts, global populations, celestial bodies, landmarks, and decomposition times. Mechanical canonical-key checks remain in the test suite; editorial clustering catches semantic duplicates that spelling checks cannot.

## 4. Evidence verification

An independent verifier checks the definition, unit, central value, and conservative range against primary research or an authoritative institution. The verifier widens ranges when methods or populations vary, rejects records whose plausible ranges cross too many magnitude bands, and records source URLs alongside the subject version. A source link is evidence to inspect, not automatic approval.

High-risk estimates receive two independent sources. These include worldwide totals, biological totals extrapolated from samples, boundaries that change over time, and any value close to an opponent’s range.

## 5. Pair validation and integration

Only same-category subjects with non-overlapping conservative ranges can form a matchup. Integration regenerates the subject export, versions changed database rows, retires removed rows without breaking old sessions, and reports each subject’s number of valid opponents. Subjects with no useful opponents return to discovery rather than becoming filler.

## 6. Release check

Before publication:

1. Review every active subject with missing evidence.
2. Sample generated matchups from every category for wording and surprise.
3. Confirm semantic clusters do not dominate a play session.
4. Run `npm run wild-guess:subjects`, `npm run wild-guess:setup`, `npm run wild-guess:test`, and `npm run build`.
5. Run a hosted Postgres smoke test and play through the production UI on a narrow screen.

The CSV export exposes `source_urls` and `evidence_status` so the remaining verification queue is visible rather than hidden in prose.
