# Name Quest category expansion

Expanded on 2026-10-22 from the category-candidates brief. Each of the six new top-level categories has 20 records, with easy, balanced, and challenge candidates. Both the Apps source bank and the portal bank contain the same records. Flowers remain in Plant. Thesaurus and Vegemite from the original brief remain in their existing categories.

Selection favors recognizable anchors plus distinctive, pronounceable names that work well as short quiz prompts. All records are single-word display names. Difficulty and ambiguity are editorial ratings; pronunciation strings are English-friendly reading guides, not IPA or audio-verified native pronunciations.

Cloud Type intentionally covers cloud genera, species, shapes, accessory clouds, and supplementary features, matching the brief's inclusion of Mammatus and Lenticular. Each explanation and subcategory identifies what the term actually describes. Lenticularis is not added as a duplicate of Lenticular.

Board Game includes traditional board games and modern tile-laying tabletop games such as Qwirkle and Carcassonne. Mancala names a family of games. Explanations preserve these distinctions.

Answer choices avoid overlapping meanings: dog breeds versus animals, cheese versus dishes, board games versus games, and place names shared by several entries. Salsa cannot be paired with Dish as an incorrect option. Names with medium ambiguity and familiar spellings use balanced difficulty so they remain reachable under the game's filters.

## Candidate banks

### Dog Breed (20)

Poodle, Borzoi, Xoloitzcuintli, Beagle, Dachshund, Dalmatian, Samoyed, Basenji, Whippet, Saluki, Akita, Shiba, Keeshond, Schipperke, Komondor, Puli, Vizsla, Weimaraner, Papillon, Havanese.

### Cheese (20)

Cheddar, Taleggio, Gouda, Brie, Camembert, Manchego, Pecorino, Provolone, Mozzarella, Ricotta, Burrata, Mascarpone, Roquefort, Gorgonzola, Gruyere, Emmental, Havarti, Halloumi, Mimolette, Cotija.

### Board Game (20)

Chess, Catan, Blokus, Quoridor, Quarto, Qwirkle, Mancala, Reversi, Backgammon, Checkers, Stratego, Pentago, Pylos, Takenoko, Tsuro, Scrabble, Parcheesi, Ludo, Crokinole, Carcassonne.

### Cloud Type (20)

Cumulus, Mammatus, Lenticular, Cirrus, Stratus, Cirrocumulus, Cirrostratus, Altocumulus, Altostratus, Stratocumulus, Nimbostratus, Cumulonimbus, Asperitas, Pileus, Castellanus, Floccus, Uncinus, Fibratus, Nebulosus, Congestus.

### Dance Style (20)

Bachata, Kizomba, Salsa, Tango, Waltz, Foxtrot, Polka, Samba, Rumba, Ballet, Mambo, Merengue, Flamenco, Fandango, Tarantella, Kathak, Bharatanatyam, Odissi, Mazurka, Charleston.

### Musical Instrument (20)

Ocarina, Balalaika, Nyckelharpa, Piano, Violin, Guitar, Flute, Harp, Trumpet, Clarinet, Oboe, Bassoon, Trombone, Marimba, Xylophone, Kalimba, Kora, Sitar, Tabla, Erhu.

## Editorial references

- [AKC breed groups](https://www.akc.org/public-education/resources/general-tips-information/dog-breeds-sorted-groups/) and [breed comparison](https://www.akc.org/compare-breeds/): breed membership.
- [Cheese.com directory](https://www.cheese.com/): cheese names and varieties.
- [Gigamic game catalog](https://en.gigamic.com/107-all-games): Quoridor, Quarto, and Pylos.
- [WMO classification summary](https://cloudatlas.wmo.int/cloud-classification-summary.html) and [Hong Kong Observatory cloud species guide](https://kids.weather.gov.hk/eBook/ebook_cloud/m_ebook_cloud07_e.htm): cloud terminology and distinctions.
- [UNESCO Dominican Bachata](https://ich.unesco.org/en/RL/music-and-dance-of-dominican-bachata-01514): Bachata's music and dance meanings.
- [Smithsonian Nyckelharpa](https://americanhistory.si.edu/collections/object/nmah_605640) and [Metropolitan Museum Kora](https://www.metmuseum.org/art/collection/search/501115): instrument descriptions.

## Validation

Run `node --test tests/name-quest.test.mjs` from the portal. Checks cover category size, reachability in all difficulty modes, Pokemon-or-not inclusion, four distinct answer choices, overlapping category exclusions, unique records, and preservation of Plant membership. Run `npm run build` for the production build.
