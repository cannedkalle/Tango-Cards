# Balls in the Ballpark — image sourcing notes

Photos on the option cards (the `.wg-choice-grid` buttons) and on the
reveal sides (the `.wg-reveal-sides` articles), in the same format: a large
16/10 photo, then the label. One entry per subject id in
`lib/wild-guess/images.mjs`: 163 of 163 subjects covered, zero nulls.
Expanding the pool is data-only — add a subject to
`lib/wild-guess/subjects.mjs` and one entry here.

Where a photo loads, it replaces the emoji (the original deprecate-emoji
direction); where an image fails to load, no photo element renders and the
emoji shows as the fallback. The reveal sides carry the subject id through
`buildReveal` so they use the same manifest lookup as the choice cards.

## The bar (Kai, 2026-10-28)

"Don't over complicate it. Treat the image as an attention catcher or an
illustration." The image should loosely evoke the label and catch the eye;
it does not need to depict the subject exactly. A generic representative is
fine (any fly for midge wingbeats, any whale for blue whales, a beach for
grains of sand). Nothing was rejected for inexact species or
generic-vs-specific mismatch, and no entry was dropped over a verification
technicality.

## Sourcing

Four parallel workers, ~41 subjects each, Commons files only, filenames
taken from actual search/category results — never guessed. All 163
filenames and licenses were then verified against the Commons API
(`imageinfo` / `extmetadata`): 162 existed on first pass. The API
`LicenseShortName` wins wherever a worker's snippet differed (4 cases:
cat CC0 1.0 → CC0; sandcastle "version of choice" → CC BY-SA 4.0; people
weight CC BY → CC BY 4.0; Lake Erie "license of choice" → CC BY-SA 3.0)
and filled 22 licenses the workers had left uncertain.

## Replacements and flags

- **Cheetah running** (`speed-a-cheetah-running`): the worker's file
  ("Cheetah-GO!.jpg") does not exist on Commons. Replaced with
  "Cheetah Run.jpg" (CC BY 2.0, Mark Dumont), verified via the API.
- **Body surface** (`area-the-outer-surface-of-an-adults-body`): the
  textbook illustration is Leonardo's Vitruvian Man — a classical nude
  figure drawing, public domain. Kept deliberately; swap it if the
  portal's audience makes that the wrong call.
- **Snail** (`duration-a-snail-crossing-the-united-states`): license is
  "Copyrighted free use" per the API — a free license permitting any use,
  so it passes the test allowlist, which documents it explicitly.
- **Butterfly photos** (`duration-an-adult-butterflys-life`,
  `count-tiny-scales-on-a-butterflys-wings`): GFDL 1.2, same as the
  Outsider mosquito photo; the allowlist covers GFDL for the same reason.
- **Authors recorded as "Unknown"** (2): the oak photo
  (`duration-an-acorn-growing-into-a-full-sized-oak`) and the heart photo
  (`volume-the-blood-one-heart-pumps-in-a-day`) — the API returns no
  artist for either.
- **Same file, several subjects** (fine — the manifest is keyed by
  subject id, and cards show one subject at a time): Webb's First Deep
  Field (stars in the observable universe; age of the universe), the
  Apollo 17 Earth photo (weight of Earth; distance around Earth), and the
  NOAA blue whale photo (all blue whales' weight; blue whale heartbeats;
  a blue whale's weight).
