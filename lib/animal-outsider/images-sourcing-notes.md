# Animal Outsider images — sourcing notes

Photos on the option cards (options only, not the reveal panel), following
the Before the Bulb pattern: hotlinked Commons thumbnails
(`Special:FilePath`, width 480), keyed by animal `id`, with a graceful
fallback — a card with no entry, or a thumbnail that fails to load, shows
just the name.

## How this manifest was built (2026-10-28)

- The 331-animal roster was split into 5 interleaved chunks and sourced in
  parallel against Wikimedia Commons only. Rule throughout: the photo must
  match the roster's **scientific name**, not just the common label
  (roster "monkey" = vervet, *Chlorocebus pygerythrus*; "duck" = mallard).
  No filename was ever guessed; a filename was recorded only from a
  confirmed Commons file.
- Every filename was then verified against the Commons API
  (`imageinfo`/`extmetadata`) in batch: 316 of 321 worker filenames exist.
  The 5 that did not were replaced from API category/search results, and
  all 9 worker nulls were re-searched the same way — 8 resolved, 1 did not
  (see below). Every non-null license in the manifest is the API's
  `LicenseShortName`; where it differed from a worker's snippet inference
  (38 entries, mostly version corrections), the API value wins.
- Expanding the pool is data-only, by design: add the animal to
  `lib/animal-outsider/animals.mjs`, add one manifest entry keyed by its
  `id`, and the coverage test stays green. No component or CSS change is
  needed for a new animal with a photo.

## Removed from the roster: junebug

Junebug was dropped from `lib/animal-outsider/animals.mjs` on 2026-10-28,
not kept as a null: "junebug" is a familiar word but it does not denote
one animal. It is a colloquial blanket term for dozens of scarab beetles
(*Phyllophaga* May/June beetles, the green June beetle *Cotinis nitida*,
the European *Amphimallon*, and others), so the roster's pin to
*Phyllophaga crinita* was not what the name means to a player — and no
confirmed *P. crinita* photo was found on Commons either (species
category, file searches, the credited uploader's uploads, and the
en.wikipedia article, which has no page image, all checked). Nearby files
were rejected on purpose: `Junebug.jpg` is a European *Amphimallon*
species, and `Phyllophaga commonjunebeetle.jpg` is genus-only (species
unidentified). The roster is now 330 animals, all with photos, and the
image test asserts zero nulls.

## Judgment calls worth knowing

- **Caterpillar** uses `Hornworm.jpg`: the title names the larva stage
  ("hornworm" is the caterpillar's common name; the adult is the Carolina
  sphinx moth), and the numbered `Manduca sexta` files do not say which
  stage they show. If a play-test shows a moth here, swap this one entry.
- **Bilby** corrects the worker's filename: the file is `Easter Bilby.jpg`
  (CC BY-SA 2.0, stephentrepreneur), not `Easter Bilby.jpg.png`, which
  does not exist on Commons.
- **Blue whale** corrects the worker's filename the same way: the NOAA
  photo is `Blue Whale 001 noaa body color.jpg` (Public domain).
- **Ant** corrects the worker's inferred filename with its real prefix:
  `A Formica rufa sideview.jpg` (CC BY-SA 2.5, Richard Bartz).
- **Mosquito** is the only GFDL entry (`Aedes aegypti.jpg`, GFDL 1.2 per
  the API). The test allowlist covers GFDL explicitly rather than
  swapping a correct photo for a differently-licensed one.
- Deliberate rejections carried over from sourcing: dead animals,
  museum/taxidermy shots, part-only images (skulls, larvae where an
  adult was wanted), wrong-species files, and any NC/ND restriction.
