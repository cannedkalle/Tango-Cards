export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const RELATED_CATEGORIES = new Set([
  'Books & Stories|Shows',
  'Books & Stories|Stories & Characters',
  'Communication|Internet',
  'Communication|Technology',
  'Drinks|Food',
  'Entertainment|Music',
  'Everyday|Home',
  'Everyday|Kitchen',
  'Games|Stories & Characters',
  'Games|Stories & Games',
  'Games|Toys',
  'Home|Kitchen',
  'Medicine|Science',
  'Navigation|Transport',
  'Places|Travel',
  'Play|Sports',
  'Play|Toys',
  'School|Crafts',
  'Space|Science',
  'Stories & Characters|Shows',
  'Stories & Characters|Stories & Games',
  'Technology|Internet',
  'Technology|Transport'
]);

const RECENT_CROSS_CATEGORY_WINDOW = 75;

function crossCategoryWindow(a, b) {
  const latestYear = Math.max(a.yearStart, b.yearStart);
  // Historical dates are fuzzier and interesting contrasts remain useful across
  // longer spans. The newer object controls the expansion, so an ancient object
  // still cannot pair arbitrarily with a modern laptop or smartphone.
  const ancientBonus = Math.max(0, 1950 - latestYear) * 0.3;
  return RECENT_CROSS_CATEGORY_WINDOW + ancientBonus;
}

function categoryPair(a, b) {
  return [a, b].sort().join('|');
}

/** Score a future comparison: higher means more naturally connected. */
export function comparisonScore(a, b) {
  if (!a || !b || a.id === b.id) return 0;
  const tagsA = new Set(a.comparisonTags || []);
  if ((b.comparisonTags || []).some(tag => tagsA.has(tag))) return 4;
  if (a.category === b.category) return 3;
  if (RELATED_CATEGORIES.has(categoryPair(a.category, b.category))) return 2;
  // A close-in-time contrast can be fun even when the objects live in different domains.
  // This catches pairs such as a rocket and a Rubik’s Cube without opening the door to
  // arbitrary ancient-versus-modern pairings such as paper and a laptop.
  const distance = Math.abs(a.yearStart - b.yearStart);
  return distance <= crossCategoryWindow(a, b) ? 1 : 0;
}

/** Return whether two objects are a sensible candidate for a future comparison. */
export function isFunComparison(a, b) {
  return comparisonScore(a, b) > 0;
}

/** Build chronologically valid candidate pairs before an editor adds facts and sources. */
export function buildFunComparisonCandidates(objects) {
  const candidates = [];
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i], b = objects[j];
      if (!isFunComparison(a, b)) continue;
      const earlierObjectId = a.yearEnd < b.yearStart ? a.id : b.yearEnd < a.yearStart ? b.id : null;
      if (earlierObjectId) candidates.push({ objectAId: a.id, objectBId: b.id, earlierObjectId });
    }
  }
  return candidates;
}

/** Build every clearly ordered pair for Wild mode, including oddball contrasts. */
export function buildWildComparisonPairs(objects) {
  const pairs = [];
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i], b = objects[j];
      const earlierObjectId = a.yearEnd < b.yearStart ? a.id : b.yearEnd < a.yearStart ? b.id : null;
      if (earlierObjectId) {
        pairs.push({
          id: `wild-${a.id}--${b.id}`,
          objectAId: a.id,
          objectBId: b.id,
          earlierObjectId
        });
      }
    }
  }
  return pairs;
}

export function validateContent({ objects, pairs, sources }) {
  function index(items, label) {
    if (!Array.isArray(items) || !items.length) throw new Error(`Missing ${label}`);
    const map = new Map();
    for (const item of items) {
      if (!item.id || map.has(item.id)) throw new Error(`Invalid or duplicate ${label} ID`);
      map.set(item.id, item);
    }
    return map;
  }
  const objectMap = index(objects, 'objects');
  const sourceMap = index(sources, 'sources');
  index(pairs, 'pairs');
  const hasSources = ids => Array.isArray(ids) && ids.length && ids.every(id => sourceMap.has(id));
  for (const source of sources) {
    if (!/^https:\/\//.test(source.url) || !source.title || !source.publisher || !source.claimSupported || !source.accessedOn) throw new Error(`Invalid source: ${source.id}`);
  }
  for (const object of objects) {
    if (!object.name || !object.icon || !object.kidDefinition || !object.dateDisplay || !object.dateBasis ||
        !Number.isInteger(object.yearStart) || !Number.isInteger(object.yearEnd) || object.yearStart > object.yearEnd || !hasSources(object.dateSourceIds)) {
      throw new Error(`Invalid object: ${object.id}`);
    }
  }
  const combinations = new Set();
  for (const pair of pairs) {
    const a = objectMap.get(pair.objectAId), b = objectMap.get(pair.objectBId);
    const key = [pair.objectAId, pair.objectBId].sort().join('|');
    if (!a || !b || a === b || combinations.has(key)) throw new Error(`Invalid pair: ${pair.id}`);
    combinations.add(key);
    const earlier = a.yearEnd < b.yearStart ? a.id : b.yearEnd < a.yearStart ? b.id : null;
    if (!earlier || pair.earlierObjectId !== earlier || !pair.funFact || !hasSources(pair.factSourceIds)) throw new Error(`Unclear chronology or missing fact: ${pair.id}`);
  }
  return { objectMap, sourceMap };
}

export function createGame(pairs, random = Math.random) {
  if (!pairs.length) throw new Error('At least one pair is required');
  let deck = [], current = null, selected = null, lastId = null, correct = 0, answered = 0, cycle = 0, position = 0;
  let choices = [];
  function snapshot() {
    return { pair: current, choices: [...choices], selected, correct, answered, cycle, position, total: pairs.length };
  }
  function next() {
    if (current && selected === null) return snapshot();
    if (!deck.length) {
      deck = shuffle(pairs, random);
      if (deck.length > 1 && deck[0].id === lastId) [deck[0], deck[1]] = [deck[1], deck[0]];
      cycle++; position = 0;
    }
    current = deck.shift(); lastId = current.id; position++; selected = null;
    choices = shuffle([current.objectAId, current.objectBId], random);
    return snapshot();
  }
  return {
    snapshot,
    next,
    answer(id) {
      if (!current || selected !== null || !choices.includes(id)) return null;
      selected = id; answered++;
      if (id === current.earlierObjectId) correct++;
      return snapshot();
    },
    reset() {
      deck = []; current = null; selected = null; correct = 0; answered = 0; cycle = 0; position = 0;
      // Keep lastId so a reset does not immediately show the same question.
      return next();
    }
  };
}
