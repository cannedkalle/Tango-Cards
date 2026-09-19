import { animals } from "./animals.js";
import { getAnimalPool } from "./difficulty.js";
import { rootWords, taxonInfo } from "./taxa.js";

const byId = new Map(animals.map((animal) => [animal.id, animal]));
const taxonExamples = buildTaxonExamples();
const taxonRanks = buildTaxonRanks();
const state = {
  difficulty: "easy",
  round: 0,
  answered: 0,
  correct: 0,
  streak: 0,
  current: null,
  selectedId: null,
  discoveredAnimals: new Set(),
  discoveredTaxa: new Set(),
  recentRoundKeys: []
};

const maxRecentRounds = 18;
const surpriseClades = new Set(["Artiodactyla", "Whippomorpha", "Afrotheria", "Blattodea", "Crustacea"]);
const expertClades = new Set(["Archosauria", "Dinosauria"]);
const broadTeachingClades = new Set(["Animalia", "Chordata", "Tetrapoda", "Amniota"]);
const tooBroadOutsiderClades = new Set(["Animalia", "Chordata"]);
const tooBroadContextClades = new Set(["Animalia", "Chordata", "Tetrapoda", "Amniota"]);
const taxonomyRanks = ["kingdom", "phylum", "class", "order", "family", "genus", "species"];

const elements = {
  animalCards: document.querySelector("#animalCards"),
  nextButton: document.querySelector("#nextButton"),
  answerPanel: document.querySelector("#answerPanel"),
  roundLabel: document.querySelector("#roundLabel"),
  answeredCount: document.querySelector("#answeredCount"),
  correctCount: document.querySelector("#correctCount"),
  streakCount: document.querySelector("#streakCount"),
  animalExplorer: document.querySelector("#animalExplorer"),
  taxonomyTrail: document.querySelector("#taxonomyTrail"),
  discoveryList: document.querySelector("#discoveryList"),
  rootList: document.querySelector("#rootList"),
  learningPanel: document.querySelector("#learningPanel")
};

boot();

function boot() {
  for (const button of document.querySelectorAll('[data-difficulty]')) {
    button.addEventListener('click', () => {
      if (state.difficulty === button.dataset.difficulty) return;
      state.difficulty = button.dataset.difficulty;
      state.round = state.answered = state.correct = state.streak = 0;
      state.recentRoundKeys = [];
      state.discoveredAnimals.clear();
      state.discoveredTaxa.clear();
      updateDifficulty();
      populateExplorer();
      startRound();
    });
  }
  elements.animalExplorer.addEventListener("change", () => renderExplorer(elements.animalExplorer.value));
  updateDifficulty();
  elements.nextButton.addEventListener("click", () => {
    startRound();
    elements.animalCards.querySelector("button").focus({ preventScroll: true });
  });
  populateExplorer();
  renderRoots();
  startRound();
}

function startRound() {
  state.round += 1;
  state.selectedId = null;
  state.current = chooseRound();
  elements.roundLabel.textContent = `Round ${state.round}`;
  elements.answerPanel.innerHTML = "";
  elements.nextButton.hidden = true;
  renderCards();
  renderLockedLearningPanel();
  renderScore();
}

function activeAnimals() {
  return getAnimalPool(animals, state.difficulty);
}

function updateDifficulty() {
  for (const button of document.querySelectorAll('[data-difficulty]')) {
    button.setAttribute('aria-pressed', String(button.dataset.difficulty === state.difficulty));
  }
  document.querySelector('#difficultyHint').textContent = state.difficulty === 'easy'
    ? `${activeAnimals().length} familiar animals. Switching difficulty starts a fresh score.`
    : `All ${animals.length} animals. Switching difficulty starts a fresh score.`;
}

function chooseRound() {
  const generated = generateRoundFromPool();
  rememberRound(generated);
  return generated;
}

function renderCards() {
  const isRevealed = Boolean(state.selectedId);
  elements.animalCards.innerHTML = state.current.choices.map((animal, index) => `
    <button class="animal-card" type="button" data-animal-id="${animal.id}">
      <span class="choice-number" aria-hidden="true">${index + 1}</span>
      <strong>${animal.commonName}</strong>
      <span class="choice-status">${!isRevealed ? "Tap to choose" : animal.id === state.current.outsider.id ? "✓ Outsider" : animal.id === state.selectedId ? "Your choice" : "Closer cousin"}</span>
    </button>
  `).join("");

  for (const button of elements.animalCards.querySelectorAll(".animal-card")) {
    button.addEventListener("click", () => answer(button.dataset.animalId));
  }
}

function answer(animalId) {
  if (state.selectedId) return;

  state.selectedId = animalId;
  const wasCorrect = animalId === state.current.outsider.id;
  state.answered += 1;
  state.correct += wasCorrect ? 1 : 0;
  state.streak = wasCorrect ? state.streak + 1 : 0;

  for (const animal of state.current.choices) {
    state.discoveredAnimals.add(animal.id);
    for (const clade of animal.clades) state.discoveredTaxa.add(clade);
  }

  renderCards();
  for (const button of elements.animalCards.querySelectorAll(".animal-card")) {
    const id = button.dataset.animalId;
    button.disabled = true;
    button.classList.toggle("is-correct", id === state.current.outsider.id);
    button.classList.toggle("is-wrong", id === animalId && !wasCorrect);
  }

  elements.nextButton.hidden = false;
  renderAnswer(wasCorrect);
  elements.nextButton.focus({ preventScroll: true });
  renderScore();
  renderDiscoveries();
}

function renderAnswer(wasCorrect) {
  const pair = state.current.pair;
  const shared = describeTaxon(state.current.sharedClade);
  const outsider = state.current.outsider;
  const outsiderJoin = mostRecentSharedClade(pair[0], outsider).clade;
  const outsiderJoinInfo = describeTaxon(outsiderJoin);
  const outsiderParallel = findParallelBranch(outsider, outsiderJoin, state.current.sharedClade);
  elements.answerPanel.innerHTML = `
    <div class="result-card ${wasCorrect ? "correct" : "try-again"}">
      <p class="result-kicker">${wasCorrect ? "Nice reasoning!" : "Good guess. This one teaches a twist."}</p>
      <h2>${outsider.commonName} is the outsider.</h2>
      <p class="latin-reveal"><strong>${outsider.scientificName}</strong> branched away earlier than the closest pair.</p>
      <p><strong>${pair[0].commonName} + ${pair[1].commonName}</strong> are closer relatives. They share ${renderSharedCladeSentence(state.current.sharedClade, shared)}</p>
      <div class="relationship-card">
        <div class="relationship-row closest-pair">
          <span class="row-label">Closest pair</span>
          <strong>${pair[0].commonName}</strong>
          <span class="plus">+</span>
          <strong>${pair[1].commonName}</strong>
        </div>
        <div class="relationship-row branch-comparison">
          <span class="row-label">Branch comparison</span>
          <div class="branch-columns">
            <section class="branch-card closest-branch">
              <span class="branch-label">Closest pair branch</span>
              <p>${pair[0].commonName} and ${pair[1].commonName} sit on this newer branch together.</p>
              ${renderTaxonSummary(state.current.sharedClade, shared)}
            </section>
            <section class="branch-card outsider-branch-card">
              <span class="branch-label">Outsider branch</span>
              <p>${outsider.commonName} is on this different branch instead.</p>
              ${outsiderParallel ? renderTaxonSummary(outsiderParallel.name, outsiderParallel.info) : `<strong>${outsider.commonName}</strong><span>This animal branches away before the closest pair's newer branch.</span>`}
            </section>
          </div>
        </div>
        <div class="relationship-row outsider-branch">
          <span class="row-label">Where both paths rejoin</span>
          <div class="relationship-value">
            <span>${outsider.commonName} is not on ${renderInlineTaxon(state.current.sharedClade, shared)}. It rejoins the closest pair earlier, at ${renderInlineTaxon(outsiderJoin, outsiderJoinInfo)}.</span>
            <div class="parallel-branch">${renderTaxonSummary(outsiderJoin, outsiderJoinInfo)}</div>
          </div>
        </div>
      </div>
      <details>
        <summary>Explore the family tree</summary>
        ${renderComparisonTrail(pair, outsider)}
      </details>
    </div>
  `;
  renderUnlockedLearningPanel();
}

function renderComparisonTrail(pair, outsider) {
  const sharedPath = sharedPathFor(pair[0], pair[1]);
  const outsiderJoin = mostRecentSharedClade(pair[0], outsider).clade;
  return `
    <ol class="tree-list">
      ${sharedPath.map((clade) => renderTaxonStep(clade)).join("")}
    </ol>
    <p class="tree-note">${outsider.commonName} only meets them around <strong>${outsiderJoin}</strong>, so it split away earlier than the close pair.</p>
  `;
}

function populateExplorer() {
  elements.animalExplorer.innerHTML = activeAnimals()
    .slice()
    .sort((a, b) => a.commonName.localeCompare(b.commonName))
    .map((animal) => `<option value="${animal.id}">${animal.commonName}</option>`)
    .join("");
}

function renderExplorer(id) {
  const animal = byId.get(id);
  if (!animal) return;
  elements.animalExplorer.value = animal.id;
  state.discoveredAnimals.add(animal.id);
  animal.clades.forEach((clade) => state.discoveredTaxa.add(clade));
  elements.taxonomyTrail.innerHTML = `
    <div class="explorer-title">
      <div>
        <h3>${animal.commonName}</h3>
        <p>${animal.scientificName}</p>
      </div>
    </div>
    <ol class="tree-list">
      ${animal.clades.map((clade) => renderTaxonStep(clade)).join("")}
      ${renderSpeciesStep(animal)}
    </ol>
  `;
  renderDiscoveries();
}

function renderLockedLearningPanel() {
  elements.learningPanel.classList.add("is-locked");
  elements.animalExplorer.disabled = true;
  elements.animalExplorer.hidden = true;
  elements.taxonomyTrail.innerHTML = `
    <div class="locked-note">
      <h3>Pick an outsider first</h3>
      <p>Scientific names, clades, taxonomy paths, and root-word clues unlock after your answer.</p>
    </div>
  `;
  elements.discoveryList.innerHTML = "<p>Discoveries update after each round.</p>";
  elements.rootList.innerHTML = "<p>Root words unlock with the explanation.</p>";
}

function renderUnlockedLearningPanel() {
  elements.learningPanel.classList.remove("is-locked");
  elements.animalExplorer.hidden = false;
  elements.animalExplorer.disabled = false;
  renderExplorer(state.current.outsider.id);
  renderRoots();
  renderDiscoveries();
}

function renderTaxonStep(clade) {
  const info = describeTaxon(clade);
  return `
    <li>
      <strong>${clade}</strong>
      <span><strong>Rank:</strong> ${info.rank}</span>
      <span><strong>Name origin:</strong> "${info.literalMeaning}"</span>
      <span><strong>Typical traits:</strong> ${info.kidExplanation}</span>
      <span><strong>Examples:</strong> ${examplesForTaxon(clade, info).join(", ")}</span>
    </li>
  `;
}

function renderSpeciesStep(animal) {
  return `
    <li>
      <strong>${animal.taxonomy.species}</strong>
      <span><strong>Rank:</strong> Species</span>
      <span><strong>Name origin:</strong> "scientific species name"</span>
      <span><strong>Typical traits:</strong> The species entry for ${animal.commonName} in this game.</span>
      <span><strong>Examples:</strong> ${animal.commonName}</span>
    </li>
  `;
}

function renderRoots() {
  elements.rootList.innerHTML = rootWords.map((root) => `
    <article class="root-card">
      <strong>${root.root}</strong>
      <span>${root.meaning}</span>
      <p>${root.examples.join(" · ")}</p>
    </article>
  `).join("");
}

function renderDiscoveries() {
  const knownTaxa = [...state.discoveredTaxa]
    .filter((name) => taxonInfo[name])
    .slice(-8)
    .reverse();
  elements.discoveryList.innerHTML = `
    <div class="discovery-stats">
      <span><strong>${state.discoveredAnimals.size}</strong> animals</span>
      <span><strong>${state.discoveredTaxa.size}</strong> branches</span>
    </div>
    ${knownTaxa.length
      ? knownTaxa.map((name) => `<p><strong>${name}</strong><span>${taxonInfo[name].literalMeaning}</span></p>`).join("")
      : "<p>Answer a round or explore an animal to discover branches.</p>"
    }
  `;
}

function renderScore() {
  elements.answeredCount.textContent = state.answered;
  elements.correctCount.textContent = state.correct;
  elements.streakCount.textContent = state.streak;
}

function generateRoundFromPool() {
  const candidates = [];
  const maxAttempts = 3500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const choices = randomTripleFromPool();
    const candidate = buildCandidateRound(choices);
    if (!candidate) continue;
    if (isRecentRound(candidate)) continue;
    candidates.push(candidate);
    if (candidates.length >= 48) break;
  }

  if (candidates.length) return chooseCandidate(candidates);
  return chooseCandidate(buildCandidatePool());
}

function randomTripleFromPool() {
  const pool = activeAnimals();
  const first = randomItem(pool);
  let second = randomItem(pool);
  let third = randomItem(pool);
  while (second.id === first.id) second = randomItem(pool);
  while (third.id === first.id || third.id === second.id) third = randomItem(pool);
  return [first, second, third];
}

function buildCandidatePool() {
  const pool = activeAnimals();
  const candidates = [];
  for (let i = 0; i < pool.length - 2; i += 1) {
    for (let j = i + 1; j < pool.length - 1; j += 1) {
      for (let k = j + 1; k < pool.length; k += 1) {
        const candidate = buildCandidateRound([pool[i], pool[j], pool[k]]);
        if (!candidate) continue;
        if (isRecentRound(candidate)) continue;
        candidates.push(candidate);
      }
    }
  }
  return candidates;
}

function buildCandidateRound(choices) {
  const result = analyzeTriple(choices);
  if (!result) return null;
  const candidate = {
    ...result,
    choices: shuffle(choices),
    level: estimateDifficulty(result)
  };
  if (!passesDifficultyRules(candidate)) return null;
  return candidate;
}

function analyzeTriple(choices) {
  const [aAnimal, bAnimal, cAnimal] = choices;
  const pairs = [
    { pair: [aAnimal, bAnimal], outsider: cAnimal, match: mostRecentSharedClade(aAnimal, bAnimal), otherA: mostRecentSharedClade(aAnimal, cAnimal), otherB: mostRecentSharedClade(bAnimal, cAnimal) },
    { pair: [aAnimal, cAnimal], outsider: bAnimal, match: mostRecentSharedClade(aAnimal, cAnimal), otherA: mostRecentSharedClade(aAnimal, bAnimal), otherB: mostRecentSharedClade(cAnimal, bAnimal) },
    { pair: [bAnimal, cAnimal], outsider: aAnimal, match: mostRecentSharedClade(bAnimal, cAnimal), otherA: mostRecentSharedClade(bAnimal, aAnimal), otherB: mostRecentSharedClade(cAnimal, aAnimal) }
  ].sort((left, right) => right.match.score - left.match.score);

  const winner = pairs[0];
  const nextScore = pairs[1].match.score;
  if (winner.match.score < 2 || winner.match.score === nextScore) return null;
  if (winner.otherA.score >= winner.match.score || winner.otherB.score >= winner.match.score) return null;

  return {
    pair: winner.pair,
    outsider: winner.outsider,
    sharedClade: winner.match.clade,
    outsiderSharedClade: winner.otherA.score >= winner.otherB.score ? winner.otherA.clade : winner.otherB.clade,
    outsiderSharedScore: Math.max(winner.otherA.score, winner.otherB.score),
    confidence: winner.match.score - nextScore
  };
}

function passesDifficultyRules(round) {
  const shared = round.sharedClade;
  const pairScore = mostRecentSharedClade(round.pair[0], round.pair[1]).score;
  const outsiderScore = Math.max(
    mostRecentSharedClade(round.pair[0], round.outsider).score,
    mostRecentSharedClade(round.pair[1], round.outsider).score
  );
  const separation = pairScore - outsiderScore;
  const hasPlausibleOutsiderContext = !tooBroadOutsiderClades.has(round.outsiderSharedClade);
  const hasTaxonomyContext = passesContextRule(round);

  if (!hasPlausibleOutsiderContext) return false;
  if (!hasTaxonomyContext) return false;
  if (!hasInterestingContrast(round)) return false;
  if (!hasInterestingSurpriseShape(round)) return false;
  if (round.level === 1) return pairScore >= 7 && outsiderScore >= 3 && separation >= 1;
  if (round.level === 2) return pairScore >= 6 && outsiderScore >= 1 && separation >= 1;
  if (round.level === 3) return pairScore >= 4 && outsiderScore >= 1 && separation >= 1;
  if (round.level === 4) return surpriseClades.has(shared) && outsiderScore >= 1 && separation >= 1;
  return expertClades.has(shared) && outsiderScore >= 1 && separation >= 1;
}

function hasInterestingSurpriseShape(round) {
  if (round.level < 4) return true;

  const trio = [...round.pair, round.outsider];
  if (round.sharedClade === "Artiodactyla") {
    return hasClade(round.outsider, "Perissodactyla")
      && (trio.some((animal) => hasClade(animal, "Cetacea") || hasClade(animal, "Hippopotamidae"))
        || round.pair.every((animal) => hasClade(animal, "Artiodactyla")));
  }
  if (round.sharedClade === "Whippomorpha") {
    return round.pair.some((animal) => hasClade(animal, "Cetacea"))
      && round.pair.some((animal) => hasClade(animal, "Hippopotamidae"))
      && hasClade(round.outsider, "Perissodactyla");
  }
  if (round.sharedClade === "Afrotheria") {
    return round.pair.some((animal) => hasClade(animal, "Proboscidea"))
      && round.pair.some((animal) => hasClade(animal, "Sirenia"));
  }
  if (round.sharedClade === "Blattodea") {
    return round.pair.some((animal) => animal.id === "termite")
      && round.pair.some((animal) => animal.id === "cockroach")
      && hasClade(round.outsider, "Insecta");
  }
  if (round.sharedClade === "Crustacea") {
    return round.pair.some((animal) => hasClade(animal, "Cirripedia"))
      && round.pair.some((animal) => hasClade(animal, "Decapoda"))
      && hasClade(round.outsider, "Arthropoda");
  }
  if (round.sharedClade === "Archosauria" || round.sharedClade === "Dinosauria") {
    return round.pair.some((animal) => hasClade(animal, "Aves"))
      && round.pair.some((animal) => hasClade(animal, "Crocodylia"))
      && hasClade(round.outsider, "Reptilia");
  }
  return true;
}

function hasClade(animal, clade) {
  return animal.clades.includes(clade);
}

function hasInterestingContrast(round) {
  if (surpriseClades.has(round.sharedClade) || expertClades.has(round.sharedClade)) return true;

  const rank = rankForSharedTaxon(round.pair[0], round.pair[1], round.sharedClade);
  if (!rank) return !tooBroadContextClades.has(parentSharedClade(round.pair[0], round.pair[1], round.sharedClade));

  const rankIndex = taxonomyRanks.indexOf(rank);
  const requiredRank = taxonomyRanks[rankIndex - 1];
  const requiredValue = round.pair[0].taxonomy[requiredRank];

  if (!requiredValue || tooBroadContextClades.has(requiredValue)) return false;
  return rankIndex >= taxonomyRanks.indexOf("order");
}

function passesContextRule(round) {
  const rank = rankForSharedTaxon(round.pair[0], round.pair[1], round.sharedClade);
  if (!rank) return passesModernCladeContextRule(round);

  const rankIndex = taxonomyRanks.indexOf(rank);
  if (rankIndex <= 0) return false;

  const requiredRank = taxonomyRanks[rankIndex - 1];
  const requiredValue = round.pair[0].taxonomy[requiredRank];
  if (tooBroadContextClades.has(requiredValue)) return false;
  return Boolean(requiredValue)
    && round.pair[1].taxonomy[requiredRank] === requiredValue
    && round.outsider.taxonomy[requiredRank] === requiredValue;
}

function passesModernCladeContextRule(round) {
  const requiredClade = parentSharedClade(round.pair[0], round.pair[1], round.sharedClade);
  if (!requiredClade || tooBroadContextClades.has(requiredClade)) return false;
  return round.outsider.clades.includes(requiredClade);
}

function parentSharedClade(left, right, sharedClade) {
  const leftIndex = left.clades.indexOf(sharedClade);
  const rightIndex = right.clades.indexOf(sharedClade);
  if (leftIndex <= 0 || rightIndex <= 0) return null;

  for (let index = Math.min(leftIndex, rightIndex) - 1; index >= 0; index -= 1) {
    const clade = left.clades[index];
    if (right.clades.includes(clade)) return clade;
  }
  return null;
}

function rankForSharedTaxon(left, right, sharedTaxon) {
  for (let index = taxonomyRanks.length - 1; index >= 0; index -= 1) {
    const rank = taxonomyRanks[index];
    if (left.taxonomy[rank] === sharedTaxon && right.taxonomy[rank] === sharedTaxon) {
      return rank;
    }
  }
  return null;
}

function mostRecentSharedClade(left, right) {
  let best = { clade: "Animalia", score: 0 };
  left.clades.forEach((clade, index) => {
    const rightIndex = right.clades.indexOf(clade);
    if (rightIndex === -1) return;
    const score = Math.min(index, rightIndex);
    if (score >= best.score) best = { clade, score };
  });
  return best;
}

function sharedPathFor(left, right) {
  return left.clades.filter((clade) => right.clades.includes(clade));
}

function estimateDifficulty(round) {
  const shared = round.sharedClade;
  const animalNames = round.pair.concat(round.outsider).map((animal) => animal.id);
  if (["Canis", "Equus", "Anatidae", "Lepidoptera", "Panthera", "Ursus"].includes(shared)) return 1;
  if (["Felidae", "Bovidae", "Canidae", "Equidae", "Decapoda", "Crocodylia", "Anura", "Salmonidae"].includes(shared)) return 2;
  if (animalNames.some((id) => ["dolphin", "seal", "great-white-shark", "rabbit", "bat"].includes(id))) return 3;
  if (surpriseClades.has(shared)) return 4;
  if (expertClades.has(shared)) return 5;
  if (broadTeachingClades.has(shared)) return 3;
  return 3;
}

function chooseCandidate(candidates) {
  if (!candidates.length) {
    throw new Error("No valid taxonomy outsider rounds could be generated from the animal pool.");
  }

  const levelGroups = groupBy(candidates, (candidate) => candidate.level);
  const level = weightedRandom([...levelGroups].map(([candidateLevel, levelCandidates]) => ({
    item: candidateLevel,
    weight: levelWeight(candidateLevel, levelCandidates)
  })));
  const levelCandidates = levelGroups.get(level);
  const branchGroups = groupBy(levelCandidates, (candidate) => candidate.sharedClade);
  const branch = weightedRandom([...branchGroups].map(([sharedClade, branchCandidates]) => ({
    item: sharedClade,
    weight: branchWeight(sharedClade, branchCandidates)
  })));
  const branchCandidates = branchGroups.get(branch);
  const candidate = weightedRandom(branchCandidates.map((branchCandidate) => ({
    item: branchCandidate,
    weight: candidateWeight(branchCandidate)
  })));

  return { ...candidate, choices: shuffle(candidate.choices) };
}

function levelWeight(level, candidates) {
  const baseWeights = new Map([
    [1, 4],
    [2, 4],
    [3, 3],
    [4, 2],
    [5, 1]
  ]);
  return (baseWeights.get(level) ?? 1) * Math.min(6, Math.sqrt(candidates.length));
}

function branchWeight(sharedClade, candidates) {
  let weight = 1 + Math.min(4, Math.sqrt(candidates.length));
  if (surpriseClades.has(sharedClade)) weight += 2;
  if (expertClades.has(sharedClade)) weight += 1;
  if (broadTeachingClades.has(sharedClade)) weight *= 0.5;
  return weight;
}

function candidateWeight(candidate) {
  const shared = candidate.sharedClade;
  if (surpriseClades.has(shared) || expertClades.has(shared)) return 5;
  if (candidate.level >= 4) return 4;
  if (candidate.level === 3) return 3;
  return 1;
}

function groupBy(items, keyForItem) {
  const groups = new Map();
  for (const item of items) {
    const key = keyForItem(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function weightedRandom(options) {
  const totalWeight = options.reduce((total, option) => total + option.weight, 0);
  let cursor = Math.random() * totalWeight;
  for (const option of options) {
    cursor -= option.weight;
    if (cursor <= 0) return option.item;
  }
  return options[options.length - 1].item;
}

function rememberRound(round) {
  state.recentRoundKeys.push(roundKey(round));
  state.recentRoundKeys = state.recentRoundKeys.slice(-maxRecentRounds);
}

function isRecentRound(round) {
  return state.recentRoundKeys.includes(roundKey(round));
}

function roundKey(round) {
  return round.choices.map((animal) => animal.id).sort().join("|");
}

function describeTaxon(name) {
  return taxonInfo[name] ?? inferredTaxonInfo(name);
}

function renderSharedCladeSentence(clade, info) {
  return `${renderInlineTaxon(clade, info)}: ${info.kidExplanation.toLowerCase()}`;
}

function renderTaxonSummary(clade, info) {
  return `
    <strong>${clade}</strong>
    <span><strong>Rank:</strong> ${info.rank}</span>
    <span><strong>Name origin:</strong> "${info.literalMeaning}"</span>
    <span><strong>Typical traits:</strong> ${info.kidExplanation}</span>
    <span><strong>Examples:</strong> ${examplesForTaxon(clade, info).join(", ")}</span>
  `;
}

function renderInlineTaxon(clade, info) {
  return `<strong>${clade}</strong> (${info.rank.toLowerCase()}, "${info.literalMeaning}")`;
}

function inferredTaxonInfo(name) {
  const examples = taxonExamples.get(name) ?? [];
  const rank = taxonRanks.get(name) ?? "Branch";
  const exampleText = examples.length ? sampleExamples(examples).join(", ") : "animals in this branch";
  return {
    rank,
    literalMeaning: "scientific branch name",
    kidExplanation: `A taxonomy branch used here to group ${exampleText}.`,
    examples: examples.length ? examples : ["Animals in this branch"]
  };
}

function buildTaxonExamples() {
  const examples = new Map();
  for (const animal of animals) {
    for (const name of taxonomyNamesForAnimal(animal)) {
      if (!examples.has(name)) examples.set(name, []);
      const names = examples.get(name);
      if (!names.includes(animal.commonName)) names.push(animal.commonName);
    }
  }
  return examples;
}

function examplesForTaxon(name, info) {
  const poolExamples = taxonExamples.get(name) ?? [];
  if (poolExamples.length) return sampleExamples(poolExamples);
  return sampleExamples(info.examples);
}

function sampleExamples(examples) {
  return shuffle(examples).slice(0, 3);
}

function buildTaxonRanks() {
  const ranks = new Map();
  for (const animal of animals) {
    for (const [rank, name] of Object.entries(animal.taxonomy)) {
      ranks.set(name, titleCase(rank));
    }
  }
  for (const [name, info] of Object.entries(taxonInfo)) {
    ranks.set(name, info.rank);
  }
  return ranks;
}

function taxonomyNamesForAnimal(animal) {
  return new Set([...animal.clades, ...Object.values(animal.taxonomy)]);
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function findParallelBranch(animal, sharedParentClade, pairBranchClade) {
  const parentIndex = animal.clades.indexOf(sharedParentClade);
  if (parentIndex === -1) return null;

  const pairInfo = describeTaxon(pairBranchClade);
  const targetRank = pairInfo?.rank.toLowerCase();
  if (taxonomyRanks.includes(targetRank) && animal.taxonomy[targetRank] && animal.taxonomy[targetRank] !== sharedParentClade) {
    const taxonName = animal.taxonomy[targetRank];
    return {
      name: taxonName,
      info: describeTaxon(taxonName)
    };
  }

  const nextClade = animal.clades[parentIndex + 1];
  if (!nextClade || nextClade === pairBranchClade) return null;
  return {
    name: nextClade,
    info: describeTaxon(nextClade)
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}
