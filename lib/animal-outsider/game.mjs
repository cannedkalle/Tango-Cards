/* Pure game engine for Animal Outsider, ported from the standalone game's
 * main.js. No DOM, no module state, no Node.js use: the React component
 * owns the round state and passes the active pool plus the recent-round
 * keys in. Every rule below matches the standalone game exactly. */

import { animals } from "./animals.mjs";
import { taxonInfo } from "./taxa.mjs";

const surpriseClades = new Set(["Artiodactyla", "Whippomorpha", "Afrotheria", "Blattodea", "Crustacea"]);
const expertClades = new Set(["Archosauria", "Dinosauria"]);
const broadTeachingClades = new Set(["Animalia", "Chordata", "Tetrapoda", "Amniota"]);
const tooBroadOutsiderClades = new Set(["Animalia", "Chordata"]);
const tooBroadContextClades = new Set(["Animalia", "Chordata", "Tetrapoda", "Amniota"]);
const taxonomyRanks = ["kingdom", "phylum", "class", "order", "family", "genus", "species"];
const formalRankScales = new Map([
  ["Kingdom", "broadest formal rank in this game"],
  ["Phylum", "below kingdom, above class-level groups"],
  ["Subphylum", "below phylum, above class-level groups"],
  ["Superclass", "below phylum, above class"],
  ["Class", "below phylum, above order-level groups"],
  ["Subclass", "below class, above order-level groups"],
  ["Infraclass", "below class, above order-level groups"],
  ["Superorder", "below class, above order"],
  ["Order", "below class, above family-level groups"],
  ["Suborder", "below order, above family-level groups"],
  ["Infraorder", "below order, above family-level groups"],
  ["Parvorder", "below order, above family-level groups"],
  ["Superfamily", "below order, above family"],
  ["Family", "below order, above genus-level groups"],
  ["Subfamily", "below family, above genus-level groups"],
  ["Tribe", "below family, above genus-level groups"],
  ["Genus", "below family, above species"],
  ["Species", "most specific formal rank in this game"]
]);

const taxonExamples = buildTaxonExamples();
const taxonRanks = buildTaxonRanks();
const taxonContexts = buildTaxonContexts();

/* Deal one round from the pool, skipping rounds whose key is in
 * recentKeys. The caller owns the recent-keys window (the standalone game
 * kept the last 18). Throws when no valid round exists, as before. */
export function generateRound(pool, recentKeys) {
  const candidates = [];
  const maxAttempts = 3500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const choices = randomTripleFromPool(pool);
    const candidate = buildCandidateRound(choices);
    if (!candidate) continue;
    if (recentKeys.includes(roundKey(candidate))) continue;
    candidates.push(candidate);
    if (candidates.length >= 48) break;
  }

  if (candidates.length) return chooseCandidate(candidates);
  return chooseCandidate(buildCandidatePool(pool, recentKeys));
}

export function roundKey(round) {
  return round.choices.map((animal) => animal.id).sort().join("|");
}

function randomTripleFromPool(pool) {
  const first = randomItem(pool);
  let second = randomItem(pool);
  let third = randomItem(pool);
  while (second.id === first.id) second = randomItem(pool);
  while (third.id === first.id || third.id === second.id) third = randomItem(pool);
  return [first, second, third];
}

function buildCandidatePool(pool, recentKeys) {
  const candidates = [];
  for (let i = 0; i < pool.length - 2; i += 1) {
    for (let j = i + 1; j < pool.length - 1; j += 1) {
      for (let k = j + 1; k < pool.length; k += 1) {
        const candidate = buildCandidateRound([pool[i], pool[j], pool[k]]);
        if (!candidate) continue;
        if (recentKeys.includes(roundKey(candidate))) continue;
        candidates.push(candidate);
      }
    }
  }
  return candidates;
}

export function buildCandidateRound(choices) {
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

export function analyzeTriple(choices) {
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

export function mostRecentSharedClade(left, right) {
  let best = { clade: "Animalia", score: 0 };
  left.clades.forEach((clade, index) => {
    const rightIndex = right.clades.indexOf(clade);
    if (rightIndex === -1) return;
    const score = Math.min(index, rightIndex);
    if (score >= best.score) best = { clade, score };
  });
  return best;
}

export function sharedPathFor(left, right) {
  return left.clades.filter((clade) => right.clades.includes(clade));
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

function hasClade(animal, clade) {
  return animal.clades.includes(clade);
}

export function estimateDifficulty(round) {
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

export function passesDifficultyRules(round) {
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

export function shuffle(items) {
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

/* Taxonomy presentation data: curated entries, with inferred fallbacks for
 * the branches the audit notes lack curated introductions. */

export function describeTaxon(name) {
  return taxonInfo[name] ?? inferredTaxonInfo(name);
}

export function taxonDetails(name, info) {
  const context = taxonContexts.get(name);
  const rank = info.rank ?? context?.rank ?? "Branch";
  const isGenericClade = rank === "Clade";
  const isFallbackBranch = rank === "Branch";
  const rankLabel = isGenericClade ? "Unranked clade" : isFallbackBranch ? "Inferred branch" : rank;
  const rankStatus = info.rankStatus
    ?? (isGenericClade ? "unranked clade" : isFallbackBranch ? "inferred from this game tree" : "formal taxonomic rank");
  const scaleLabel = info.scale
    ?? context?.scale
    ?? formalRankScales.get(rank)
    ?? "position inferred from this game tree";
  return { rankLabel, rankStatus, scaleLabel };
}

function inferredTaxonInfo(name) {
  const examples = taxonExamples.get(name) ?? [];
  const rank = taxonRanks.get(name) ?? "Branch";
  const context = taxonContexts.get(name);
  const exampleText = examples.length ? sampleExamples(examples).join(", ") : "animals in this branch";
  return {
    rank,
    rankStatus: rank === "Branch" ? "inferred from this game tree" : undefined,
    scale: context?.scale,
    literalMeaning: "scientific branch name",
    kidExplanation: `A taxonomy branch used here to group ${exampleText}.`,
    examples: examples.length ? examples : ["Animals in this branch"]
  };
}

export function examplesForTaxon(name, info) {
  const poolExamples = taxonExamples.get(name) ?? [];
  if (poolExamples.length) return sampleExamples(poolExamples);
  return sampleExamples(info.examples);
}

function sampleExamples(examples) {
  return shuffle(examples).slice(0, 3);
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

function buildTaxonContexts() {
  const contexts = new Map();
  for (const animal of animals) {
    const rankedPositions = taxonomyRanks
      .map((rank) => ({
        rank: titleCase(rank),
        name: animal.taxonomy[rank],
        index: animal.clades.indexOf(animal.taxonomy[rank])
      }))
      .filter((item) => item.name && item.index !== -1);

    for (const [index, name] of animal.clades.entries()) {
      const context = contexts.get(name) ?? { before: new Map(), after: new Map() };
      const before = [...rankedPositions].reverse().find((item) => item.index < index);
      const after = rankedPositions.find((item) => item.index > index);
      if (before) addContextVote(context.before, `${before.rank} ${before.name}`);
      if (after) addContextVote(context.after, `${after.rank} ${after.name}`);
      contexts.set(name, context);
    }
  }

  const resolved = new Map();
  for (const [name, context] of contexts.entries()) {
    const before = mostCommonContext(context.before);
    const after = mostCommonContext(context.after);
    resolved.set(name, {
      scale: scaleFromContext(before, after)
    });
  }
  return resolved;
}

function addContextVote(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function mostCommonContext(map) {
  return [...map.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "";
}

function scaleFromContext(before, after) {
  if (before && after) return `below ${before}, above ${rankLevel(after)}`;
  if (before) return `below ${before}`;
  if (after) return `above ${rankLevel(after)}`;
  return "position inferred from this game tree";
}

function rankLevel(value) {
  const rank = value.split(" ")[0].toLowerCase();
  return `${rank}-level groups`;
}

function taxonomyNamesForAnimal(animal) {
  return new Set([...animal.clades, ...Object.values(animal.taxonomy)]);
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function findParallelBranch(animal, sharedParentClade, pairBranchClade) {
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
