# Quiz box standard

Every quiz content box is one of three types, used in one of three
slots, with one of four counts in parallel. The protocol for a box
depends on all three — type, slot, and count — not on the game it
happens to sit in.

## Box types

### Image+text

An image with a label under or beside it, plus at most one short
secondary line (a value, a status, a "Pick this one"). This is the
default box for options and answers that have a picture.

- Image: 16/10 band, `object-fit: cover`, centered crop, 12px radius,
  lazy loading. If it fails to load, the figure hides itself and the
  box works with text alone.
- Label: the subject's name, one or two lines, same size across
  counts. The label never shrinks to make room for more boxes.
- The image never carries text, never carries attribution on the
  card (credits live in the manifest), and never leaks the answer: no
  visible year or date where the answer is chronology, no diagram or
  chart with numbers that state the magnitude, no logo where the
  photo should carry it.

### Image-only

The image is the whole content; there is no label. Use it only when
the picture itself is the choice — pick the odd picture out, or a
picture question with picture answers.

- Same image rules as image+text (16/10 band, cover, 12px radius,
  lazy, hide on failure).
- Because there is no text to name the choice, the box must carry a
  visible identifier: a letter or number badge (Bulb's choice letters,
  Outsider's choice numbers). Players need something to point at.
- Selection state must read without text: border change plus a
  checkmark on the box itself. No game uses this type yet; the rules
  exist so the first one matches the other boxes instead of inventing
  its own.

### Text-only

No image; the text is the whole content. Use it when the choice is
abstract (Twin Terms categories) or the subject has no picture.

- Label plus at most one short secondary line. Selection state comes
  from the box itself: border change plus the shared pressed
  checkmark (see the UI standard's shared chrome).
- No identifier badge needed — the text names the choice.
- Emoji rule (all types): where a photo loads, it replaces the
  emoji; where the image is absent or fails, the emoji shows as the
  fallback, never as decoration alongside the photo.

## Slots

### Question

One box, full width, above the question line, showing the thing being
asked about. Not interactive: no hover lift, no pressed state, no
pointer cursor. Largest image tier. No quiz game uses this slot yet;
the rule exists so the first one matches the other slots.

### Option

Interactive. Hover lift and border change, focus-visible ring, and a
disabled state after answering — dimmed, never removed, image
persisting. Selection shows on the box (border plus checkmark, or the
game's winner/loser treatment at reveal).

### Answer

Informational, not interactive: no hover. Two cases:

- The answer is one of the options (Balls, Bulb, Outsider): the
  reveal reuses the option's box — same type, same image, same size
  tier, same position. The only changes are the added answer info
  (value, explanation, winner mark) and the disabled dimming. Nothing
  is redesigned, recropped, or resized between option and answer.
  In a two-sided reveal both sides stay visible; the loser is never
  hidden.
- The answer is a new box (Twin Terms, Name Quest: text options,
  picture answer): it follows the single-answer protocol — full-width
  16/10 band above the answer text. This is not a transition, so the
  minimal-change rule does not apply to it.

## Counts in parallel

### 1 box

Full-width 16/10 band on all sizes. Covers the question image and the
single answer box. A single band plus the question line fits a phone
screen; a single answer box may scroll, since the reveal is exempt
from the fit rule.

### 2 boxes

Desktop: two-column grid, band images. Phones: stacked rows, square
thumbnails (Balls uses 104px, Bulb 80px) — two stacked bands plus the
question do not fit a 390×844 phone, so the fit rule forces rows.

### 3 boxes

Desktop: three-column grid, band images (narrower columns, so
shorter bands). Phones: stacked rows, square thumbnails, same as 2.

### 4 or more boxes

Desktop: wrapping grid (Outsider: three columns, the fourth wraps to
a second row), height-capped bands (Outsider: 120px) so two rows stay
compact. Phones: stacked rows, square thumbnails. Full 16/10 bands at
this count would push content off-screen on desktop and break the
fit rule on phones.

## Adoption

- Balls in the Ballpark: image+text, option × 2 and answer × 2 —
  the first full adopter of this standard.
- Before the Bulb: image+text, option × 2 (16/10 bands, flush-top
  banner rather than an inset box; art shrinks when the card disables
  at reveal). Answer × 2 is text-only date blocks in a two-column
  grid.
- Animal Outsider: image+text, option × 4 in the 4+ protocol
  (height-capped bands desktop, square-thumbnail rows on phones).
  Its cards persist at reveal with only a status change, so it
  already satisfies the minimal-change rule. One micro-fix open:
  photo radius 16px → 12px.
- Twin Terms: text-only options (categories, and four specific
  answers on give-up); image+text single answer box (band, 12px
  radius, but a max-height cap instead of a fixed 16/10 ratio —
  micro-fix open).
- Name Quest: text-only options; no image boxes yet — its image
  phase (reveal only) comes after Balls.
