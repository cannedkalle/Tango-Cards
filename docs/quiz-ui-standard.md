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
own round engines; they share only the two pure end-of-game rules in
`lib/quiz-play.mjs` (`nextLives`, `isGameOver`), covered by
`tests/quiz-play.test.mjs`.

## Home sections (`lib/apps.js`)

Each app carries a `section` field. The home page renders Quiz games
first — Balls in the Ballpark, Name Quest, Animal Outsider, Before the
Bulb — then Cards and battles — Tango Cards, Marble Battles.

## Exceptions

- **Name Quest keeps its side score panel** (Score, Streak, Items,
  progress) and its level row stays in that panel. Its board-plus-aside
  layout and its shared-stylesheet styles make moving the panel a visual
  risk; its Start over moved to the header and its Play row sits above
  the board, so every other zone matches.
- **Marble Battles keeps Restart in its controls** and has no play
  modes; it is a simulation, not a quiz.
- **Tango Cards has no rounds**, so no Start over and no play modes.
