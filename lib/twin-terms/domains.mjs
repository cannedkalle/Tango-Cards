/* Twin Terms domains: the database behind the game, restructured
 * 2026-10-26 from a list of premade pairs into domains with terms.
 *
 * The database checks which terms are legit; the dealer (questions.mjs)
 * matches them into questions at deal time. A domain with n terms yields
 * n(n-1)/2 questions, so every newly vetted term pays for itself several
 * times over.
 *
 * A term is admitted only if it passes the pool standard:
 * - almost context-free on its own (several familiar meanings);
 * - its domain sense is the less dominant one (never birdie/wicket: a
 *   term whose dominant meaning already is the domain fails);
 * - it is the field's terminology or its named furniture, not a member
 *   noun (guitar/violin stay out) and not a descriptive trait;
 * - it reads as a noun co-occurring in the domain's situation, not as a
 *   verb acting on the other hint (the phrase test: "second a motion"
 *   and "advance against royalties" failed it and were removed).
 * A generated pair is valid only if exactly one domain claims both its
 * terms (the rival-kill rule, enforced mechanically by the dealer) and
 * it is not on PAIR_BLOCKLIST (for phrase pairs found after generation).
 *
 * Each term carries a gloss: a short predicate completing
 * "{Term} {gloss}." The reveal composes the pair's explanation from the
 * two glosses, so no pair needs a prewritten line.
 *
 * Source: the v3 terminology pool (~/workspace/two-hints-200/
 * two-hints-pool-v3.md) as amended 2026-10-26 (motion + second and
 * advance + royalty removed as phrase pairs). Third terms were mined
 * 2026-10-26 under the same standard; their vetting notes live in
 * ~/workspace/twin-terms-domains-v1.md. */

export const DOMAINS = [
  {
    id: "baseball",
    answer: "Baseball",
    category: "games",
    terms: [
      { word: "diamond", gloss: "is the shape of the infield" },
      { word: "mound", gloss: "is where the pitcher stands" },
      { word: "foul", gloss: "marks the out-of-play territory" },
    ],
  },
  {
    id: "fencing",
    answer: "Fencing",
    category: "games",
    terms: [
      { word: "foil", gloss: "is the light sword fencers use" },
      { word: "lunge", gloss: "is the forward attacking step" },
      { word: "bout", gloss: "is one match" },
    ],
  },
  {
    id: "chess-tactics",
    answer: "Chess tactics",
    category: "games",
    terms: [
      { word: "fork", gloss: "attacks two pieces at once" },
      { word: "pin", gloss: "stops one piece from moving" },
      { word: "skewer", gloss: "attacks through the front piece to the one behind" },
    ],
  },
  {
    id: "poker",
    answer: "Poker",
    category: "games",
    terms: [
      { word: "bluff", gloss: "pretends a weak hand is strong" },
      { word: "raise", gloss: "increases the bet" },
      { word: "dealer", gloss: "hands out the cards" },
    ],
  },
  {
    id: "card-games",
    answer: "Card games",
    category: "games",
    terms: [
      { word: "trump", gloss: "is the suit that beats the others" },
      { word: "trick", gloss: "is a round of cards won together" },
      { word: "hand", gloss: "is the cards one player holds" },
    ],
  },
  {
    id: "tournaments",
    answer: "Tournaments",
    category: "games",
    terms: [
      { word: "seed", gloss: "ranks the strongest players first" },
      { word: "bracket", gloss: "arranges who plays whom" },
      { word: "draw", gloss: "assigns players their places" },
    ],
  },
  {
    id: "checkers",
    answer: "Checkers",
    category: "games",
    terms: [
      { word: "crown", gloss: "turns a piece into a king" },
      { word: "king", gloss: "is the crowned piece that moves both ways" },
      { word: "jump", gloss: "captures by hopping over a piece" },
    ],
  },
  {
    id: "multiplication",
    answer: "Multiplication",
    category: "math",
    terms: [
      { word: "times", gloss: "is the operation" },
      { word: "product", gloss: "is what you get" },
      { word: "factor", gloss: "is a number being multiplied" },
    ],
  },
  {
    id: "angle",
    answer: "Angle",
    category: "math",
    terms: [
      { word: "corner", gloss: "is where two lines meet" },
      { word: "degree", gloss: "measures how wide it opens" },
      { word: "acute", gloss: "is smaller than a right angle" },
    ],
  },
  {
    id: "symmetry",
    answer: "Symmetry",
    category: "math",
    terms: [
      { word: "mirror", gloss: "shows the matching reversed side" },
      { word: "fold", gloss: "creases one side onto the other" },
      { word: "flip", gloss: "turns a shape onto its match" },
    ],
  },
  {
    id: "charts",
    answer: "Charts",
    category: "math",
    terms: [
      { word: "bar", gloss: "shows values as rectangles" },
      { word: "pie", gloss: "shows shares as slices" },
      { word: "label", gloss: "names what each part stands for" },
    ],
  },
  {
    id: "fractions",
    answer: "Fractions",
    category: "math",
    terms: [
      { word: "half", gloss: "is one of two equal parts" },
      { word: "quarter", gloss: "is one of four equal parts" },
      { word: "third", gloss: "is one of three equal parts" },
    ],
  },
  {
    id: "exponents",
    answer: "Exponents",
    category: "math",
    terms: [
      { word: "base", gloss: "is the number being multiplied" },
      { word: "power", gloss: "says how many times" },
      { word: "index", gloss: "is another name for the power" },
    ],
  },
  {
    id: "calculus",
    answer: "Calculus",
    category: "math",
    terms: [
      { word: "derivative", gloss: "measures how fast something changes" },
      { word: "integral", gloss: "adds up small pieces" },
      { word: "limit", gloss: "is the value something approaches" },
    ],
  },
  {
    id: "linear-equations",
    answer: "Linear equations",
    category: "math",
    terms: [
      { word: "slope", gloss: "says how steep the line is" },
      { word: "intercept", gloss: "is where the line crosses an axis" },
      { word: "coordinate", gloss: "names a point by two numbers" },
    ],
  },
  {
    id: "measurement",
    answer: "Measurement",
    category: "science",
    terms: [
      { word: "precision", gloss: "means repeats agree with each other" },
      { word: "accuracy", gloss: "means closeness to the true value" },
      { word: "error", gloss: "is how far a measurement is off" },
    ],
  },
  {
    id: "earths-layers",
    answer: "Earth's layers",
    category: "science",
    terms: [
      { word: "crust", gloss: "is the thin outer skin" },
      { word: "mantle", gloss: "is the thick middle layer" },
      { word: "core", gloss: "is the hot center" },
    ],
  },
  {
    id: "earthquake",
    answer: "Earthquake",
    category: "science",
    terms: [
      { word: "fault", gloss: "is where the ground slips" },
      { word: "plate", gloss: "is a giant slab that moves" },
      { word: "tremor", gloss: "is the shaking felt on the surface" },
    ],
  },
  {
    id: "density",
    answer: "Density",
    category: "science",
    terms: [
      { word: "mass", gloss: "is how much matter there is" },
      { word: "volume", gloss: "is how much space it takes" },
      { word: "float", gloss: "means it stays on top of water" },
    ],
  },
  {
    id: "magnetism",
    answer: "Magnetism",
    category: "science",
    terms: [
      { word: "pole", gloss: "is where the magnet is strongest" },
      { word: "field", gloss: "is the invisible pull around it" },
      { word: "iron", gloss: "is the metal magnets pull hardest" },
    ],
  },
  {
    id: "waves",
    answer: "Waves",
    category: "science",
    terms: [
      { word: "crest", gloss: "is the top of a wave" },
      { word: "trough", gloss: "is the bottom of a wave" },
      { word: "frequency", gloss: "counts waves per second" },
    ],
  },
  {
    id: "light",
    answer: "Light",
    category: "science",
    terms: [
      { word: "wave", gloss: "spreads like a ripple" },
      { word: "particle", gloss: "arrives in tiny packets" },
      { word: "spectrum", gloss: "is light split into colors" },
    ],
  },
  {
    id: "chemistry",
    answer: "Chemistry",
    category: "science",
    terms: [
      { word: "element", gloss: "is one pure substance" },
      { word: "compound", gloss: "combines two or more elements" },
      { word: "reaction", gloss: "rearranges substances into new ones" },
    ],
  },
  {
    id: "taxonomy",
    answer: "Taxonomy",
    category: "science",
    terms: [
      { word: "order", gloss: "groups related families" },
      { word: "family", gloss: "groups close relatives together" },
      { word: "kingdom", gloss: "is the broadest rank" },
    ],
  },
  {
    id: "genetics",
    answer: "Genetics",
    category: "science",
    terms: [
      { word: "carrier", gloss: "holds a gene without showing it" },
      { word: "trait", gloss: "is the feature that gets passed on" },
      { word: "pedigree", gloss: "is a family tree used to trace traits" },
    ],
  },
  {
    id: "weather",
    answer: "Weather",
    category: "science",
    terms: [
      { word: "front", gloss: "is where air masses meet" },
      { word: "pressure", gloss: "is how heavy the air is" },
      { word: "cell", gloss: "is one storm's building block" },
    ],
  },
  {
    id: "animal-groups",
    answer: "Animal groups",
    category: "science",
    terms: [
      { word: "school", gloss: "is a group of fish" },
      { word: "pod", gloss: "is a group of dolphins" },
      { word: "pack", gloss: "is a group of wolves" },
    ],
  },
  {
    id: "software",
    answer: "Software",
    category: "science",
    terms: [
      { word: "bug", gloss: "is a mistake in the code" },
      { word: "patch", gloss: "is a small fix released for it" },
      { word: "version", gloss: "is a numbered release of the program" },
    ],
  },
  {
    id: "malware",
    answer: "Malware",
    category: "science",
    terms: [
      { word: "virus", gloss: "spreads by infecting files" },
      { word: "worm", gloss: "spreads on its own across networks" },
      { word: "trojan", gloss: "hides inside a harmless-looking program" },
    ],
  },
  {
    id: "vaccines",
    answer: "Vaccines",
    category: "science",
    terms: [
      { word: "shot", gloss: "is the injection itself" },
      { word: "booster", gloss: "is the follow-up injection" },
      { word: "dose", gloss: "is one measured amount" },
    ],
  },
  {
    id: "grammar",
    answer: "Grammar",
    category: "society",
    terms: [
      { word: "subject", gloss: "is who or what the sentence is about" },
      { word: "object", gloss: "is what receives the action" },
      { word: "tense", gloss: "shows when the action happens" },
    ],
  },
  {
    id: "stock-market",
    answer: "Stock market",
    category: "society",
    terms: [
      { word: "bull", gloss: "means prices are rising" },
      { word: "bear", gloss: "means prices are falling" },
      { word: "share", gloss: "is one owned piece of a company" },
    ],
  },
  {
    id: "loans",
    answer: "Loans",
    category: "society",
    terms: [
      { word: "interest", gloss: "is the cost of borrowing" },
      { word: "principal", gloss: "is the amount borrowed" },
      { word: "term", gloss: "is how long repayment lasts" },
    ],
  },
  {
    id: "job-application",
    answer: "Job application",
    category: "society",
    terms: [
      { word: "resume", gloss: "lists your experience" },
      { word: "cover", gloss: "is the letter that introduces it" },
      { word: "portfolio", gloss: "shows samples of your work" },
    ],
  },
  {
    id: "journalism",
    answer: "Journalism",
    category: "society",
    terms: [
      { word: "beat", gloss: "is the topic a reporter covers" },
      { word: "scoop", gloss: "is an exclusive story" },
      { word: "source", gloss: "is who gives the reporter information" },
    ],
  },
  {
    id: "conjugation",
    answer: "Conjugation",
    category: "society",
    terms: [
      { word: "person", gloss: "is who is speaking" },
      { word: "number", gloss: "is one or many" },
      { word: "mood", gloss: "shows fact, wish, or command" },
    ],
  },
  {
    id: "library",
    answer: "Library",
    category: "society",
    terms: [
      { word: "reference", gloss: "is where you ask questions" },
      { word: "circulation", gloss: "is where you borrow and return" },
      { word: "catalog", gloss: "lists everything the library holds" },
    ],
  },
  {
    id: "law",
    answer: "Law",
    category: "society",
    terms: [
      { word: "court", gloss: "is where cases are heard" },
      { word: "appeal", gloss: "asks a higher court to reverse" },
      { word: "trial", gloss: "is the hearing itself" },
    ],
  },
  {
    id: "bank-account",
    answer: "Bank account",
    category: "society",
    terms: [
      { word: "balance", gloss: "is what is left in the account" },
      { word: "statement", gloss: "is the record the bank sends" },
      { word: "transaction", gloss: "is any single movement of money" },
    ],
  },
  {
    id: "taxes",
    answer: "Taxes",
    category: "society",
    terms: [
      { word: "audit", gloss: "checks a return for mistakes" },
      { word: "return", gloss: "is the form you file" },
      { word: "refund", gloss: "is money back when you overpaid" },
    ],
  },
  {
    id: "criminal-trial",
    answer: "Criminal trial",
    category: "society",
    terms: [
      { word: "charge", gloss: "is the accusation" },
      { word: "plea", gloss: "is the formal answer" },
      { word: "sentence", gloss: "is the punishment decided" },
    ],
  },
  {
    id: "woodwind-instruments",
    answer: "Woodwind instruments",
    category: "arts",
    terms: [
      { word: "reed", gloss: "vibrates to make the sound" },
      { word: "keys", gloss: "open and close the holes" },
      { word: "bell", gloss: "is the flared end the sound leaves by" },
    ],
  },
  {
    id: "piano",
    answer: "Piano",
    category: "arts",
    terms: [
      { word: "pedal", gloss: "controls how long notes ring" },
      { word: "hammer", gloss: "strikes the strings" },
      { word: "string", gloss: "is what sounds when struck" },
    ],
  },
  {
    id: "story-elements",
    answer: "Story elements",
    category: "arts",
    terms: [
      { word: "plot", gloss: "is what happens" },
      { word: "setting", gloss: "is where and when it happens" },
      { word: "theme", gloss: "is what the story is really about" },
    ],
  },
  {
    id: "partner-dancing",
    answer: "Partner dancing",
    category: "arts",
    terms: [
      { word: "lead", gloss: "guides the movement" },
      { word: "follow", gloss: "matches the partner" },
      { word: "step", gloss: "is one move in the pattern" },
    ],
  },
  {
    id: "poetry",
    answer: "Poetry",
    category: "arts",
    terms: [
      { word: "stress", gloss: "is the beat that stands out" },
      { word: "meter", gloss: "is the pattern of beats" },
      { word: "foot", gloss: "is one unit of the pattern" },
    ],
  },
  {
    id: "songwriting",
    answer: "Songwriting",
    category: "arts",
    terms: [
      { word: "hook", gloss: "is the catchy part you remember" },
      { word: "bridge", gloss: "is the contrasting middle part" },
      { word: "chorus", gloss: "is the part that repeats" },
    ],
  },
  {
    id: "music-composition",
    answer: "Music composition",
    category: "arts",
    terms: [
      { word: "score", gloss: "is the written music" },
      { word: "arrangement", gloss: "is a version made for different players" },
      { word: "movement", gloss: "is one large section of a work" },
    ],
  },
  {
    id: "theater",
    answer: "Theater",
    category: "arts",
    terms: [
      { word: "dress", gloss: "is the final full run in costume" },
      { word: "tech", gloss: "is the run that tests lights and sound" },
      { word: "curtain", gloss: "is what rises when the show starts" },
    ],
  },
  {
    id: "movie-marketing",
    answer: "Movie marketing",
    category: "arts",
    terms: [
      { word: "trailer", gloss: "is the longer preview" },
      { word: "teaser", gloss: "is the short early preview" },
      { word: "poster", gloss: "is the printed image that advertises the film" },
    ],
  },
  {
    id: "maps",
    answer: "Maps",
    category: "life",
    terms: [
      { word: "legend", gloss: "explains what the symbols mean" },
      { word: "scale", gloss: "shows how far real distances are" },
      { word: "compass", gloss: "is the rose that shows direction" },
    ],
  },
  {
    id: "steak",
    answer: "Steak",
    category: "life",
    terms: [
      { word: "rare", gloss: "is cooked very little" },
      { word: "medium", gloss: "is cooked halfway" },
      { word: "grill", gloss: "is where the steak cooks" },
    ],
  },
  {
    id: "sauces",
    answer: "Sauces",
    category: "life",
    terms: [
      { word: "stock", gloss: "is the flavorful liquid base" },
      { word: "reduce", gloss: "is boiling it down thicker" },
      { word: "glaze", gloss: "is a shiny sauce coating" },
    ],
  },
  {
    id: "gardening",
    answer: "Gardening",
    category: "life",
    terms: [
      { word: "prune", gloss: "trims plants back" },
      { word: "graft", gloss: "joins two plants together" },
      { word: "soil", gloss: "is the earth plants grow in" },
    ],
  },
  {
    id: "house-painting",
    answer: "House painting",
    category: "life",
    terms: [
      { word: "prime", gloss: "is the first layer that seals" },
      { word: "coat", gloss: "is a layer of paint" },
      { word: "brush", gloss: "is what spreads the paint" },
    ],
  },
  {
    id: "construction",
    answer: "Construction",
    category: "life",
    terms: [
      { word: "stud", gloss: "is an upright framing piece" },
      { word: "beam", gloss: "is a heavy horizontal support" },
      { word: "foundation", gloss: "is the base everything stands on" },
    ],
  },
];

/* Pairs that must never be dealt even if a domain claims both terms:
 * order-insensitive "word1+word2" keys (alphabetical). Empty today: the
 * two known phrase pairs (motion + second, advance + royalty) left the
 * pool with their domains. Keep this list for phrase pairs discovered
 * in generated combinations. */
export const PAIR_BLOCKLIST = new Set([]);
