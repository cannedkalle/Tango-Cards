# Quiz UI standard

The five quiz games — Balls in the Ballpark, Before the Bulb, Name Quest,
Animal Outsider, Twin Terms — share one layout and one set of play modes. Tango Cards
(collecting) and Marble Battles (a simulation) are not quizzes: they live in
their own home section and keep their own controls.

## Zones, top to bottom (quiz shell v2, `app/components/QuizShell.jsx`)

The shell owns the frame; games own their question, choices, and reveal.
With the menu collapsed, the whole quiz (question + choices) fits the
first screen on a phone: two rows plus one slim status line, then the
game. Twin Terms and Before the Bulb adopted v2 first; Animal Outsider,
Balls in the Ballpark, and Name Quest follow in turn, keeping their own
content and accents.

1. **Row 1: PortalNav.** Site title + icon, Back to all apps. Already
   shared by every game page; shell pages trim its bottom padding on
   phones.
2. **Row 2: GameBar.** Game name + Start over + one options dropdown,
   in a single row of minimal height. Every setting a game has (play
   mode, difficulty, content pool) lives in the dropdown, closed by
   default, with the current choices summarized on the toggle (e.g.
   "Curated · Endless"). Picking a setting collapses the menu again
   and resets the score, exactly as a visible control row did. No
   kicker, no tagline, no separate picker rows.
3. **Status line.** One small plain-text line, never a box or a pill:
   round counter, right / played, streak, plus lives hearts in
   3-lives mode. Every quiz game tracks a streak (consecutive correct
   rounds); a wrong answer or give-up resets it. Rounds are always
   numbered "Round N" ("Round N of 10" in 10-question mode), and the
   line shows the round being played, including during the reveal.
4. **Question line, compact.** One row: the question itself (Bulb's
   "Which came first?", Twin's prompt, Outsider's "Which one is the
   outsider?"). Flavor eyebrows and redundant instruction lines are
   gone; the cards and choices carry the meaning.
5. **Choices, reveal, results**, unchanged per game, except the results
   kicker reads "10 rounds done!" everywhere in 10-question mode and
   the Next button reads "Next round" (Name Quest keeps "Next" until
   its turn).

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

- **Game title**: `.qs-bar-title` in the shell game bar (24px,
  20px on phones) in every game that has adopted the shell.
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
