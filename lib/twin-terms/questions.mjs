/* Twin Terms question pool: the 58 active terminology pairs from the
 * two-hints-pool-v3 database (~/workspace/two-hints-200/two-hints-pool-v3.md).
 * Each pair hands the player two words from one field's own vocabulary;
 * the specific answer is the field they both belong to, and it may be a
 * phrase. Each pair also carries one of the six general categories from
 * categories.mjs — that category is the graded answer. The game opens
 * with the six categories as choices; giving up swaps those choices for
 * the specific answers below, so the player still learns the specific
 * term. The 39 parked borderline pairs are deliberately NOT in here —
 * they wait for later calibration. Difficulty is unassigned in the
 * source pool, so the game deals the whole pool and offers no difficulty
 * picker.
 *
 * Distractor rule for the give-up choices: the specific answer plus
 * three other specific answers, except the named rivals below — pairs
 * where another answer could be defended as correct (a game vs its
 * close cousin, wave vs light). Adjacent answers that are merely hard
 * are fair distractors, not rivals. */

export const PAIRS = [
  { id: "times-product", hints: ["times", "product"], answer: "Multiplication", category: "math", why: "In multiplication, “times” is the operation and “product” is what you get." },
  { id: "diamond-mound", hints: ["diamond", "mound"], answer: "Baseball", category: "games", why: "A baseball field has a diamond and a pitcher’s mound." },
  { id: "corner-degree", hints: ["corner", "degree"], answer: "Angle", category: "math", why: "An angle is measured in degrees, and it makes a corner." },
  { id: "crust-mantle", hints: ["crust", "mantle"], answer: "Earth’s layers", category: "science", why: "The crust and the mantle are layers of the Earth." },
  { id: "mirror-fold", hints: ["mirror", "fold"], answer: "Symmetry", category: "math", why: "A shape has symmetry when one side mirrors the other across a fold line." },
  { id: "reed-keys", hints: ["reed", "keys"], answer: "Woodwind instruments", category: "arts", why: "Woodwind instruments play with a vibrating reed and keys." },
  { id: "foil-lunge", hints: ["foil", "lunge"], answer: "Fencing", category: "games", why: "Fencers fight with a foil and attack with a lunge." },
  { id: "pedal-hammer", hints: ["pedal", "hammer"], answer: "Piano", category: "arts", why: "Inside a piano, pedals and hammers work together to make sound." },
  { id: "bar-pie", hints: ["bar", "pie"], answer: "Charts", category: "math", why: "A bar chart and a pie chart are two ways to show data." },
  { id: "fault-plate", hints: ["fault", "plate"], answer: "Earthquake", category: "science", why: "Earthquakes happen when Earth’s plates shift along a fault." },
  { id: "mass-volume", hints: ["mass", "volume"], answer: "Density", category: "science", why: "Density is mass divided by volume." },
  { id: "subject-object", hints: ["subject", "object"], answer: "Grammar", category: "society", why: "In grammar, a sentence has a subject and an object." },
  { id: "fork-pin", hints: ["fork", "pin"], answer: "Chess tactics", category: "games", why: "In chess, a fork attacks two pieces at once and a pin stops one from moving." },
  { id: "bluff-raise", hints: ["bluff", "raise"], answer: "Poker", category: "games", why: "In poker, players bluff and raise their bets." },
  { id: "trump-trick", hints: ["trump", "trick"], answer: "Card games", category: "games", why: "In many card games, a trump suit wins tricks." },
  { id: "seed-bracket", hints: ["seed", "bracket"], answer: "Tournaments", category: "games", why: "Tournaments seed the top players and arrange matches in a bracket." },
  { id: "legend-scale", hints: ["legend", "scale"], answer: "Maps", category: "life", why: "A map’s legend explains its symbols, and its scale shows real distances." },
  { id: "bull-bear", hints: ["bull", "bear"], answer: "Stock market", category: "society", why: "In the stock market, a bull market rises and a bear market falls." },
  { id: "interest-principal", hints: ["interest", "principal"], answer: "Loans", category: "society", why: "A loan charges interest on the principal you borrowed." },
  { id: "front-pressure", hints: ["front", "pressure"], answer: "Weather", category: "science", why: "Weather maps track fronts and air pressure." },
  { id: "school-pod", hints: ["school", "pod"], answer: "Animal groups", category: "science", why: "A school of fish and a pod of dolphins are groups of animals." },
  { id: "bug-patch", hints: ["bug", "patch"], answer: "Software", category: "science", why: "A patch is released to fix a bug in software." },
  { id: "virus-worm", hints: ["virus", "worm"], answer: "Malware", category: "science", why: "Viruses and worms are types of malware." },
  { id: "resume-cover", hints: ["resume", "cover"], answer: "Job application", category: "society", why: "A job application pairs a resume with a cover letter." },
  { id: "plot-setting", hints: ["plot", "setting"], answer: "Story elements", category: "arts", why: "Every story has a plot and a setting." },
  { id: "half-quarter", hints: ["half", "quarter"], answer: "Fractions", category: "math", why: "A half and a quarter are fractions." },
  { id: "rare-medium", hints: ["rare", "medium"], answer: "Steak", category: "life", why: "Rare and medium are ways to cook a steak." },
  { id: "lead-follow", hints: ["lead", "follow"], answer: "Partner dancing", category: "arts", why: "In partner dancing, one person leads and the other follows." },
  { id: "base-power", hints: ["base", "power"], answer: "Exponents", category: "math", why: "In an exponent, the base is raised to a power." },
  { id: "derivative-integral", hints: ["derivative", "integral"], answer: "Calculus", category: "math", why: "The derivative and the integral are calculus’s two inverse operations." },
  { id: "slope-intercept", hints: ["slope", "intercept"], answer: "Linear equations", category: "math", why: "Slope-intercept form describes a straight line." },
  { id: "precision-accuracy", hints: ["precision", "accuracy"], answer: "Measurement", category: "science", why: "In measurement, precision means consistent repeats and accuracy means close to the true value." },
  { id: "pole-field", hints: ["pole", "field"], answer: "Magnetism", category: "science", why: "A magnet has poles and a magnetic field." },
  { id: "crest-trough", hints: ["crest", "trough"], answer: "Waves", category: "science", why: "The crest and the trough are the top and bottom of a wave." },
  { id: "wave-particle", hints: ["wave", "particle"], answer: "Light", category: "science", why: "Light behaves as both a wave and a particle." },
  { id: "element-compound", hints: ["element", "compound"], answer: "Chemistry", category: "science", why: "In chemistry, elements combine into compounds." },
  { id: "order-family", hints: ["order", "family"], answer: "Taxonomy", category: "science", why: "Order and family are ranks in taxonomy, the science of classifying living things." },
  { id: "carrier-trait", hints: ["carrier", "trait"], answer: "Genetics", category: "science", why: "In genetics, a carrier holds a gene for a trait." },
  { id: "beat-scoop", hints: ["beat", "scoop"], answer: "Journalism", category: "society", why: "A reporter’s beat is their topic, and a scoop is an exclusive story." },
  { id: "person-number", hints: ["person", "number"], answer: "Conjugation", category: "society", why: "Verbs change by person and number when you conjugate them." },
  { id: "stress-meter", hints: ["stress", "meter"], answer: "Poetry", category: "arts", why: "In poetry, stress and meter make the rhythm." },
  { id: "hook-bridge", hints: ["hook", "bridge"], answer: "Songwriting", category: "arts", why: "A song’s hook catches you, and its bridge connects its parts." },
  { id: "score-arrangement", hints: ["score", "arrangement"], answer: "Music composition", category: "arts", why: "A composer writes a score, and an arranger makes an arrangement." },
  { id: "dress-tech", hints: ["dress", "tech"], answer: "Theater", category: "arts", why: "The dress rehearsal and the tech rehearsal are theater’s final rehearsals." },
  { id: "trailer-teaser", hints: ["trailer", "teaser"], answer: "Movie marketing", category: "arts", why: "A teaser comes early and short; a trailer comes later and longer." },
  { id: "reference-circulation", hints: ["reference", "circulation"], answer: "Library", category: "society", why: "A library has a reference desk and a circulation desk." },
  { id: "court-appeal", hints: ["court", "appeal"], answer: "Law", category: "society", why: "In law, you appeal to a higher court." },
  { id: "balance-statement", hints: ["balance", "statement"], answer: "Bank account", category: "society", why: "Your bank statement shows your account balance." },
  { id: "audit-return", hints: ["audit", "return"], answer: "Taxes", category: "society", why: "Taxes are filed on a return, and an audit checks it." },
  { id: "charge-plea", hints: ["charge", "plea"], answer: "Criminal trial", category: "society", why: "In a criminal trial, the charge is answered with a plea." },
  { id: "stock-reduce", hints: ["stock", "reduce"], answer: "Sauces", category: "life", why: "A sauce starts with stock and finishes by reducing." },
  { id: "crown-king", hints: ["crown", "king"], answer: "Checkers", category: "games", why: "In checkers, a piece is crowned and becomes a king." },
  { id: "prune-graft", hints: ["prune", "graft"], answer: "Gardening", category: "life", why: "Pruning and grafting are gardening techniques." },
  { id: "prime-coat", hints: ["prime", "coat"], answer: "House painting", category: "life", why: "When painting a house, you prime first, then coat." },
  { id: "stud-beam", hints: ["stud", "beam"], answer: "Construction", category: "life", why: "Studs and beams frame a building." },
  { id: "shot-booster", hints: ["shot", "booster"], answer: "Vaccines", category: "science", why: "A vaccine starts with a shot and follows with a booster." },
];

const byId = new Map(PAIRS.map((pair) => [pair.id, pair]));

/* Answers that could be defended as correct for another pair's hints.
 * Both directions are listed so the exclusion holds whichever side is
 * the question. */
export const RIVALS = {
  "Poker": ["Card games"],
  "Card games": ["Poker"],
  "Checkers": ["Chess tactics"],
  "Chess tactics": ["Checkers"],
  "Waves": ["Light"],
  "Light": ["Waves"],
};

export function pairById(id) {
  return byId.get(id) || null;
}

function shuffle(items) {
  const rest = [...items];
  for (let index = rest.length - 1; index > 0; index -= 1) {
    const pick = Math.floor(Math.random() * (index + 1));
    [rest[index], rest[pick]] = [rest[pick], rest[index]];
  }
  return rest;
}

/* Deal one pair the player has not just seen. The no-repeat preference
 * never shrinks the pool to nothing: when every pair was recently seen,
 * the full pool deals again. */
export function dealPair(avoidIds = []) {
  const avoid = new Set(avoidIds);
  const fresh = PAIRS.filter((pair) => !avoid.has(pair.id));
  const pool = fresh.length ? fresh : PAIRS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* The answers a pair may be confused with: every other answer except its
 * named rivals. */
export function eligibleDistractors(pair) {
  const rivals = new Set(RIVALS[pair.answer] || []);
  return PAIRS.filter(
    (candidate) => candidate.answer !== pair.answer && !rivals.has(candidate.answer),
  ).map((candidate) => candidate.answer);
}

/* Four options for the give-up reveal: the answer plus three distinct
 * eligible distractors, shuffled so the answer is never in a fixed
 * position. */
export function dealOptions(pair) {
  const distractors = shuffle(eligibleDistractors(pair)).slice(0, 3);
  return shuffle([pair.answer, ...distractors]);
}
