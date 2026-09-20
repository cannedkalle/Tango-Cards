# Before the Bulb — MVP build brief

## Purpose

Build a simple, polished game for elementary-school children and families. Each round asks which of two familiar inventions came first. The feeling should be “Oh! I didn't know that!” rather than a history test. Keep the path from one question to the next fast and friendly.

Implementation status: the core loop is playable with 181 inventions and 426 curated comparisons. The larger content target below remains future expansion; see `../README.md` for current scope.

This brief replaces the MVP scope in the original ChatGPT summary. The original is context, not an additional feature checklist.

## Core round

1. Show “Which came first?” and two large cards with an object name and emoji or icon.
2. Offer a small “What's this?” button on each card. It opens a short definition without selecting an answer or revealing chronology.
3. The player taps an object once; lock the answer until the next round.
4. Reveal the earlier invention with encouraging feedback. Never rely on color alone to communicate the result.
5. Show both dates and concise wording identifying the historical milestone behind each date.
6. Display one short, verified fun fact, preferably about the comparison.
7. Show a large “Next” button.

Keep a simple session score: correct answers / answered questions. No streak system, timer, penalties, or difficulty selector in the MVP. Families can take turns informally without accounts or player setup.

## Question selection

Use one curated pool of accessible comparisons. Shuffle the pair IDs and consume the shuffled list without repeats until the pool is exhausted. Randomize which object appears on each side. When starting another cycle, avoid immediately repeating the last pair if alternatives exist.

Track only the current session in memory. Do not implement performance-based selection, age filtering, category balancing, player statistics, or persistent progress yet.

## Content and accuracy

Historical accuracy remains a core requirement even with a smaller feature set.

- Use a local, reviewed JSON dataset. No LLM calls or live fact generation during gameplay.
- Research every date and factual claim using museums, universities, government archives, or other authoritative historical references.
- Link sources to individual date claims and facts so every displayed claim can be audited.
- Distinguish the first known version, patent, demonstration, practical version, and commercial introduction. Never silently compare different meanings of “invented.”
- Use qualified object names where needed, such as a specific type of vehicle rather than an overly broad label.
- Store approximate dates or ranges honestly. Exclude disputed or overlapping comparisons when the ordering is not clear.
- Definitions must explain what the object does without revealing its age, predecessor, successor, or invention date.
- Each pair needs one short verified reveal fact. Multiple rotating facts per object are optional content expansion, not an MVP requirement.
- Curate pairings rather than randomly combining arbitrary objects. Prefer familiar objects with an interesting, defensible ordering.

Aim for approximately 100 reviewed objects and 150–200 curated pairs for the first content-complete release. These are targets, not permission to pad the dataset with unsupported claims. A smaller verified build can be used for playtesting, with its content count clearly documented; it should not be labeled ready for a long car ride until variety has been tested.

## Minimal data structure

Keep content separate from game logic and UI. Use stable IDs so the collection can grow without changing the renderer.

Objects:

- `id`, `name`, `icon`, `category`, `kidDefinition`
- `dateDisplay`, `yearStart`, `yearEnd` (numeric chronological bounds, including negative years for BCE where needed)
- `dateBasis`, `dateSourceIds`, `ambiguityNotes`

Pairs:

- `id`, `objectAId`, `objectBId`, `earlierObjectId`
- `funFact`, `factSourceIds`, optional editorial `notes`

Sources:

- `id`, `title`, `publisher`, `url`, `accessedOn`, and a short `claimSupported` note

Source records can live alongside the object and pair files in a separate `sources.json`. Pair-specific arithmetic facts may cite both underlying date sources. Validate every object/source reference and the stored answer against the reviewed dates. Do not infer precise ordering from a single representative year when a date is approximate.

## Interface

Use the shared Playform design language, readable text, generous spacing, and large touch targets. Stack the two cards on narrow screens when needed. Support keyboard selection, visible focus, accessible feedback announcements, and reduced motion. Keep answer controls visually distinct from definition controls.

Show the two dates as a simple earlier/later reveal. An animated or proportional timeline is deferred. Keep the fact to one or two short sentences and avoid exact-year memorization as the goal.

The initial touch interface supports a passenger-led family game. Dedicated spoken prompts and audio-only interaction are future work.

## Technical scope

Use a lightweight static web app following the existing Apps workspace conventions. Load bundled JSON once; rounds run locally without a backend, login, API key, or runtime network requests. A loaded session should continue if connectivity drops. Offline relaunch, installability, and service-worker caching are deferred.

Keep object data, pair data, selection logic, and rendering separate. Do not build a generalized recommendation engine or speculative feature infrastructure.

## Completion checks for the implementation

- Play through a full question pool and into the next cycle; confirm no pair repeats within a cycle.
- Check that changing card order never changes the correct answer and repeated taps never add extra points.
- Validate all IDs, date bounds, source references, and pair ordering; manually review ambiguous milestones.
- Audit definitions for answer leakage and facts for accuracy, length, and child-friendly wording.
- Test narrow mobile screens, long names, keyboard controls, focus behavior, and both correct and incorrect reveals.
- Verify the next-round loop and score reset, and confirm a loaded session can keep playing without connectivity.
- Document the verified object/pair count and any remaining content limitations.

Keep the playable core milestone separate from the larger content-complete release target.
