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
 * Source: the Twin Terms terminology pool v3 (~/workspace/twin-terms-pool/
 * twin-terms-pool-v3.md, formerly Two Hints) as amended 2026-10-26
 * (motion + second and advance + royalty removed as phrase pairs). Third terms were mined
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
    category: "arts",
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
    category: "arts",
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
  {
    id: "hurricane",
    answer: "Hurricane",
    category: "science",
    terms: [
      { word: "eye", gloss: "is the calm center" },
      { word: "surge", gloss: "is the sea rising onto land" },
      { word: "landfall", gloss: "is when the storm reaches shore" },
    ],
  },
  {
    id: "board-games",
    answer: "Board games",
    category: "games",
    terms: [
      { word: "token", gloss: "is a playing piece" },
      { word: "turn", gloss: "is one player's go" },
      { word: "board", gloss: "is where the game is played" },
    ],
  },
  {
    id: "brass-instruments",
    answer: "Brass instruments",
    category: "arts",
    terms: [
      { word: "mute", gloss: "softens the sound" },
      { word: "slide", gloss: "changes the note by moving" },
      { word: "bore", gloss: "is the width of the tube" },
    ],
  },
  {
    id: "jazz",
    answer: "Jazz",
    category: "arts",
    terms: [
      { word: "swing", gloss: "is the rolling rhythm" },
      { word: "blue", gloss: "is the bent note" },
      { word: "standard", gloss: "is a classic tune everyone plays" },
    ],
  },
  {
    id: "compass",
    answer: "Compass",
    category: "life",
    terms: [
      { word: "needle", gloss: "points north" },
      { word: "rose", gloss: "shows the directions" },
      { word: "dial", gloss: "is the marked face" },
    ],
  },
  {
    id: "pool",
    answer: "Pool",
    category: "games",
    terms: [
      { word: "break", gloss: "is the opening shot" },
      { word: "cue", gloss: "is the stick you shoot with" },
      { word: "pocket", gloss: "is a hole the balls drop into" },
    ],
  },
  {
    id: "weather-alerts",
    answer: "Weather alerts",
    category: "science",
    terms: [
      { word: "watch", gloss: "means severe weather is possible" },
      { word: "advisory", gloss: "means minor trouble is expected" },
      { word: "bulletin", gloss: "is the official notice" },
    ],
  },
  {
    id: "trains",
    answer: "Trains",
    category: "life",
    terms: [
      { word: "track", gloss: "is the rails trains run on" },
      { word: "signal", gloss: "tells the driver to stop or go" },
      { word: "conductor", gloss: "checks tickets and runs the train" },
    ],
  },
  {
    id: "simple-machines",
    answer: "Simple machines",
    category: "science",
    terms: [
      { word: "axle", gloss: "is the rod a wheel turns on" },
      { word: "effort", gloss: "is the force you apply" },
      { word: "load", gloss: "is what the machine moves" },
    ],
  },
  {
    id: "yeast",
    answer: "Yeast",
    category: "life",
    terms: [
      { word: "proof", gloss: "is letting yeast wake up" },
      { word: "starter", gloss: "is a live yeast culture" },
    ],
  },
  {
    id: "evolution",
    answer: "Evolution",
    category: "science",
    terms: [
      { word: "variation", gloss: "is differences within a species" },
      { word: "selection", gloss: "is nature keeping the fittest" },
      { word: "ancestor", gloss: "is the shared forebear" },
    ],
  },
  {
    id: "water-cycle",
    answer: "Water cycle",
    category: "science",
    terms: [
      { word: "infiltration", gloss: "is water soaking into soil" },
      { word: "watershed", gloss: "is the land that drains to one river" },
      { word: "percolation", gloss: "is water moving down through soil" },
    ],
  },
  {
    id: "pollination",
    answer: "Pollination",
    category: "science",
    terms: [
      { word: "stigma", gloss: "receives the pollen" },
      { word: "nectar", gloss: "rewards visiting insects" },
      { word: "ovary", gloss: "becomes the fruit" },
    ],
  },
  {
    id: "circles",
    answer: "Circles",
    category: "math",
    terms: [
      { word: "chord", gloss: "joins two points on the edge" },
      { word: "tangent", gloss: "touches at exactly one point" },
      { word: "arc", gloss: "is part of the edge" },
    ],
  },
  {
    id: "geometric-transformations",
    answer: "Geometric transformations",
    category: "math",
    terms: [
      { word: "translation", gloss: "slides a shape" },
      { word: "reflection", gloss: "flips a shape" },
      { word: "rotation", gloss: "turns a shape" },
    ],
  },
  {
    id: "food-chains",
    answer: "Food chains",
    category: "science",
    terms: [
      { word: "producer", gloss: "makes its own food" },
      { word: "consumer", gloss: "eats other living things" },
      { word: "prey", gloss: "is hunted for food" },
    ],
  },
  {
    id: "sound",
    answer: "Sound",
    category: "science",
    terms: [
      { word: "pitch", gloss: "is how high or low a sound is" },
      { word: "vibration", gloss: "is what makes sound" },
      { word: "tone", gloss: "is a sound's quality" },
    ],
  },
  {
    id: "filmmaking",
    answer: "Filmmaking",
    category: "arts",
    terms: [
      { word: "cut", gloss: "joins shots together" },
      { word: "take", gloss: "is one filmed try" },
      { word: "scene", gloss: "is one part of the story" },
    ],
  },
  {
    id: "acting",
    answer: "Acting",
    category: "arts",
    terms: [
      { word: "mark", gloss: "is the spot an actor stands on" },
      { word: "blocking", gloss: "is the planned movement" },
      { word: "dialogue", gloss: "is the spoken lines" },
    ],
  },
  {
    id: "editing",
    answer: "Editing",
    category: "arts",
    terms: [
      { word: "draft", gloss: "is an early version" },
      { word: "redline", gloss: "marks changes in red" },
      { word: "style", gloss: "is the house rules for writing" },
    ],
  },
  {
    id: "music-production",
    answer: "Music production",
    category: "arts",
    terms: [
      { word: "sample", gloss: "is a borrowed sound" },
      { word: "loop", gloss: "repeats a short section" },
      { word: "mix", gloss: "balances all the sounds" },
    ],
  },
  {
    id: "history-sources",
    answer: "History sources",
    category: "society",
    terms: [
      { word: "primary", gloss: "comes from the time itself" },
      { word: "secondary", gloss: "is written later about it" },
      { word: "document", gloss: "is a written record" },
    ],
  },
  {
    id: "legislation",
    answer: "Legislation",
    category: "society",
    terms: [
      { word: "bill", gloss: "is a proposed law" },
      { word: "act", gloss: "is a law that passed" },
      { word: "vote", gloss: "is how lawmakers decide" },
    ],
  },
  {
    id: "american-football",
    answer: "American football",
    category: "games",
    terms: [
      { word: "sack", gloss: "is tackling the quarterback" },
      { word: "down", gloss: "is one of four tries" },
      { word: "snap", gloss: "starts the play" },
    ],
  },
  {
    id: "pay",
    answer: "Pay",
    category: "society",
    terms: [
      { word: "gross", gloss: "is pay before deductions" },
      { word: "net", gloss: "is pay after deductions" },
      { word: "withholding", gloss: "is tax taken out first" },
    ],
  },
  {
    id: "infectious-diseases",
    answer: "Infectious diseases",
    category: "science",
    terms: [
      { word: "host", gloss: "carries the germ" },
      { word: "vector", gloss: "spreads it between hosts" },
      { word: "reservoir", gloss: "is where the germ lives between outbreaks" },
    ],
  },
  {
    id: "formal-meetings",
    answer: "Formal meetings",
    category: "society",
    terms: [
      { word: "minutes", gloss: "record what was decided" },
      { word: "chair", gloss: "runs the meeting" },
    ],
  },
  {
    id: "publishing",
    answer: "Publishing",
    category: "arts",
    terms: [
      { word: "manuscript", gloss: "is the text before printing" },
      { word: "galley", gloss: "is a test printing" },
      { word: "imprint", gloss: "is a publisher's brand" },
    ],
  },
  {
    id: "printing",
    answer: "Printing",
    category: "arts",
    terms: [
      { word: "margin", gloss: "is the blank border of the page" },
      { word: "bleed", gloss: "is ink printed past the trim edge" },
    ],
  },
  {
    id: "operating-systems",
    answer: "Operating systems",
    category: "science",
    terms: [
      { word: "kernel", gloss: "is the core of the system" },
      { word: "thread", gloss: "is a single line of execution" },
      { word: "shell", gloss: "is the program that takes your commands" },
    ],
  },
  {
    id: "moon",
    answer: "Moon phases",
    category: "science",
    terms: [
      { word: "wax", gloss: "is the moon's light growing" },
      { word: "quarter", gloss: "is the half-lit phase" },
      { word: "phase", gloss: "is one stage of the moon's cycle" },
    ],
  },
  {
    id: "electricity",
    answer: "Electricity",
    category: "science",
    terms: [
      { word: "current", gloss: "is the flow of electricity" },
      { word: "resistance", gloss: "opposes the flow" },
      { word: "circuit", gloss: "is the loop electricity travels" },
    ],
  },
  {
    id: "bookbinding",
    answer: "Bookbinding",
    category: "arts",
    terms: [
      { word: "leaf", gloss: "is a page of the book" },
      { word: "spine", gloss: "is the bound edge" },
      { word: "gutter", gloss: "is the inner margin near the spine" },
    ],
  },
  {
    id: "web-browsers",
    answer: "Web browsers",
    category: "science",
    terms: [
      { word: "cookie", gloss: "is data a site saves" },
      { word: "cache", gloss: "is stored files for speed" },
      { word: "bookmark", gloss: "is a saved page address" },
    ],
  },
  {
    id: "networks",
    answer: "Networks",
    category: "science",
    terms: [
      { word: "port", gloss: "is a numbered door for data" },
      { word: "protocol", gloss: "is the rules for exchange" },
      { word: "packet", gloss: "is a small unit of data" },
    ],
  },
  {
    id: "music-accidentals",
    answer: "Music accidentals",
    category: "arts",
    terms: [
      { word: "sharp", gloss: "raises a note" },
      { word: "flat", gloss: "lowers a note" },
      { word: "natural", gloss: "cancels a sharp or flat" },
    ],
  },
  {
    id: "music-notation",
    answer: "Music notation",
    category: "arts",
    terms: [
      { word: "rest", gloss: "is a silence" },
      { word: "note", gloss: "is a sounded pitch" },
      { word: "measure", gloss: "is a bar of music" },
    ],
  }
];

/* Pairs that must never be dealt even if a domain claims both terms:
 * order-insensitive "word1+word2" keys (alphabetical). Each entry is a
 * generated pair whose second reading is as strong as the domain's:
 * translation + reflection (language-arts school tasks), producer +
 * consumer (economics), cut + take (recording studio), primary +
 * secondary (colors, schooling), bill + act (theater), gross + net
 * (shipping weight), shower + registry (baby shower), sample + mix
 * (cooking: tasting a mixture), phase + wax (waxing phase
 * collocation), foot + meter (both are also units of length).
 * The other pairs of those domains
 * deal; only the ambiguous pair is held back. */
export const PAIR_BLOCKLIST = new Set([
  "reflection+translation",
  "consumer+producer",
  "cut+take",
  "primary+secondary",
  "act+bill",
  "gross+net",
  "registry+shower",
  "mix+sample",
  "phase+wax",
  "foot+meter",
]);
