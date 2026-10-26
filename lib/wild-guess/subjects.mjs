import { comparisons } from './comparisons.mjs';

const slug = (value) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const WEAK_IDENTITY_WORDS = new Set(['a', 'an', 'the', 'one', 'full', 'grown', 'adult', 'big', 'large', 'giant', 'huge', 'cereal']);

export const canonicalConceptKey = (value) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter((word) => word && !WEAK_IDENTITY_WORDS.has(word))
  .sort()
  .join('-');

const catalog = new Map();
const retiredSubjects = new Set([
  'count::Light-up pixels on an iPhone screen',
  'count::Books in the Library of Congress',
  'count::Words in the first Harry Potter book',
  'count::Seats in Wembley Stadium',
  'count::Windows on the Empire State Building',
  'count::Dimples on one golf ball',
  'count::Spots on one ladybug',
  'count::Whiskers on one cat',
  'count::Kernels on one corn cob',
  'count::Books in the world’s largest library',
  'count::Snowflakes in a snowman',
  'count::Fish in a sardine school',
  'count::Needles on a pine tree',
  'count::Raindrops in a thunderstorm',
  'count::Snowflakes in a snowstorm',
  'count::Blades of grass on a soccer field',
  'count::Windows in New York City',
  'count::Scales on one fish',
  'count::Craters on the Moon',
  'count::Confetti pieces in a party bag',
  'count::Bubbles in a bubble bath',
  'count::Sprinkles on one doughnut',
  'count::Spots on one cheetah',
  'count::Pages on the public web',
  'count::People in New York City',
  'count::Active volcanoes on Earth',
  'count::Taste buds on one tongue',
  'count::Seeds in one sunflower head',
  'count::Teeth a shark uses over its lifetime',
  'count::Hairs on one cat',
  'count::Feathers on one eagle',
  'count::Neurons in one human brain',
  'count::Red blood cells in one person',
  'duration::The Moon going around Earth',
  'duration::Earth making one full spin',
  'duration::Pluto going around the Sun',
  'duration::A radio message traveling from Mars to Earth',
  'duration::A paper letter traveling around the world',
  'duration::A chicken egg hatching',
  'duration::One human lifetime',
  'duration::A termite eating a pencil',
  'duration::A mountain range rising',
  'duration::The Great Barrier Reef growing to its present size',
  'duration::A redwood growing taller than a house',
  'duration::A sunflower growing taller than a child',
  'duration::A plastic bottle breaking down outdoors',
  'duration::A banana peel breaking down outdoors',
  'duration::A dinosaur bone becoming a fossil',
  'duration::A person-sized stalactite growing in a cave',
  'duration::A person-sized icicle growing',
  'duration::A glacier creeping across a mountain valley',
  'duration::River water flowing through a mountain valley',
  'duration::A steel ship rusting away',
  'duration::A continent drifting across an ocean',
  'duration::The island of Hawaii forming',
  'duration::A snowman melting',
  'weight::All blue whales on Earth',
  'weight::All wild birds',
  'weight::All wild elephants',
  'weight::All termites on Earth',
  'weight::All blue whales',
  'weight::Mount Everest',
  'weight::All printed books in the world',
  'weight::All smartphones currently in use',
  'weight::All plastic ever made',
  'weight::All wild fish in the oceans',
  'weight::All trees on Earth',
  'weight::The Great Wall of China',
  'weight::A cruise ship',
  'frequency::Two quick hand claps',
  'frequency::Two text messages sent around the world',
  'frequency::Two paper letters entering the mail',
  'frequency::Two web searches around the world',
  'frequency::Two library books checked out around the world',
  'frequency::Two photos taken around the world',
  'frequency::Two paintings finished around the world',
  'frequency::Two airplane takeoffs around the world',
  'frequency::Two ticks of a clock',
  'frequency::Two meals eaten by one person',
  'frequency::Two human heartbeats',
  'frequency::Two waves reaching one beach',
  'frequency::Two high tides at one beach',
  'frequency::Two mouse heartbeats',
  'frequency::Two woodpecker pecks',
  'frequency::Two vibrations in a cat’s purr',
  'frequency::Two cricket chirps',
  'frequency::Two lightning flashes somewhere on Earth',
  'frequency::Two volcanic eruptions beginning somewhere on Earth',
  'frequency::Two earthquakes detected anywhere on Earth',
  'frequency::Two total solar eclipses somewhere on Earth',
  'frequency::Two chicken eggs laid around the world',
  'frequency::Two human births around the world',
  'frequency::Two mosquito bites on people worldwide',
  'frequency::Two reported shark bites on people',
  'frequency::Two waves reaching the world’s beaches',
  'frequency::Two sneezes from one person',
  'length::All the blood vessels in a human body, laid end to end',
  'length::The height of the Eiffel Tower',
  'length::The Golden Gate Bridge from end to end',
  'area::The playing surface of an international soccer field',
  'area::Central Park in New York City',
  'area::Yellowstone National Park',
  'volume::The water in an Olympic competition pool',
  'volume::The volume of the Great Pyramid of Giza',
  'volume::The Moon',
  'volume::Earth',
  'volume::The Sun',
]);
const standaloneSubjects = [
  {
    category: 'count',
    label: 'Snowflakes in a snowman',
    emoji: '☃️',
    magnitude: 9,
    lowMagnitude: 8,
    highMagnitude: 10,
    note: 'Snowflakes and snowmen vary greatly, so this is a broad estimate.',
    scaleLabel: null,
  },
  {
    category: 'count',
    label: 'Fish in a sardine school',
    emoji: '🐟',
    magnitude: 5,
    lowMagnitude: 3,
    highMagnitude: 6,
    note: 'Sardine schools split and merge, so they can range from thousands to more than a million fish.',
    scaleLabel: null,
  },
  {
    category: 'duration',
    label: 'A round-the-world cruise',
    emoji: '🛳️',
    magnitude: 7,
    lowMagnitude: 7,
    highMagnitude: 7,
    note: 'A round-the-world cruise usually takes several months, with lots of stops along the way.',
    scaleLabel: null,
  },
  {
    category: 'length',
    label: 'The Amazon River',
    emoji: '🏞️',
    magnitude: 6,
    lowMagnitude: 6,
    highMagnitude: 6,
    note: 'River lengths depend on where their source is measured; estimates for the Amazon are usually about 6,400 to 6,800 kilometers.',
    scaleLabel: 'about 6,400 to 6,800 kilometers',
  },
  {
    category: 'length',
    label: 'The distance from Earth to the Sun',
    emoji: '☀️',
    magnitude: 11,
    lowMagnitude: 11,
    highMagnitude: 11,
    note: 'Earth is about 150 million kilometers from the Sun on average.',
    scaleLabel: 'about 150 million kilometers',
  },
  {
    category: 'length',
    label: 'All the blood vessels in a human body, laid end to end',
    emoji: '🩸',
    magnitude: 8,
    lowMagnitude: 7,
    highMagnitude: 8,
    note: 'Published estimates vary widely because most of the length comes from microscopic capillaries and bodies differ in size.',
    scaleLabel: 'roughly 10,000 to 100,000 kilometers',
  },
  {
    category: 'length',
    label: 'The deepest borehole humans have drilled',
    emoji: '🕳️',
    magnitude: 4,
    lowMagnitude: 4,
    highMagnitude: 4,
    note: 'The Kola Superdeep Borehole reaches a little over 12 kilometers straight down into Earth.',
    scaleLabel: 'a little over 12 kilometers',
  },
  {
    category: 'length',
    label: 'A blue whale from nose to tail',
    emoji: '🐋',
    magnitude: 1,
    lowMagnitude: 1,
    highMagnitude: 1,
    note: 'A blue whale can grow to about 30 meters long—the length of a small row of cars.',
    scaleLabel: 'about 25 to 33 meters',
  },
  {
    category: 'length',
    label: 'The height of the Eiffel Tower',
    emoji: '🗼',
    magnitude: 2,
    lowMagnitude: 2,
    highMagnitude: 2,
    note: 'The Eiffel Tower rises about 330 meters above Paris.',
    scaleLabel: 'about 330 meters',
  },
  {
    category: 'length',
    label: 'The Golden Gate Bridge from end to end',
    emoji: '🌉',
    magnitude: 3,
    lowMagnitude: 3,
    highMagnitude: 3,
    note: 'From one end to the other, the Golden Gate Bridge is about 2.7 kilometers long.',
    scaleLabel: 'about 2.7 kilometers',
  },
  {
    category: 'length',
    label: 'The distance from Earth to the Moon',
    emoji: '🌕',
    magnitude: 8,
    lowMagnitude: 8,
    highMagnitude: 8,
    note: 'The Moon is about 384,000 kilometers away, and its oval path brings it a little nearer and farther each month.',
    scaleLabel: 'about 363,000 to 406,000 kilometers',
  },
  {
    category: 'area',
    label: 'The playing surface of an international soccer field',
    emoji: '⚽',
    magnitude: 3,
    lowMagnitude: 3,
    highMagnitude: 3,
    note: 'International soccer fields vary within official limits but usually cover about 7,000 square meters.',
    scaleLabel: 'about 6,400 to 8,250 square meters',
  },
  {
    category: 'area',
    label: 'Central Park in New York City',
    emoji: '🌳',
    magnitude: 6,
    lowMagnitude: 6,
    highMagnitude: 6,
    note: 'Central Park spreads across about 3.4 square kilometers in the middle of New York City.',
    scaleLabel: 'about 3.4 square kilometers',
  },
  {
    category: 'area',
    label: 'Yellowstone National Park',
    emoji: '🏞️',
    magnitude: 9,
    lowMagnitude: 9,
    highMagnitude: 9,
    note: 'Yellowstone covers almost 9,000 square kilometers of forests, grasslands, and water.',
    scaleLabel: 'about 8,900 to 9,100 square kilometers',
  },
  {
    category: 'area',
    label: 'The Great Barrier Reef Marine Park',
    emoji: '🪸',
    magnitude: 11,
    lowMagnitude: 11,
    highMagnitude: 11,
    note: 'The Marine Park gives this comparison a clear official boundary.',
    scaleLabel: 'about 344,000 square kilometers',
  },
  {
    category: 'area',
    label: 'The Sahara Desert',
    emoji: '🏜️',
    magnitude: 12,
    lowMagnitude: 12,
    highMagnitude: 13,
    note: 'The Sahara’s edge shifts, so its area needs a broad range.',
    scaleLabel: 'roughly 8.5 to 10.5 million square kilometers',
  },
  {
    category: 'area',
    label: 'The Pacific Ocean',
    emoji: '🌊',
    magnitude: 14,
    lowMagnitude: 14,
    highMagnitude: 14,
    note: 'The Pacific covers more area than all of Earth’s land combined.',
    scaleLabel: 'about 155 to 170 million square kilometers',
  },
  {
    category: 'volume',
    label: 'The water in an Olympic competition pool',
    emoji: '🏊',
    magnitude: 3,
    lowMagnitude: 3,
    highMagnitude: 3,
    note: 'Competition pools can have different depths, so the amount of water varies.',
    scaleLabel: 'about 2,500 to 4,000 cubic meters of water',
  },
  {
    category: 'volume',
    label: 'The volume of the Great Pyramid of Giza',
    emoji: '🔺',
    magnitude: 6,
    lowMagnitude: 6,
    highMagnitude: 6,
    note: 'This uses the pyramid’s original height; its top is no longer there.',
    scaleLabel: 'about 2.5 to 2.7 million cubic meters',
  },
  {
    category: 'volume',
    label: 'The water in Lake Erie',
    emoji: '💧',
    magnitude: 11,
    lowMagnitude: 11,
    highMagnitude: 11,
    note: 'Lake Erie is the shallowest Great Lake but still holds an enormous amount of water.',
    scaleLabel: 'about 450 to 550 cubic kilometers of water',
  },
  {
    category: 'volume',
    label: 'The water in all five Great Lakes',
    emoji: '🌊',
    magnitude: 13,
    lowMagnitude: 13,
    highMagnitude: 13,
    note: 'Together, the five Great Lakes hold about 23,000 cubic kilometers of freshwater.',
    scaleLabel: 'about 21,000 to 25,000 cubic kilometers of water',
  },
  {
    category: 'volume',
    label: 'The water in all of Earth’s oceans',
    emoji: '🌍',
    magnitude: 18,
    lowMagnitude: 18,
    highMagnitude: 18,
    note: 'Earth’s oceans hold about 1.3 billion cubic kilometers of water.',
    scaleLabel: 'about 1.3 billion cubic kilometers of water',
  },
  {
    category: 'volume',
    label: 'The Moon',
    emoji: '🌕',
    magnitude: 19,
    lowMagnitude: 19,
    highMagnitude: 19,
    note: 'The Moon takes up about 22 billion cubic kilometers of space.',
    scaleLabel: 'about 21 to 23 billion cubic kilometers',
  },
  {
    category: 'volume',
    label: 'Earth',
    emoji: '🌎',
    magnitude: 21,
    lowMagnitude: 21,
    highMagnitude: 21,
    note: 'Earth takes up a little more than one trillion cubic kilometers of space.',
    scaleLabel: 'about 1.1 trillion cubic kilometers',
  },
  {
    category: 'volume',
    label: 'The Sun',
    emoji: '☀️',
    magnitude: 27,
    lowMagnitude: 27,
    highMagnitude: 27,
    note: 'The Sun takes up about 1.3 million times as much space as Earth.',
    scaleLabel: 'about 1.4 quadrillion cubic kilometers',
  },
  {
    category: 'length',
    label: 'The line a BIC Cristal pen can write before it runs out of ink',
    emoji: '🖊️',
    magnitude: 3,
    lowMagnitude: 3,
    highMagnitude: 3,
    note: 'Writing style changes the result, but a BIC Cristal is designed to draw at least two kilometers of line.',
    scaleLabel: 'about 2 to 3 kilometers',
    sourceUrls: ['https://corporate.bic.com/en-us/group/our-creations'],
  },
  {
    category: 'length',
    label: 'The silk thread in one silkworm cocoon',
    emoji: '🧵',
    magnitude: 3,
    lowMagnitude: 2,
    highMagnitude: 3,
    note: 'A silkworm wraps one remarkably long, continuous filament around itself.',
    scaleLabel: 'about 500 to 1,500 meters',
    sourceUrls: ['https://www.fao.org/4/x2099e/x2099e03.htm'],
  },
  {
    category: 'length',
    label: 'The DNA in one human cell with a nucleus, stretched end to end',
    emoji: '🧬',
    magnitude: 0,
    lowMagnitude: 0,
    highMagnitude: 0,
    note: 'Nearly two meters of DNA fits inside a nucleus too small to see without a microscope.',
    scaleLabel: 'about 2 meters',
    sourceUrls: ['https://www.genome.gov/Pages/About/Planning/Symposium2011AgendaPowerpoints/Bernstein-10yearsHumanGenome.pdf'],
  },
  {
    category: 'area',
    label: 'The folded inside surface of an adult small intestine',
    emoji: '🌀',
    magnitude: 1,
    lowMagnitude: 1,
    highMagnitude: 1,
    note: 'Tiny folds called villi and microvilli create far more food-absorbing surface than the intestine appears to have.',
    scaleLabel: 'about 25 to 35 square meters',
    sourceUrls: ['https://pubmed.ncbi.nlm.nih.gov/24694282/'],
  },
  {
    category: 'area',
    label: 'The gas-exchange surface inside a healthy adult’s lungs',
    emoji: '🫁',
    magnitude: 2,
    lowMagnitude: 1,
    highMagnitude: 2,
    note: 'Millions of tiny air sacs give adult lungs a surprisingly broad surface for exchanging gases.',
    scaleLabel: 'roughly 70 to 120 square meters',
    sourceUrls: ['https://pubmed.ncbi.nlm.nih.gov/1626135/'],
  },
  {
    category: 'area',
    label: 'The outer surface of an adult’s body',
    emoji: '🖐️',
    magnitude: 0,
    lowMagnitude: 0,
    highMagnitude: 0,
    note: 'Body size changes the answer, but an adult’s skin usually covers less area than a small bedsheet.',
    scaleLabel: 'about 1.5 to 2 square meters',
  },
  {
    category: 'volume',
    label: 'All the water floating in Earth’s atmosphere',
    emoji: '💨',
    magnitude: 13,
    lowMagnitude: 13,
    highMagnitude: 13,
    note: 'This includes invisible water vapor as well as the droplets and ice in clouds.',
    scaleLabel: 'about 12,900 cubic kilometers of water',
    sourceUrls: ['https://www.usgs.gov/water-science-school/science/atmosphere-and-water-cycle'],
  },
  {
    category: 'volume',
    label: 'The blood one heart pumps in a day',
    emoji: '❤️',
    magnitude: 0,
    lowMagnitude: 0,
    highMagnitude: 1,
    note: 'A heart keeps moving the same blood around the body, pumping thousands of liters in one day.',
    scaleLabel: 'roughly 5,000 to 10,000 liters',
  },
  {
    category: 'area',
    label: 'All the red blood cells in one adult, spread flat',
    emoji: '🩸',
    magnitude: 3,
    lowMagnitude: 3,
    highMagnitude: 3,
    note: 'Trillions of tiny red blood cells add up to a membrane surface measured in thousands of square meters.',
    scaleLabel: 'roughly 2,000 to 4,000 square meters',
    sourceUrls: ['https://bionumbers.hms.harvard.edu/bionumber.aspx?id=107602'],
  },
  {
    category: 'speed',
    label: 'A tectonic plate sliding across Earth',
    emoji: '🌍',
    magnitude: -9,
    lowMagnitude: -10,
    highMagnitude: -9,
    note: 'Different plates move at different rates, but their steady motion is measured in centimeters per year.',
    scaleLabel: 'about 1 to 15 centimeters per year',
    sourceUrls: ['https://www.usgs.gov/faqs/how-fast-do-tectonic-plates-move', 'https://pubs.usgs.gov/gip/dynamic/understanding.html'],
  },
  {
    category: 'speed',
    label: 'A healthy fingernail growing',
    emoji: '💅',
    magnitude: -9,
    lowMagnitude: -10,
    highMagnitude: -9,
    note: 'Fingers and people differ, but healthy fingernails usually grow only a few millimeters each month.',
    scaleLabel: 'about 2 to 5 millimeters per month',
    sourceUrls: ['https://pubmed.ncbi.nlm.nih.gov/19744178/'],
  },
  {
    category: 'speed',
    label: 'Hair on a healthy scalp growing',
    emoji: '💇',
    magnitude: -9,
    lowMagnitude: -9,
    highMagnitude: -8,
    note: 'Hair growth varies among people, but scalp hair commonly grows around a centimeter each month.',
    scaleLabel: 'roughly 0.6 to 3 centimeters per month',
    sourceUrls: ['https://www.ncbi.nlm.nih.gov/books/NBK499948/', 'https://www.atsdr.cdc.gov/HAC/hair_analysis/2.4.html'],
  },
  {
    category: 'speed',
    label: 'A fast-growing bamboo shoot rising',
    emoji: '🎋',
    magnitude: -5,
    lowMagnitude: -6,
    highMagnitude: -5,
    note: 'Only the fastest bamboo species in ideal growth can approach a meter in one day.',
    scaleLabel: 'up to about 90 centimeters per day',
    sourceUrls: ['https://www.guinnessworldrecords.com/world-records/fastest-growing-plant'],
  },
  {
    category: 'speed',
    label: 'Jakobshavn Glacier flowing toward the sea',
    emoji: '🧊',
    magnitude: -4,
    lowMagnitude: -4,
    highMagnitude: -4,
    note: 'This unusually fast Greenland glacier has been measured moving many kilometers in a year.',
    scaleLabel: 'around 15 kilometers per year',
    sourceUrls: ['https://science.nasa.gov/earth/earth-observatory/jakobshavn-glacier-76590/'],
  },
  {
    category: 'speed',
    label: 'A garden snail crawling',
    emoji: '🐌',
    magnitude: -3,
    lowMagnitude: -3,
    highMagnitude: -2,
    note: 'Species, temperature, and surfaces change the result, but a crawling garden snail moves millimeters each second.',
    scaleLabel: 'roughly 1 to 10 millimeters per second',
    sourceUrls: ['https://research-repository.st-andrews.ac.uk/bitstream/handle/10023/24786/Pembury_Smith_2021_How_fast_is_a_snail_JZool_AAM.pdf?isAllowed=y&sequence=1'],
  },
  {
    category: 'speed',
    label: 'A raindrop falling through still air',
    emoji: '🌧️',
    magnitude: 0,
    lowMagnitude: 0,
    highMagnitude: 1,
    note: 'Larger drops fall faster, while wind can change their motion through the sky.',
    scaleLabel: 'about 2 to 10 meters per second',
    sourceUrls: ['https://gpm.nasa.gov/resources/faq/how-fast-do-raindrops-fall'],
  },
];

const sources = [
  ...comparisons.flatMap((comparison) => [comparison.left, comparison.right].map((option) => ({ category: comparison.category, option }))),
  ...standaloneSubjects.map((option) => ({ category: option.category, option })),
];

const sourceUrlsByLabel = new Map([
  ['Stars in the observable universe', ['https://science.nasa.gov/exoplanets/what-is-the-universe/']],
  ['Microbes in a human body', ['https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1002533']],
  ['Cells in one human body', ['https://pubmed.ncbi.nlm.nih.gov/37722043/']],
  ['Wild birds alive on Earth', ['https://pmc.ncbi.nlm.nih.gov/articles/PMC8166167/']],
  ['Trees on Earth', ['https://doi.org/10.1038/nature14967']],
  ['Insects alive on Earth', ['https://www.si.edu/spotlight/buginfo/bugnos']],
  ['Ants alive on Earth', ['https://doi.org/10.1073/pnas.2201550119']],
  ['All the ants on Earth', ['https://doi.org/10.1073/pnas.2201550119']],
  ['Domesticated chickens alive on Earth', ['https://livestock.review.fao.org/']],
]);

for (const { category, option } of sources) {
    const key = `${category}::${canonicalConceptKey(option.label)}`;
    const existing = catalog.get(key);
    if (existing) {
      if (existing.label !== option.label) throw new Error(`Possible duplicate subject: "${existing.label}" and "${option.label}". Use one canonical label.`);
      existing.lowMagnitude = Math.min(existing.lowMagnitude, option.lowMagnitude);
      existing.highMagnitude = Math.max(existing.highMagnitude, option.highMagnitude);
      continue;
    }
    catalog.set(key, {
      id: `${category}-${slug(option.label)}`,
      category,
      label: option.label,
      emoji: option.emoji,
      magnitude: option.magnitude,
      lowMagnitude: option.lowMagnitude,
      highMagnitude: option.highMagnitude,
      note: option.note,
      scaleLabel: option.scaleLabel,
      sourceUrls: option.sourceUrls || sourceUrlsByLabel.get(option.label) || [],
    });
}

export const subjects = [...catalog.values()].filter((subject) => !retiredSubjects.has(`${subject.category}::${subject.label}`));
export const subjectCategories = ['count', 'duration', 'weight', 'frequency', 'length', 'area', 'volume', 'speed'];

export function subjectsOverlap(left, right) {
  return !(left.highMagnitude < right.lowMagnitude || right.highMagnitude < left.lowMagnitude);
}

/* A matchup is weak when one side is part of the other: the whole always
 * wins, so there is nothing to guess. These pairs never deal, even when
 * their sizes are close. Keys are canonicalized at construction, so the
 * listing order here does not matter. Some of these were already
 * impossible because their ranges overlap; the ban also protects them if
 * estimates ever change. */
export const PART_WHOLE_PAIRS = new Set([
  ['count-ants-alive-on-earth', 'count-insects-alive-on-earth'],
  ['count-stars-your-eyes-can-see-in-a-dark-sky', 'count-stars-in-the-observable-universe'],
  ['duration-an-acorn-growing-into-a-full-sized-oak', 'duration-an-oak-trees-life'],
  ['weight-a-blue-whale', 'weight-all-the-blue-whales-on-earth'],
  ['weight-a-blue-whale', 'weight-all-whales-alive-today'],
  ['weight-all-the-blue-whales-on-earth', 'weight-all-whales-alive-today'],
  ['weight-earth', 'weight-all-eight-planets-together'],
  ['volume-the-water-in-lake-erie', 'volume-the-water-in-all-five-great-lakes'],
  ['area-the-great-barrier-reef-marine-park', 'area-the-pacific-ocean'],
].map(([a, b]) => [a, b].sort().join('|')));

function pairKey(left, right) {
  return [left.id, right.id].sort().join('|');
}

export function isPartWholePair(left, right) {
  return PART_WHOLE_PAIRS.has(pairKey(left, right));
}

/* Close means the two sides are within 1000x of each other (three orders of
 * magnitude): near enough that the player has to estimate, not just notice
 * that one side is astronomically bigger. That matches the middle of the
 * hand-picked comparison set. A category with fewer close pairs than the
 * floor still deals, from its closest pairs first, so no category runs dry. */
export const MAX_CLOSE_GAP = 3;
export const MIN_PAIRS_PER_CATEGORY = 3;

export function validSubjectPairs(category) {
  const available = subjects.filter((subject) => subject.category === category);
  const scored = [];
  for (let left = 0; left < available.length; left += 1) {
    for (let right = left + 1; right < available.length; right += 1) {
      const a = available[left];
      const b = available[right];
      if (subjectsOverlap(a, b) || isPartWholePair(a, b)) continue;
      scored.push({ pair: [a, b], gap: Math.abs(a.magnitude - b.magnitude) });
    }
  }
  scored.sort((x, y) => x.gap - y.gap);
  const close = scored.filter((entry) => entry.gap <= MAX_CLOSE_GAP);
  const pool = close.length >= MIN_PAIRS_PER_CATEGORY
    ? close
    : scored.slice(0, MIN_PAIRS_PER_CATEGORY);
  return pool.map((entry) => entry.pair);
}
