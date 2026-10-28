# Quiz UI standard

The five quiz games — Balls in the Ballpark, Before the Bulb, Name Quest,
Animal Outsider, Twin Terms — share one layout and one set of play modes. Tango Cards
(collecting) and Marble Battles (a simulation) are not quizzes: they live in
their own home section and keep their own controls.

## Zones, top to bottom (quiz shell, `app/components/QuizShell.jsx`)

The shell owns the frame; games own their question, choices, and reveal.
Twin Terms adopted the shell first (pilot); the other four quiz games
adopt it in turn, keeping their own content and accents.

1. **Header: kicker above the game name, Start over top-right.** One
   place, one size, every game. Start over resets the score and the
   round and keeps the chosen modes.
2. **Score strip.** The same three numbers everywhere — right, played,
   streak — plus lives hearts in 3-lives mode. Every quiz game tracks a
   streak (consecutive correct rounds); a wrong answer or give-up resets
   it.
3. **Settings, collapsed.** Play mode, difficulty, and content pool live
   in one collapsed panel, closed by default, with the current choice
   summarized on the toggle (e.g. "Settings · Endless"). Picking a
   setting collapses the panel again and resets the score, exactly as a
   visible control row did. The question is the first thing on screen;
   nothing above it needs scrolling past. (Before: Twin showed score
   boxes plus the mode row, Outsider stacked two labeled picker rows
   plus a note line, and Bulb showed three picker rows — all above the
   first question on mobile.)
4. **Round label.** Every game numbers its rounds "Round N" ("Round N
   of 10" in 10-question mode) — no more Puzzle / Discovery / Wild card /
   Matchup variants. The label shows the round being played, including
   during the reveal.
5. **Question and choices**, unchanged per game.
6. **After answering: reveal, then Next round.** When the game is over,
   the button reads See results instead of Next round.
7. **Results screen.** Score summary plus Play again (same mode).

## Play modes (`lib/quiz-play.mjs`, same rules everywhere)

- **Endless** (default): play forever, the way these games always worked.
  No end screen.
- **10 questions**: exactly 10 answered rounds, then the results screen.
- **3 lives**: a wrong answer loses one of three lives; 0 lives ends the
  game with the results screen. A right answer never costs a life. In
  Name Quest a close answer counts as scored, so it costs no life.

Switching mode — or difficulty, where a game has one — always resets the
score, so one mode's results never mix with another's. Games keep their
own round engines; they share the pure rules in `lib/quiz-play.mjs`
(`nextLives`, `isGameOver`, `livesHeartStates`), covered by
`tests/quiz-play.test.mjs`. In Balls in the Ballpark, the no-repeat window
behind a fresh game lives for the whole page session, so Play again never
re-deals a recent matchup, while every deal stays an independent random
draw — no deck, no fixed sequence.

## Shared chrome (`public/design-system/playform.css`, `app/components/Icons.jsx`)

The same control looks the same in every game. Game content keeps its own
accent (Bulb peach/blue, Animal leaf, Name Quest violet); only the chrome
is uniform.

- **Game title**: `.qs-title` in the shell header
  (clamp(34px, 8vw, 48px)) in every game that has adopted the shell.
  Marble's panel heading stays small — it is an aside heading,
  not a game title.
- **Primary action**: `.pf-primary` (Next, Play again, See results).
- **Secondary button**: `.pf-btn` (Start over, Restart, difficulty
  choices, panel controls). Pressed rectangular buttons show the shared
  pressed checkmark; pills never do.
- **Mode picker**: `.pf-pill-group` + `.pf-pill`, text only. The green
  pill is the selection. Content mode, then play mode.
- **Status pill**: `.pf-status-pill` for readouts that are not controls
  (Bulb's round/lives pill).
- **Icons**: one SVG set in `Icons.jsx` — back, restart, forward, lives
  hearts — used only where the icon carries meaning, and the same icon
  everywhere it appears. Pickers show text only; game content keeps its
  own decorative marks (Bulb's sparkles, Wild-guess winner marks).
- **Radii**: 12px small, 16px control, 24px card. Circles (50%) and
  progress bars keep their own shapes.

## Home sections (`lib/apps.js`)

Each app carries a `section` field. The home page renders Quiz games
first — Balls in the Ballpark, Name Quest, Animal Outsider, Before the
Bulb, Twin Terms — then Non-quiz games — Tango Cards, Marble Battles.

## Exceptions

- **Name Quest keeps its side score panel** (Score, Streak, Items,
  progress) and its level row stays in that panel, now as shared
  secondary buttons. Its board-plus-aside layout and its shared-stylesheet
  styles make moving the panel a visual risk; its Start over moved to the
  header and its Play row sits above the board as the shared pill group,
  so every other zone matches. Its former ✦-only category button is now
  a labeled pill ("Name types").
- **Marble Battles keeps Restart in its controls** and has no play
  modes; it is a simulation, not a quiz.
- **Tango Cards has no rounds**, so no Start over and no play modes.
