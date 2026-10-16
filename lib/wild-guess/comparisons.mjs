const CATEGORY_PROMPTS = {
  count: 'Which are there more of?',
  duration: 'Which takes longer?',
  weight: 'Which weighs more?',
  frequency: 'Which has the shorter gap between events?',
};

const side = (label, emoji, magnitude, lowMagnitude, highMagnitude, note, scaleLabel = null) => ({
  label,
  emoji,
  magnitude,
  lowMagnitude,
  highMagnitude,
  note,
  scaleLabel,
});

const compare = (id, category, left, right) => ({
  id,
  version: 22,
  status: 'proposal',
  category,
  prompt: CATEGORY_PROMPTS[category],
  left,
  right,
});

export const comparisons = [
  // Count — 40 proposals
  compare('stars-or-beach-sand', 'count', side('Stars in the observable universe', '✨', 23, 22, 24, 'The observable universe holds an almost unimaginable sea of stars.'), side('Grains of sand on Earth’s beaches', '🏖️', 19, 18, 20, 'All the world’s beaches still fall several scales short of the stars.')),
  compare('beach-sand-or-body-microbes', 'count', side('Grains of sand on Earth’s beaches', '🏖️', 19, 18, 20, 'Beaches contain many quintillions of grains.'), side('Microbes in a human body', '🦠', 13, 13, 14, 'A human body carries tens of trillions of microbes.')),
  compare('insects-or-wild-birds', 'count', side('Insects alive on Earth', '🐜', 18, 17, 19, 'Insects outnumber birds by millions to one.'), side('Wild birds alive on Earth', '🐦', 10, 10, 11, 'Wild birds number in the tens of billions.')),
  compare('people-or-wild-fish', 'count', side('People alive on Earth', '🧑‍🤝‍🧑', 9, 9, 10, 'Humanity numbers in the billions.'), side('Wild fish in the oceans', '🐟', 12, 12, 13, 'Ocean fish are thought to number in the trillions.')),
  compare('earth-trees-or-visible-stars', 'count', side('Trees on Earth', '🌳', 12, 12, 13, 'Earth has trillions of trees.'), side('Stars your eyes can see in a dark sky', '🌌', 3, 3, 4, 'Only a few thousand stars are visible to unaided eyes at once.')),
  compare('body-cells-or-cat-hairs', 'count', side('Cells in one human body', '🧬', 13, 13, 14, 'A human body contains tens of trillions of cells.'), side('Hairs on one cat', '🐈', 7, 7, 8, 'A furry cat has tens of millions of hairs.')),
  compare('cat-hairs-or-eagle-feathers', 'count', side('Hairs on one cat', '🐈', 7, 7, 8, 'A cat’s coat contains millions of individual hairs.'), side('Feathers on one eagle', '🦅', 3, 3, 4, 'A large eagle carries thousands of feathers.')),
  compare('cat-whiskers-or-phone-pixels', 'count', side('Whiskers on one cat', '🐱', 1, 1, 2, 'A cat has only a few dozen main whiskers.'), side('Light-up pixels on an iPhone screen', '📱', 6, 6, 6, 'A modern phone screen contains millions of glowing pixels.')),
  compare('brain-neurons-or-people', 'count', side('Neurons in one human brain', '🧠', 10, 10, 10, 'A brain contains tens of billions of neurons.'), side('People alive on Earth', '🌍', 9, 9, 9, 'The human population is measured in billions.')),
  compare('body-microbes-or-shark-teeth', 'count', side('Microbes in a human body', '🦠', 13, 13, 14, 'A human body carries tens of trillions of microbes.'), side('Teeth a shark uses over its lifetime', '🦈', 4, 4, 5, 'A shark can replace tens of thousands of teeth.')),
  compare('blood-cells-or-head-hairs', 'count', side('Red blood cells in one person', '🩸', 13, 13, 14, 'Blood carries tens of trillions of red cells.'), side('Hairs on a full head of hair', '🧑‍🦱', 5, 4, 5, 'A full head has roughly a hundred thousand hairs.')),
  compare('bathtub-drops-or-rice-bowl', 'count', side('Drops of water in a bathtub', '🛁', 6, 6, 7, 'A bathtub holds millions of drops.'), side('Grains of rice in a cereal bowl', '🍚', 3, 3, 3, 'A cereal bowl holds a few thousand grains of rice.')),
  compare('pool-ping-pong-or-backpack-marbles', 'count', side('Ping-pong balls filling a swimming pool', '🏓', 6, 6, 7, 'A pool would take millions of ping-pong balls.'), side('Marbles filling a school backpack', '🎒', 3, 3, 4, 'A backpack holds thousands of marbles.')),
  compare('rice-bowl-or-house-bricks', 'count', side('Grains of rice in a cereal bowl', '🍚', 3, 3, 3, 'A cereal bowl holds a few thousand grains of rice.'), side('Bricks in a brick house', '🧱', 4, 4, 4, 'A brick house uses tens of thousands of bricks.')),
  compare('library-books-or-novel-words', 'count', side('Books in the Library of Congress', '📚', 7, 7, 8, 'The Library of Congress holds tens of millions of books.'), side('Words in the first Harry Potter book', '📖', 4, 4, 5, 'The first Harry Potter story contains tens of thousands of words.')),
  compare('earth-ants-or-people', 'count', side('Ants alive on Earth', '🐜', 16, 16, 17, 'Earth’s ants number in the tens of quadrillions.'), side('People alive on Earth', '🧑‍🤝‍🧑', 9, 9, 10, 'People number in the billions.')),
  compare('ocean-microbes-or-stars', 'count', side('Microbes in Earth’s oceans', '🦠', 29, 28, 30, 'The oceans contain an enormous, mostly invisible living world.'), side('Stars in the observable universe', '✨', 23, 22, 24, 'Even the stars fall far short of the ocean’s microbial count.')),
  compare('storm-raindrops-or-pine-needles', 'count', side('Raindrops in a thunderstorm', '🌧️', 14, 13, 15, 'A thunderstorm releases many trillions of drops.'), side('Needles on a pine tree', '🌲', 5, 4, 6, 'Pine trees vary, but many carry tens of thousands to millions of needles.')),
  compare('snowstorm-flakes-or-nyc-people', 'count', side('Snowflakes in a snowstorm', '❄️', 15, 14, 16, 'A snowstorm can release quadrillions of flakes.'), side('People in New York City', '🏙️', 6, 6, 7, 'New York City is home to several million people.')),
  compare('grass-field-or-wembley-seats', 'count', side('Blades of grass on a soccer field', '🌱', 8, 7, 9, 'A field can carry hundreds of millions of grass blades.'), side('Seats in Wembley Stadium', '🏟️', 5, 4, 5, 'Wembley Stadium has about ninety thousand seats.')),
  compare('lego-bricks-or-world-cars', 'count', side('LEGO bricks ever made', '🧱', 11, 11, 12, 'Hundreds of billions of LEGO pieces have been produced.'), side('Cars on Earth', '🚗', 9, 9, 10, 'The world has around a billion cars.')),
  compare('chickens-or-earth-trees', 'count', side('Domesticated chickens alive on Earth', '🐔', 10, 10, 11, 'Chickens number in the tens of billions.'), side('Trees on Earth', '🌳', 12, 12, 13, 'Earth has trillions of trees.')),
  compare('wild-birds-or-insects', 'count', side('Wild birds alive on Earth', '🐦', 10, 10, 11, 'Wild birds number in the tens of billions.'), side('Insects alive on Earth', '🪲', 18, 17, 19, 'Insects number in the quintillions.')),
  compare('ocean-fish-or-chickens', 'count', side('Wild fish in the oceans', '🐟', 12, 12, 13, 'Ocean fish are thought to number in the trillions.'), side('Domesticated chickens alive on Earth', '🐔', 10, 10, 11, 'Chickens number in the tens of billions.')),
  compare('insects-or-ocean-fish', 'count', side('Insects alive on Earth', '🪲', 18, 17, 19, 'Insects number in the quintillions.'), side('Wild fish in the oceans', '🐟', 12, 12, 13, 'Ocean fish are thought to number in the trillions.')),
  compare('body-cells-or-wild-birds', 'count', side('Cells in one human body', '🧬', 13, 13, 14, 'A body contains tens of trillions of cells.'), side('Wild birds alive on Earth', '🐦', 10, 10, 11, 'Wild birds number in the tens of billions.')),
  compare('head-hairs-or-cat-whiskers', 'count', side('Hairs on a full head of hair', '🧑‍🦱', 5, 4, 5, 'A full head has roughly a hundred thousand hairs.'), side('Whiskers on one cat', '🐱', 1, 1, 2, 'A cat has only a few dozen main whiskers.')),
  compare('eagle-feathers-or-cat-whiskers', 'count', side('Feathers on one eagle', '🦅', 3, 3, 4, 'An eagle carries thousands of feathers.'), side('Whiskers on one cat', '🐱', 1, 1, 2, 'A cat has only a few dozen main whiskers.')),
  compare('city-windows-or-empire-state-windows', 'count', side('Windows in New York City', '🗽', 8, 7, 9, 'A whole city contains tens to hundreds of millions of windows.'), side('Windows on the Empire State Building', '🏢', 3, 3, 4, 'The Empire State Building has thousands of windows.')),
  compare('corn-kernels-or-shark-teeth', 'count', side('Kernels on one corn cob', '🌽', 3, 2, 3, 'A cob usually carries hundreds of kernels.'), side('Teeth a shark uses over its lifetime', '🦈', 4, 4, 5, 'A shark can replace tens of thousands of teeth.')),
  compare('boeing-747-golf-balls-or-golf-dimples', 'count', side('Golf balls that fit inside a Boeing 747', '✈️', 7, 7, 8, 'A Boeing 747 could hold tens of millions of golf balls by volume.'), side('Dimples on one golf ball', '⛳', 2, 2, 3, 'A golf ball has a few hundred dimples.')),
  compare('taste-buds-or-cat-whiskers', 'count', side('Taste buds on one tongue', '👅', 4, 3, 4, 'A tongue has thousands of taste buds.'), side('Whiskers on one cat', '🐱', 1, 1, 2, 'A cat has only a few dozen main whiskers.')),
  compare('fish-scales-or-ladybug-spots', 'count', side('Scales on one fish', '🐟', 4, 3, 5, 'Many fish carry thousands to tens of thousands of scales.'), side('Spots on one ladybug', '🐞', 1, 0, 1, 'A ladybug usually has only a handful of spots.')),
  compare('moon-craters-or-earth-volcanoes', 'count', side('Craters on the Moon', '🌕', 6, 5, 7, 'The Moon has millions of craters large enough to map.'), side('Active volcanoes on Earth', '🌋', 3, 3, 4, 'Earth has roughly a thousand potentially active volcanoes.')),
  compare('confetti-or-donut-sprinkles', 'count', side('Confetti pieces in a party bag', '🎊', 4, 4, 5, 'A party bag can contain tens of thousands of tiny pieces.'), side('Sprinkles on one doughnut', '🍩', 2, 2, 3, 'A doughnut carries hundreds of sprinkles.')),
  compare('bubble-bath-or-cat-whiskers', 'count', side('Bubbles in a bubble bath', '🫧', 5, 5, 6, 'A foamy bath can hold hundreds of thousands of bubbles.'), side('Whiskers on one cat', '🐱', 1, 1, 2, 'A cat has only a few dozen main whiskers.')),
  compare('sunflower-seeds-or-ladybug-spots', 'count', side('Seeds in one sunflower head', '🌻', 3, 3, 3, 'A sunflower can hold well over a thousand seeds.'), side('Spots on one ladybug', '🐞', 1, 0, 1, 'A ladybug usually has only a handful of spots.')),
  compare('butterfly-scales-or-taste-buds', 'count', side('Tiny scales on a butterfly’s wings', '🦋', 6, 5, 7, 'Butterfly wings are covered by hundreds of thousands to millions of scales.'), side('Taste buds on one tongue', '👅', 4, 3, 4, 'A tongue has thousands of taste buds.')),
  compare('butterfly-scales-or-cheetah-spots', 'count', side('Tiny scales on a butterfly’s wings', '🦋', 6, 5, 7, 'Butterfly wings are covered by hundreds of thousands to millions of scales.'), side('Spots on one cheetah', '🐆', 3, 3, 4, 'A cheetah has a few thousand spots.')),
  compare('web-pages-or-library-books', 'count', side('Pages on the public web', '🌐', 11, 10, 12, 'The searchable web contains tens to hundreds of billions of pages.'), side('Books in the world’s largest library', '📚', 7, 7, 8, 'Even the largest library holds tens of millions of books.')),

  // Duration — 20 proposals
  compare('oak-growth-or-butterfly-change', 'duration', side('An acorn growing into a full-sized oak', '🌳', 9, 9, 10, 'Growing a great oak takes decades.'), side('A caterpillar changing into a butterfly', '🦋', 6, 5, 6, 'The transformation takes days or weeks.')),
  compare('snail-cross-country-or-termite-pencil', 'duration', side('A snail crossing the United States', '🐌', 9, 9, 10, 'At a snail’s pace, the trip would take many decades.'), side('A termite eating a pencil', '🐜', 7, 6, 7, 'One termite would need months or years, not decades.')),
  compare('mountain-rise-or-great-barrier-reef', 'duration', side('A mountain range rising', '🏔️', 14, 13, 15, 'Mountain ranges rise over millions of years.'), side('The Great Barrier Reef growing to its present size', '🪸', 11, 10, 12, 'The present reef system developed over thousands of years.')),
  compare('tortoise-life-or-mayfly-life', 'duration', side('A giant tortoise’s life', '🐢', 9, 9, 10, 'A giant tortoise can live for more than a century.'), side('A mayfly’s adult life', '🪰', 4, 3, 5, 'Many adult mayflies live only hours or days.')),
  compare('redwood-growth-or-sunflower-growth', 'duration', side('A redwood growing taller than a house', '🌲', 9, 8, 10, 'A redwood needs many years to tower over a house.'), side('A sunflower growing taller than a child', '🌻', 7, 6, 7, 'A sunflower can reach that height in one growing season.')),
  compare('plastic-bottle-or-banana-peel', 'duration', side('A plastic bottle breaking down outdoors', '🧴', 10, 10, 11, 'A plastic bottle can remain for centuries.'), side('A banana peel breaking down outdoors', '🍌', 6, 6, 7, 'A banana peel usually breaks down in weeks or months.')),
  compare('moon-orbit-or-earth-spin', 'duration', side('The Moon going around Earth', '🌙', 6, 6, 7, 'One lunar orbit takes about a month.'), side('Earth making one full spin', '🌍', 5, 4, 5, 'Earth spins once each day.')),
  compare('mars-trip-or-world-flight', 'duration', side('A spacecraft traveling to Mars', '🚀', 7, 7, 8, 'A Mars journey usually takes many months.'), side('An airplane flying around Earth', '✈️', 5, 5, 6, 'A round-the-world flight takes days.')),
  compare('fossil-form-or-banana-peel', 'duration', side('A dinosaur bone becoming a fossil', '🦴', 13, 13, 15, 'Fossilization takes millions of years.'), side('A banana peel breaking down outdoors', '🍌', 6, 6, 7, 'A banana peel usually breaks down in weeks or months.')),
  compare('diamond-form-or-pearl-form', 'duration', side('A natural diamond forming underground', '💎', 16, 15, 17, 'Natural diamonds form over immense stretches of geological time.'), side('An oyster growing a pearl', '🦪', 7, 7, 8, 'A pearl can grow in months or a few years.')),
  compare('stalactite-or-icicle', 'duration', side('A person-sized stalactite growing in a cave', '🪨', 11, 10, 12, 'A large stalactite needs centuries or millennia.'), side('A person-sized icicle growing', '🧊', 4, 4, 5, 'The right winter weather can build one in hours or days.')),
  compare('oak-life-or-cat-life', 'duration', side('An oak tree’s life', '🌳', 10, 10, 10, 'Many oaks live for centuries.'), side('A house cat’s life', '🐈', 8, 8, 9, 'A cat usually lives for years or decades.')),
  compare('glacier-crossing-or-river-water', 'duration', side('A glacier creeping across a mountain valley', '🏔️', 11, 10, 12, 'A glacier may need centuries to cross a valley.'), side('River water flowing through a mountain valley', '🏞️', 5, 4, 6, 'River water can make the trip in hours or days.')),
  compare('pluto-orbit-or-human-life', 'duration', side('Pluto going around the Sun', '🪐', 10, 10, 10, 'One Pluto year lasts almost two and a half Earth centuries.'), side('One human lifetime', '👵', 9, 9, 9, 'A human lifetime is measured in decades.')),
  compare('cicada-wait-or-butterfly-life', 'duration', side('A periodical cicada waiting underground', '🪲', 8, 8, 9, 'Some cicadas wait thirteen or seventeen years.'), side('An adult butterfly’s life', '🦋', 6, 6, 7, 'Many adult butterflies live only weeks.')),
  compare('elephant-pregnancy-or-chicken-egg', 'duration', side('An elephant pregnancy', '🐘', 7, 7, 8, 'An elephant pregnancy lasts close to two years.'), side('A chicken egg hatching', '🥚', 6, 6, 6, 'A chick hatches after about three weeks.')),
  compare('ship-rust-or-sandcastle', 'duration', side('A steel ship rusting away', '🚢', 9, 8, 10, 'A large ship can take decades to rust apart.'), side('A sandcastle washing away', '🏖️', 4, 3, 5, 'A tide can erase a sandcastle in minutes or hours.')),
  compare('continent-drift-or-world-flight', 'duration', side('A continent drifting across an ocean', '🌍', 15, 14, 16, 'Continents move across oceans over tens of millions of years.'), side('An airplane flying around Earth', '✈️', 5, 5, 6, 'A round-the-world flight takes days.')),
  compare('hawaii-island-or-snowman', 'duration', side('The island of Hawaii forming', '🌋', 13, 13, 14, 'The island grew through volcanic eruptions over hundreds of thousands of years.'), side('A snowman melting', '⛄', 5, 4, 6, 'Warm weather can melt a snowman in hours or days.')),
  compare('mars-message-or-world-letter', 'duration', side('A radio message traveling from Mars to Earth', '📡', 3, 2, 3, 'A radio message crosses space in minutes.'), side('A paper letter traveling around the world', '✉️', 5, 5, 6, 'International mail usually takes days.')),

  // Weight — 20 proposals (all values use kilograms internally)
  compare('all-ants-or-blue-whales', 'weight', side('All the ants on Earth', '🐜', 11, 11, 12, 'Together, Earth’s ants weigh tens of billions of kilograms.'), side('All the blue whales on Earth', '🐋', 9, 9, 10, 'Blue whales are huge, but there are relatively few of them.')),
  compare('chickens-or-wild-birds-mass', 'weight', side('All domesticated chickens', '🐔', 10, 10, 11, 'Billions of farmed chickens add up to an enormous mass.'), side('All wild birds', '🐦', 9, 8, 9, 'Most wild birds are small, even though there are billions of them.')),
  compare('humans-or-elephants-mass', 'weight', side('All people on Earth', '🧑‍🤝‍🧑', 11, 11, 12, 'Billions of people together weigh hundreds of billions of kilograms.'), side('All wild elephants', '🐘', 9, 9, 10, 'Wild elephants are massive but far less numerous.')),
  compare('termites-or-blue-whales-mass', 'weight', side('All termites on Earth', '🐜', 11, 11, 12, 'Tiny termites add up because their colonies cover the planet.'), side('All blue whales', '🐋', 9, 9, 10, 'Even all blue whales together fall short of global termite mass.')),
  compare('oceans-or-atmosphere', 'weight', side('All the water in Earth’s oceans', '🌊', 21, 21, 22, 'The oceans contain most of Earth’s surface water.'), side('All the air in Earth’s atmosphere', '🌬️', 18, 18, 19, 'The atmosphere is vast but far lighter than the oceans.')),
  compare('antarctic-ice-or-people', 'weight', side('The ice covering Antarctica', '🧊', 19, 19, 20, 'Antarctica holds a continent-sized ice sheet.'), side('All people on Earth', '🧑‍🤝‍🧑', 11, 11, 12, 'Humanity’s combined mass is tiny beside an ice sheet.')),
  compare('everest-or-nyc-buildings', 'weight', side('Mount Everest', '🏔️', 15, 14, 16, 'A mountain includes an immense volume of rock.'), side('All the buildings in New York City', '🏙️', 12, 12, 13, 'A whole city is massive, but still far lighter than Everest.')),
  compare('moon-or-oceans', 'weight', side('The Moon', '🌕', 22, 22, 23, 'The Moon is a world made of rock.'), side('All the water in Earth’s oceans', '🌊', 21, 21, 21, 'The oceans are enormous but weigh far less than the Moon.')),
  compare('earth-or-moon', 'weight', side('Earth', '🌍', 24, 24, 25, 'Earth is much larger and denser than its moon.'), side('The Moon', '🌕', 22, 22, 23, 'The Moon has only a small fraction of Earth’s mass.')),
  compare('sun-or-planets', 'weight', side('The Sun', '☀️', 30, 30, 31, 'The Sun contains almost all the mass in our solar system.'), side('All eight planets together', '🪐', 27, 27, 28, 'Even every planet together is tiny beside the Sun.')),
  compare('world-cars-or-bicycles', 'weight', side('All cars on Earth', '🚗', 12, 12, 13, 'More than a billion heavy cars add up quickly.'), side('All bicycles on Earth', '🚲', 10, 10, 11, 'Bicycles are numerous but much lighter than cars.')),
  compare('world-books-or-smartphones', 'weight', side('All printed books in the world', '📚', 11, 11, 12, 'Centuries of printed books add up to a huge mass of paper.'), side('All smartphones currently in use', '📱', 9, 9, 10, 'Billions of phones are still light compared with all printed books.')),
  compare('rice-harvest-or-gold', 'weight', side('One year’s world rice harvest', '🌾', 11, 11, 12, 'The world harvests hundreds of billions of kilograms of rice.'), side('All the gold ever mined', '🪙', 8, 8, 9, 'All mined gold would fit into a surprisingly small cube.')),
  compare('plastic-ever-or-whales', 'weight', side('All plastic ever made', '🧴', 12, 12, 13, 'Humanity has produced trillions of kilograms of plastic.'), side('All whales alive today', '🐋', 10, 9, 11, 'Whales are huge, but their total mass is much smaller.')),
  compare('ocean-fish-or-wild-birds-mass', 'weight', side('All wild fish in the oceans', '🐟', 12, 11, 13, 'The oceans support a vast mass of fish.'), side('All wild birds', '🐦', 9, 8, 9, 'Wild birds are numerous but mostly small and light.')),
  compare('earth-trees-or-people-mass', 'weight', side('All trees on Earth', '🌳', 14, 14, 15, 'Trillions of trees store an immense mass of wood.'), side('All people on Earth', '🧑‍🤝‍🧑', 11, 11, 12, 'Humanity’s mass is far smaller than the world’s forests.')),
  compare('school-bus-or-elephant', 'weight', side('A school bus', '🚌', 4, 4, 4, 'A school bus weighs many thousands of kilograms.'), side('An adult elephant', '🐘', 3, 3, 3, 'A large elephant weighs several thousand kilograms.')),
  compare('cargo-ship-or-blue-whale', 'weight', side('A loaded cargo ship', '🚢', 8, 8, 9, 'A cargo ship carries hundreds of millions of kilograms.'), side('A blue whale', '🐋', 5, 5, 6, 'A blue whale weighs hundreds of thousands of kilograms.')),
  compare('great-lakes-water-or-cargo-ship', 'weight', side('The water in all five Great Lakes', '🌊', 16, 16, 16, 'Together, the five Great Lakes hold about twenty quadrillion kilograms of freshwater.'), side('A loaded cargo ship', '🚢', 8, 8, 8, 'A cargo ship weighs hundreds of millions of kilograms.')),
  compare('great-wall-or-cruise-ship', 'weight', side('The Great Wall of China', '🧱', 10, 10, 11, 'The wall’s stone and earth weigh tens of billions of kilograms.'), side('A cruise ship', '🛳️', 8, 8, 9, 'A cruise ship weighs hundreds of millions of kilograms.')),

  // Frequency — 20 proposals. Magnitudes and reveal labels represent events per second.
  compare('mosquito-or-butterfly-wings', 'frequency', side('Two mosquito wingbeats', '🦟', 2, 2, 3, 'A mosquito’s wings move too quickly to follow with your eyes.', 'about 300 to 600 wingbeats per second'), side('Two butterfly wingbeats', '🦋', 0, 0, 1, 'A butterfly’s slower flaps are easy to see.', 'about 5 to 10 wingbeats per second')),
  compare('hummingbird-wings-or-human-heartbeats', 'frequency', side('Two hummingbird wingbeats', '🐦', 1, 1, 2, 'A hummingbird’s wings still move fast enough to blur.', 'about 40 to 80 wingbeats per second'), side('Two human heartbeats', '❤️', 0, 0, 0, 'A resting human heart keeps a much slower rhythm.', 'about 1 to 2 heartbeats per second')),
  compare('mouse-or-human-heartbeats', 'frequency', side('Two mouse heartbeats', '🐭', 1, 1, 1, 'A mouse’s tiny heart races much faster than ours.', 'about 8 to 12 heartbeats per second'), side('Two human heartbeats', '❤️', 0, 0, 0, 'A resting human heart keeps a much slower rhythm.', 'about 1 to 2 heartbeats per second')),
  compare('hummingbird-or-whale-heartbeats', 'frequency', side('Two hummingbird heartbeats', '🐦', 1, 1, 2, 'A hummingbird has one of the fastest hearts among animals.', 'about 15 to 20 heartbeats per second'), side('Two blue whale heartbeats', '🐋', -1, -1, 0, 'A diving blue whale can slow its enormous heart dramatically.', 'about 0.05 to 0.2 heartbeats per second')),
  compare('woodpecker-pecks-or-claps', 'frequency', side('Two woodpecker pecks', '🪵', 1, 1, 2, 'A drumming woodpecker strikes in a rapid burst.', 'about 15 to 25 pecks per second'), side('Two quick hand claps', '👏', 0, 0, 0, 'Even quick clapping leaves a visible pause.', 'about 1 to 3 claps per second')),
  compare('cat-purr-or-cricket', 'frequency', side('Two vibrations in a cat’s purr', '🐈', 1, 1, 2, 'A purr is made from many quick vibrations.', 'about 20 to 30 vibrations per second'), side('Two cricket chirps', '🦗', 0, 0, 0, 'Individual cricket chirps are easy to hear.', 'about 2 to 5 chirps per second')),
  compare('cat-purr-or-human-heart', 'frequency', side('Two vibrations in a cat’s purr', '🐈', 1, 1, 2, 'A purr is made from many quick vibrations.', 'about 20 to 30 vibrations per second'), side('Two human heartbeats', '❤️', 0, 0, 0, 'A resting human heart keeps a steady rhythm.', 'about 1 to 2 heartbeats per second')),
  compare('rattlesnake-or-cricket', 'frequency', side('Two shakes of a rattlesnake’s rattle', '🐍', 1, 1, 2, 'A rattlesnake shakes its tail fast enough to make a continuous buzz.', 'about 40 to 60 shakes per second'), side('Two cricket chirps', '🦗', 0, 0, 0, 'Individual cricket chirps are easy to hear.', 'about 2 to 5 chirps per second')),
  compare('lightning-or-eruptions', 'frequency', side('Two lightning flashes somewhere on Earth', '⚡', 1, 1, 2, 'Storms are flashing somewhere on Earth almost constantly.', 'about 40 to 50 flashes per second'), side('Two volcanic eruptions beginning somewhere on Earth', '🌋', -5, -6, -5, 'New volcanic eruptions begin only occasionally.', 'about 0.000001 new eruptions per second')),
  compare('earthquakes-or-eclipses', 'frequency', side('Two earthquakes detected anywhere on Earth', '🌎', -2, -3, -1, 'Sensitive instruments detect even tiny earthquakes.', 'about 0.01 to 0.03 earthquakes per second'), side('Two total solar eclipses somewhere on Earth', '🌑', -8, -8, -7, 'A total eclipse visits some part of Earth only occasionally.', 'about 0.00000002 to 0.00000005 eclipses per second')),
  compare('eggs-or-babies', 'frequency', side('Two chicken eggs laid around the world', '🥚', 4, 4, 5, 'Billions of hens make the worldwide total climb quickly.', 'about 20,000 to 30,000 eggs per second'), side('Two human births around the world', '👶', 0, 0, 1, 'Babies are born continuously around the world.', 'about 4 to 5 births per second')),
  compare('texts-or-letters', 'frequency', side('Two text messages sent around the world', '💬', 6, 5, 6, 'Phones carry an enormous stream of messages.', 'about 500,000 to 1,000,000 messages per second'), side('Two paper letters entering the mail', '✉️', 3, 2, 3, 'Postal systems still handle a large stream of letters.', 'about 500 to 2,000 letters per second')),
  compare('searches-or-library-checkouts', 'frequency', side('Two web searches around the world', '🔎', 5, 4, 5, 'People search the web continuously across the globe.', 'about 100,000 to 150,000 searches per second'), side('Two library books checked out around the world', '📚', 1, 0, 2, 'Libraries worldwide check out books throughout the day.', 'about 10 to 50 checkouts per second')),
  compare('photos-or-paintings', 'frequency', side('Two photos taken around the world', '📸', 4, 4, 5, 'Phones and cameras capture a constant flood of photos.', 'about 50,000 to 70,000 photos per second'), side('Two paintings finished around the world', '🎨', 0, -1, 1, 'Finishing a painting takes far longer than snapping a photo.', 'about 0.5 to 2 paintings per second')),
  compare('mosquito-or-shark-bites', 'frequency', side('Two mosquito bites on people worldwide', '🦟', 8, 7, 9, 'Mosquitoes bite people across much of the world.', 'about 10,000,000 to 100,000,000 bites per second'), side('Two reported shark bites on people', '🦈', -6, -7, -6, 'Reported shark bites are very rare.', 'about 0.000002 to 0.000004 bites per second')),
  compare('waves-or-takeoffs', 'frequency', side('Two waves reaching the world’s beaches', '🌊', 5, 4, 6, 'Countless coastlines receive waves at the same time.', 'about 100,000 to 1,000,000 waves per second'), side('Two airplane takeoffs around the world', '✈️', 0, 0, 1, 'Busy airports keep aircraft moving around the clock.', 'about 1 to 2 takeoffs per second')),
  compare('heartbeats-or-sneezes', 'frequency', side('Two human heartbeats', '❤️', 0, 0, 0, 'A resting heart keeps a steady rhythm.', 'about 1 to 2 heartbeats per second'), side('Two sneezes from one person', '🤧', -5, -6, -4, 'Most people go many hours without sneezing.', 'about 0.00001 to 0.0001 sneezes per second')),
  compare('clock-ticks-or-meals', 'frequency', side('Two ticks of a clock', '🕰️', 0, 0, 0, 'A standard clock keeps a steady beat.', 'about 1 tick per second'), side('Two meals eaten by one person', '🍽️', -5, -5, -4, 'Meals are usually separated by hours.', 'about 0.00005 to 0.0002 meals per second')),
  compare('hummingbird-wings-or-cricket-chirps', 'frequency', side('Two hummingbird wingbeats', '🐦', 1, 1, 2, 'A hummingbird’s hovering wings become a blur.', 'about 40 to 80 wingbeats per second'), side('Two cricket chirps', '🦗', 0, 0, 0, 'Individual cricket chirps are easy to hear.', 'about 2 to 5 chirps per second')),
  compare('beach-waves-or-high-tides', 'frequency', side('Two waves reaching one beach', '🌊', 0, 0, 1, 'Waves commonly arrive every few seconds.', 'about 0.1 to 0.3 waves per second'), side('Two high tides at one beach', '🌕', -5, -5, -4, 'High tides are separated by many hours.', 'about 0.00002 high tides per second')),
];

export const comparisonCategories = Object.keys(CATEGORY_PROMPTS);

export function winningSide(comparison) {
  return comparison.left.magnitude > comparison.right.magnitude ? 0 : 1;
}

export function rangesOverlap(comparison) {
  const { left, right } = comparison;
  return !(left.highMagnitude < right.lowMagnitude || right.highMagnitude < left.lowMagnitude);
}
