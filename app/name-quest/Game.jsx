'use client';

import { useCallback, useMemo, useRef, useState } from "react";
import { APP_NAMES } from "../../lib/apps";
import { PLAY_MODES, isGameOver, nextLives } from "../../lib/quiz-play.mjs";
import { ArrowRightIcon, LivesHearts, RestartIcon } from "../components/Icons";
import nameBank from "../../lib/name-quest/name-bank.json";
import pokemonAnimalPairs from "../../lib/name-quest/pokemon-animal-pairs.json";
import PortalNav from "../components/PortalNav";

const entries = nameBank;
const animalPairs = pokemonAnimalPairs;

const categories = [
  "Pokemon",
  "Place",
  "Space",
  "Element",
  "Dinosaur",
  "Rock or Gem",
  "Science Term",
  "Compound",
  "Art Term",
  "Animal",
  "Plant",
  "Dish",
  "Brand or Store",
  "App or Website",
  "Movie, Show, or Book",
  "Character",
  "Myth or Legend",
  "Famous Person",
  "Game",
  "Language",
  "Dog Breed",
  "Cheese",
  "Board Game",
  "Cloud Type",
  "Dance Style",
  "Musical Instrument",
];

const categoryFamilies = {
  Pokemon: "fictional-entity",
  Character: "fictional-entity",
  "Myth or Legend": "fictional-entity",
  "Movie, Show, or Book": "fictional-work",
  Game: "fictional-work",
  Place: "place",
  Space: "space",
  Element: "science-object",
  "Rock or Gem": "science-object",
  "Science Term": "concept",
  Compound: "science-object",
  "Art Term": "culture",
  "Math or Tech Term": "concept",
  "Social Studies Term": "concept",
  Dinosaur: "living-thing",
  Animal: "living-thing",
  Plant: "living-thing",
  Dish: "food-culture",
  "Brand or Store": "modern-thing",
  "App or Website": "modern-thing",
  "Famous Person": "person",
  Language: "culture",
  "Dog Breed": "living-thing",
  Cheese: "food-culture",
  "Board Game": "fictional-work",
  "Cloud Type": "concept",
  "Dance Style": "culture",
  "Musical Instrument": "culture",
};

const confusingCategoryPairs = new Set(
  [
    ["Dinosaur", "Animal"],
    ["Plant", "Dish"],
    ["Plant", "Cheese"],
    ["Dish", "Brand or Store"],
    ["Dog Breed", "Place"],
    ["Cheese", "Place"],
    ["Board Game", "Place"],
    ["Dance Style", "Place"],
    ["Dance Style", "Dish"],
    ["Dance Style", "Brand or Store"],
    ["Cloud Type", "Plant"],
    ["Brand or Store", "App or Website"],
    ["Movie, Show, or Book", "Character"],
    ["Movie, Show, or Book", "Game"],
    ["Character", "Pokemon"],
    ["Character", "Myth or Legend"],
    ["Place", "Space"],
    ["Element", "Rock or Gem"],
    ["Element", "Science Term"],
    ["Element", "Compound"],
    ["Rock or Gem", "Science Term"],
    ["Rock or Gem", "Compound"],
    ["Space", "Science Term"],
    ["Science Term", "Compound"],
    ["Language", "Social Studies Term"],
    ["Language", "Art Term"],
    ["App or Website", "Math or Tech Term"],
  ].map(([first, second]) => [first, second].sort().join("|")),
);

const categoryAliases = {
  Pokemon: ["pokemon"],
  Place: ["place", "city", "country", "landmark", "mountain", "island"],
  Space: ["space", "planet", "moon", "star", "galaxy", "constellation"],
  Element: ["element", "chemical element", "gas", "metal"],
  Dinosaur: ["dinosaur", "ancient animal", "prehistoric animal"],
  "Rock or Gem": ["rock", "gem", "mineral"],
  "Science Term": ["science term", "term", "concept"],
  Compound: ["compound", "chemical compound", "medicine"],
  "Art Term": ["art term", "art", "term"],
  "Math or Tech Term": ["math term", "tech term", "math or tech term", "term", "concept"],
  "Social Studies Term": ["social studies term", "social studies", "term", "concept"],
  Animal: ["animal", "creature", "mammal", "bird", "fish", "reptile"],
  Plant: ["plant", "tree", "flower", "fruit", "vegetable"],
  Dish: ["food", "dish", "snack", "dessert", "prepared food"],
  "Brand or Store": ["brand", "store", "shop", "company", "restaurant"],
  "App or Website": ["app", "website", "software", "browser"],
  "Movie, Show, or Book": ["movie", "show", "book", "tv show", "story"],
  Character: ["character", "cartoon", "hero", "villain"],
  "Myth or Legend": ["myth", "legend", "mythology"],
  "Famous Person": ["person", "famous person", "singer", "athlete", "actor"],
  Game: ["game", "video game"],
  Language: ["language"],
  "Dog Breed": ["dog breed", "dog", "animal"],
  Cheese: ["cheese", "food"],
  "Board Game": ["board game", "game"],
  "Cloud Type": ["cloud type", "cloud", "weather"],
  "Dance Style": ["dance style", "dance"],
  "Musical Instrument": ["musical instrument", "instrument"],
};

const levelLabels = {
  easy: "Easy",
  standard: "Balanced",
  challenge: "Challenge",
};

const modeLabels = {
  category: "Name types",
  pokemon: "Pokemon or not",
  realAnimal: "Real or Pokemon",
};

function normalizePairId(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const pairPrompts = animalPairs.flatMap((pair) => [
  {
    id: "real-" + normalizePairId(pair.real),
    name: pair.real,
    answer: pair.kind === "Plant" ? "Real Plant" : "Real Animal",
    explanation: pair.real + " is a real " + pair.kind.toLowerCase() + ".",
  },
  {
    id: "pokemon-" + normalizePairId(pair.pokemon),
    name: pair.pokemon,
    answer: "Pokemon",
    explanation: pair.note,
  },
]);

const hashText = (text) =>
  Array.from(text).reduce((hash, character) => hash + character.charCodeAt(0), 0);

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isConfusingDistractor = (answer, option) => {
  if (answer === option) return true;
  const pairKey = [answer, option].sort().join("|");
  if (confusingCategoryPairs.has(pairKey)) return true;
  return categoryFamilies[answer] === categoryFamilies[option];
};

const getChoices = (entry) => {
  const distantDistractors = categories
    .filter((category) => !isConfusingDistractor(entry.category, category))
    .sort((first, second) => {
      const firstScore = (hashText(entry.id + ":" + first) * 17) % 97;
      const secondScore = (hashText(entry.id + ":" + second) * 17) % 97;
      return firstScore - secondScore;
    })
    .slice(0, 3);
  const fallbackDistractors = categories
    .filter((category) => category !== entry.category && !distantDistractors.includes(category))
    .sort((first, second) => {
      const firstScore = (hashText(entry.id + ":" + first + ":fallback") * 17) % 97;
      const secondScore = (hashText(entry.id + ":" + second + ":fallback") * 17) % 97;
      return firstScore - secondScore;
    });

  return [entry.category, ...distantDistractors, ...fallbackDistractors]
    .slice(0, 4)
    .sort((first, second) => {
      const firstScore = (hashText(entry.id + ":" + first + ":choice") * 31) % 101;
      const secondScore = (hashText(entry.id + ":" + second + ":choice") * 31) % 101;
      return firstScore - secondScore;
    });
};

const getBasePlayableEntries = () =>
  entries.filter(
    (entry) =>
      entry.playable !== false &&
      entry.classicPlayable !== false &&
      entry.wordForm !== "multiple" &&
      entry.ambiguity !== "high" &&
      !["common", "veryCommon"].includes(entry.commonName),
  );

const getPool = (level, mode) => {
  if (mode === "pokemon") {
    const notPokemon = getBasePlayableEntries().filter((entry) => entry.category !== "Pokemon");
    const pokemon = entries.filter((entry) => entry.playable !== false && entry.category === "Pokemon");
    return [...pokemon, ...notPokemon];
  }

  const playableEntries = getBasePlayableEntries();

  if (level === "easy") {
    return playableEntries.filter(
      (entry) =>
        entry.difficulty <= 2 &&
        ["none", "low"].includes(entry.ambiguity) &&
        ["none", "rare"].includes(entry.commonName),
    );
  }

  if (level === "standard") {
    return playableEntries.filter(
      (entry) => entry.difficulty === 3 && ["none", "low", "medium"].includes(entry.ambiguity),
    );
  }

  return playableEntries.filter((entry) => entry.difficulty >= 4);
};

const getPokemonModeGroups = () => ({
  pokemon: entries.filter((entry) => entry.playable !== false && entry.category === "Pokemon"),
  notPokemon: getBasePlayableEntries().filter((entry) => entry.category !== "Pokemon"),
});

/* Session no-repeat window, shared by all three content modes for the
 * whole page session: Start over, Play again, and mode or level switches
 * never clear it (a reload does, like the score). The progress set kept
 * in state still resets on a fresh game; this window is only about
 * dealing, so a name just played never comes straight back. */
const RECENT_WINDOW_SIZE = 12;

const applyRecentWindow = (recentIds, id) =>
  [...recentIds.filter((recentId) => recentId !== id), id].slice(-RECENT_WINDOW_SIZE);

const pickNext = (pool, usedIds, currentId) => {
  const fresh = pool.filter((entry) => !usedIds.has(entry.id) && entry.id !== currentId);
  const candidates = fresh.length > 0 ? fresh : pool.filter((entry) => entry.id !== currentId);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];
};

const pickPokemonModeNext = (usedIds, currentId) => {
  const groups = getPokemonModeGroups();
  const wantsPokemon = Math.random() < 0.5;
  const preferred = wantsPokemon ? groups.pokemon : groups.notPokemon;
  const fallback = wantsPokemon ? groups.notPokemon : groups.pokemon;
  const preferredNext = pickNext(preferred, usedIds, currentId);
  return preferredNext && preferredNext.id !== currentId ? preferredNext : pickNext(fallback, usedIds, currentId);
};

const pickPairNext = (usedIds) => {
  const wantsPokemon = Math.random() < 0.5;
  const answerPool = pairPrompts.filter((prompt) =>
    wantsPokemon ? prompt.answer === "Pokemon" : prompt.answer !== "Pokemon",
  );
  const fresh = answerPool.filter((prompt) => !usedIds.has(prompt.id));
  const candidates = fresh.length > 0 ? fresh : answerPool;
  const answer = candidates[Math.floor(Math.random() * candidates.length)] ?? answerPool[0];
  const distractors = pairPrompts
    .filter((prompt) => prompt.answer !== answer.answer)
    .sort((first, second) => {
      const firstScore = (hashText(answer.id + ":" + first.id) * 19) % 103;
      const secondScore = (hashText(answer.id + ":" + second.id) * 19) % 103;
      return firstScore - secondScore;
    })
    .slice(0, 3);

  return {
    id: answer.answer + "-" + answer.id,
    target: answer.answer,
    answer,
    choices: [answer, ...distractors].sort((first, second) => {
      const firstScore = (hashText(answer.id + ":" + first.id + ":pair-choice") * 29) % 107;
      const secondScore = (hashText(answer.id + ":" + second.id + ":pair-choice") * 29) % 107;
      return firstScore - secondScore;
    }),
  };
};

export default function Game() {
  const [mode, setMode] = useState("category");
  const [level, setLevel] = useState("standard");
  const [playMode, setPlayMode] = useState("endless");
  const [lives, setLives] = useState(3);
  const [over, setOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [current, setCurrent] = useState(() => getPool("standard", "category")[0]);
  const [pairCurrent, setPairCurrent] = useState(() => pickPairNext(new Set()));
  const [usedIds, setUsedIds] = useState(() => new Set([getPool("standard", "category")[0].id]));
  /* Seeded with the two opening rounds so the window covers the session
   * from the first deal on. */
  const recentIdsRef = useRef(null);
  if (recentIdsRef.current === null) {
    recentIdsRef.current = [current.id, pairCurrent.answer.id];
  }
  const [result, setResult] = useState("idle");
  const [feedback, setFeedback] = useState("Pick the kind of name.");
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [streak, setStreak] = useState(0);

  const pool = useMemo(() => getPool(level, mode), [level, mode]);
  const choices = useMemo(() => {
    if (mode === "pokemon") return ["Pokemon", "Not Pokemon"];
    if (mode === "realAnimal") return pairCurrent.choices.map((choice) => choice.name);
    return getChoices(current);
  }, [current, mode, pairCurrent.choices]);

  const promptName = mode === "realAnimal" ? "Which is " + pairCurrent.target + "?" : current.name;
  const progressTotal = mode === "realAnimal" ? pairPrompts.length : pool.length;
  const progressValue = progressTotal ? Math.min(100, (usedIds.size / progressTotal) * 100) : 0;

  const nextRound = useCallback(() => {
    if (mode === "realAnimal") {
      const next = pickPairNext(new Set(recentIdsRef.current));
      setPairCurrent(next);
      recentIdsRef.current = applyRecentWindow(recentIdsRef.current, next.answer.id);
      setUsedIds((previous) => {
        const updated = new Set(previous);
        if (updated.size >= pairPrompts.length) updated.clear();
        updated.add(next.answer.id);
        return updated;
      });
      setResult("idle");
      setFeedback("Pick the " + next.target + ".");
      setRounds((value) => value + 1);

      return;
    }

    const next = mode === "pokemon" ? pickPokemonModeNext(new Set(recentIdsRef.current), current.id) : pickNext(pool, new Set(recentIdsRef.current), current.id);
    setCurrent(next);
    recentIdsRef.current = applyRecentWindow(recentIdsRef.current, next.id);
    setUsedIds((previous) => {
      const updated = new Set(previous);
      if (updated.size >= pool.length) updated.clear();
      updated.add(next.id);
      return updated;
    });
    setResult("idle");
    setFeedback(mode === "pokemon" ? "Pokemon or not?" : "Pick the kind of name.");
    setRounds((value) => value + 1);

  }, [current.id, mode, pool, usedIds]);

  const judgeAnswer = useCallback(
    (answer) => {
      if (result !== "idle") {
        return;
      }

      const normalized = normalize(answer);
      if (!normalized) return;

      if (mode === "realAnimal") {
        const selected = pairCurrent.choices.find((choice) => normalize(choice.name) === normalized);
        if (!selected) return;
        const exact = selected.id === pairCurrent.answer.id;
        const answerLine = exact
          ? "Yes. " + pairCurrent.answer.explanation
          : "Good guess. " + pairCurrent.answer.name + " is the " + pairCurrent.target + ". " + pairCurrent.answer.explanation;
        finishRound(exact ? "correct" : "miss", answerLine, exact);
        return;
      }

      if (mode === "pokemon") {
        const guessedPokemon = normalized === "pokemon";
        const guessedNotPokemon = ["not pokemon", "not a pokemon", "no"].includes(normalized);
        if (!guessedPokemon && !guessedNotPokemon) return;
        const isPokemon = current.category === "Pokemon";
        const exact = guessedPokemon === isPokemon;
        const answerLine = exact
          ? isPokemon
            ? "Yes. " + current.explanation
            : "Right. " + current.name + " is not a Pokemon. It is " + current.category.toLowerCase() + "."
          : isPokemon
            ? "Good guess. " + current.name + " is a Pokemon."
            : "Good guess. " + current.name + " is not a Pokemon. It is " + current.category.toLowerCase() + ".";
        finishRound(exact ? "correct" : "miss", answerLine, exact);
        return;
      }

      const accepted = new Set(
        [current.category, current.subcategory, ...current.acceptedAnswers, ...(categoryAliases[current.category] ?? [])].map(normalize),
      );
      const exact = accepted.has(normalized);
      const close =
        !exact &&
        Array.from(accepted).some((acceptedAnswer) => acceptedAnswer.includes(normalized) || normalized.includes(acceptedAnswer));
      const nextResult = exact ? "correct" : close ? "close" : "miss";
      const answerLine = nextResult === "miss" ? "Good guess. It is " + current.category.toLowerCase() + "." : "Yes. " + current.explanation;
      finishRound(nextResult, answerLine, nextResult !== "miss");
    },
    [current, mode, pairCurrent, result],
  );

  const finishRound = (nextResult, answerLine, counted) => {
    setResult(nextResult);
    setFeedback(answerLine);
    setScore((value) => value + (counted ? 1 : 0));
    setStreak((value) => (counted ? value + 1 : 0));
    /* Rounds counts finished rounds; the round just answered is one more.
     * A close answer counts as scored, so it never costs a life. */
    const nextLivesCount = nextLives(playMode, lives, counted);
    setLives(nextLivesCount);
    setOver(isGameOver(playMode, rounds + 1, nextLivesCount));
  };


  const resetGame = (nextLevel = level, nextMode = mode) => {
    const nextPool = getPool(nextLevel, nextMode);
    const next = nextMode === "realAnimal" ? undefined : nextMode === "pokemon" ? pickPokemonModeNext(new Set(recentIdsRef.current)) : pickNext(nextPool, new Set(recentIdsRef.current));
    const nextPair = nextMode === "realAnimal" ? pickPairNext(new Set(recentIdsRef.current)) : pairCurrent;
    /* The window survives the reset: the fresh game's first round still
     * avoids the names just played. Only the progress set restarts. */
    if (nextMode === "realAnimal") {
      recentIdsRef.current = applyRecentWindow(recentIdsRef.current, nextPair.answer.id);
    } else if (next) {
      recentIdsRef.current = applyRecentWindow(recentIdsRef.current, next.id);
    }
    setMode(nextMode);
    setLevel(nextLevel);
    if (next) setCurrent(next);
    setPairCurrent(nextPair);
    setUsedIds(new Set([nextMode === "realAnimal" ? nextPair.answer.id : next?.id ?? current.id]));
    setResult("idle");
    setFeedback(nextMode === "realAnimal" ? "Pick the " + nextPair.target + "." : nextMode === "pokemon" ? "Pokemon or not?" : "Pick the kind of name.");
    setScore(0);
    setRounds(0);
    setStreak(0);
    setLives(3);
    setOver(false);
    setShowResults(false);
  };

  /* Switching play mode starts a fresh game, so one mode's results never
   * mix with another's. Content mode and level switches already reset
   * through resetGame. */
  const switchPlayMode = (nextPlayMode) => {
    if (nextPlayMode === playMode) return;
    setPlayMode(nextPlayMode);
    resetGame();
  };

  return (
    <>
      <PortalNav />
      <header className="topbar app-topbar name-quest-topbar">
        <div>
          <p className="eyebrow">{APP_NAMES.nameQuest}</p>
          <h1 className="pf-game-title">{mode === "pokemon" ? "Pokemon or not?" : mode === "realAnimal" ? "Which one is it?" : "What kind of name is this?"}</h1>
        </div>
        <div className="topbar-actions">
          <div className="name-quest-controls" aria-label="Game modes">
            <div className="pf-pill-group" role="group" aria-label="Game modes">
              {Object.keys(modeLabels).map((nextMode) => (
                <button key={nextMode} type="button" className="pf-pill" aria-label={modeLabels[nextMode]} aria-pressed={nextMode === mode} onClick={() => resetGame(level, nextMode)}>
                  {modeLabels[nextMode]}
                </button>
              ))}
            </div>
            <button type="button" className="pf-btn" onClick={() => resetGame()}><RestartIcon />Start over</button>
          </div>
        </div>
      </header>

      <main className="name-quest-page">
        <div className="pf-pill-group" role="group" aria-label="Play mode" style={{ gridColumn: "1 / -1" }}>
          {PLAY_MODES.map((play) => (
            <button key={play.id} type="button" className="pf-pill" aria-pressed={playMode === play.id} onClick={() => switchPlayMode(play.id)}>{play.label}</button>
          ))}
        </div>
        {over && showResults ? (
          <section className="name-quest-board" aria-label="Name Quest results">
            <div className="name-card-stage">
              <p>{playMode === "ten" ? "10 questions done!" : "Out of lives!"}</p>
              <h2 className="quest-name">Here is how you did.</h2>
              <strong className="round-feedback">{score} correct out of {rounds + 1} answered.</strong>
              <button type="button" className="pf-primary" onClick={() => resetGame()}>Play again <ArrowRightIcon /></button>
            </div>
          </section>
        ) : (
        <section className="name-quest-board" aria-label="Name Quest round">
          <div className="name-card-stage">
            <p>Round {rounds + 1}{playMode === "ten" ? " of 10" : ""}</p>
            <h2 className="quest-name">{promptName}</h2>
            <strong className={"round-feedback " + result} aria-live="polite">{feedback}</strong>
            {result !== "idle" ? (
              <button type="button" className="pf-primary" onClick={over ? () => setShowResults(true) : nextRound}>{over ? <>See results <ArrowRightIcon /></> : <>Next <ArrowRightIcon /></>}</button>
            ) : null}
          </div>

          <div className="choice-grid">
            {choices.map((choice) => (
              <button key={choice} type="button" disabled={result !== "idle"} onClick={() => judgeAnswer(choice)}>{choice}</button>
            ))}
          </div>
        </section>
        )}

        <aside className="name-quest-side" aria-label="Name Quest status">
          <section className="score-panel" style={playMode === "lives" ? { gridTemplateColumns: "repeat(4, 1fr)" } : undefined}>
            <div><strong>{score}</strong><span>Score</span></div>
            <div><strong>{streak}</strong><span>Streak</span></div>
            <div><strong>{progressTotal}</strong><span>Items</span></div>
            {playMode === "lives" && <div><strong><LivesHearts lives={lives} /></strong><span>Lives</span></div>}
            <div className="progress-track" aria-label="Progress"><span style={{ width: progressValue + "%" }} /></div>
          </section>

          {mode === "category" && (
          <section className="quest-controls-panel">
            <div className="level-row" aria-label="Choose challenge level">
              {Object.keys(levelLabels).map((nextLevel) => (
                <button key={nextLevel} type="button" className="pf-btn" aria-pressed={nextLevel === level} onClick={() => resetGame(nextLevel, mode)}>{levelLabels[nextLevel]}</button>
              ))}
            </div>
          </section>
          )}
        </aside>
      </main>
    </>
  );
}
