# Quiz UI standard

The four quiz games — Balls in the Ballpark, Before the Bulb, Name Quest,
Animal Outsider — share one layout and one set of play modes. Tango Cards
(collecting) and Marble Battles (a simulation) are not quizzes: they live in
their own home section and keep their own controls.

## Zones, top to bottom

1. **Header: title left, Start over right.** Every quiz game has an always
   visible Start over button in the header. It resets the score and the
   round and keeps the chosen modes. (Before: Bulb had it top-right,
   Name Quest had Restart in a side panel, Marble had Restart in its
   controls, Wild-guess only in an error message, Animal had none.)
2. **Score strip near the header.** Round/question number plus
   correct/played, and streak where the game has one. Survival mode adds
   lives hearts; 10-question mode shows "N of 10".
3. **Control row above the question.** Groups in this order, with a game
   showing only the groups it has: content mode (Bulb: Curated/Wild;
   Name Quest: Name types/Pokemon or not/Real or Pokemon), difficulty
   (Animal: Easy/Standard; Name Quest: level, in its side panel — see
   exceptions), play mode (all four games: Endless / 10 questions /
   3 lives). (Before: Bulb's mode picker sat below the intro, Name Quest's
   modes sat in the header, Animal's difficulty sat above the prompt,
   Wild-guess had no controls at all.)
4. **Question and choices**, unchanged per game.
5. **After answering: reveal, then Next.** When the game is over, the
   button reads See results instead of Next.
6. **Results screen.** Score summary plus Play again (same mode). The
   control row stays visible, so switching modes is one tap away.

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

- **Game title**: `.pf-game-title` (30–44px) in every full-width game
  header. Marble's panel heading stays small — it is an aside heading,
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
Bulb — then Cards and battles — Tango Cards, Marble Battles.

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
