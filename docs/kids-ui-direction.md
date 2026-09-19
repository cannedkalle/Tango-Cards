# Playform Kids — direction for ages 6–10

September 18, 2026. Audience confirmed by the user: ages 6–10.

This is the updated direction following feedback that the first geometric icon specimen is cool but emotionally distant. It supersedes the identity presentation and emotional tone of `playform-design-system.md`. The original SVG specimen remains an exploration, not a finished kids-facing UI. The production migration now follows `visual-style.md`, the canonical implementation rulebook.

## Recommendation

Expressive flat 2D illustration, recognizable play objects, and large controls with clear press feedback. Keep geometric precision, predictable navigation, and reusable tokens. Put personality in the characters, objects, poses, and responses.

For this age group, aim for curious, funny, and capable. Avoid toddler proportions and constant praise; equally avoid sparse enterprise icon grids and tiny explanatory captions. This is a project recommendation, not a claim that one style is best for all children.

## What the references teach

- Duolingo's character guidelines construct head/body forms from simple shapes while using expression and pose for individuality. This supports reusable character construction without realism. Duolingo is a broad-age reference for craft, not proof of suitability for this portal's age range. [Character guidelines](https://design.duolingo.com/illustration/characters)
- Toca Boca describes its apps around concrete activities such as creating characters, building robots, making music, and playing shop. Use an understandable play invitation for each entry. [Official app catalog](https://www.tocaboca.com/apps)
- Khan Academy Kids serves ages 2–8 and uses a cast of characters to guide activities. It is a useful reference for younger readers' guidance, but its younger target is a reason not to copy its overall age tone for a 6–10 portal. [Official product page](https://www.khanacademy.org/kids)
- PBS KIDS combines a controlled vibrant palette and chunky typography with explicit contrast guidance. Color and accessibility can coexist. [Official style guide](https://pbs-kids-brand.pbskids.org/downloads/pbs-kids-style-guide.pdf)

## System changes from v1

| Area | Earlier study | New direction |
| --- | --- | --- |
| Homepage identity | Dark abstract symbols on pastel tiles | Small colorful scenes or recognizable objects, with an explicit title and play affordance |
| Compact navigation | Custom filled marks | Keep simplified marks where space is limited; label unfamiliar symbols |
| Color | Color largely confined to tile backgrounds | Color belongs to the subject as well; use a calm warm-white page and stronger focal accents |
| Illustration | Strictly minimal feature counts | Enough features for recognition and emotion, with a controlled face/pose vocabulary |
| Controls | Flat generic product buttons | Large rounded controls; optional 2–3px solid lower edge that compresses on press; no glossy lighting |
| Motion | Minimal state changes | Short action-linked responses: marble rolls, card lifts, character reacts; no idle loops |
| Type | Neutral system font everywhere | Readable rounded sans candidate for headings and game labels; regular-weight readable body; validate before selecting a font |

Rounded buttons, a face, or a slight solid button edge do not inherently create a cheap AI appearance. Inconsistency, arbitrary decoration, fake rendering, and weak hierarchy do. Use these devices deliberately and sparingly.

## Asset grammar

1. Every illustrated subject starts with a recognizable silhouette and one distinctive feature. Fennec: large ears; marble: round ball and motion; collectible: a visible character card.
2. Use circles, capsules, rounded rectangles, and softened wedges. Preserve necessary animal features without fur strokes or naturalistic shading.
3. Faces use a small shared vocabulary: consistent eye size/spacing at comparable character scales, a limited set of mouth shapes, and three initial expressions: curious, pleased, thinking. Not every object needs a face.
4. Limit an individual subject to two main colors plus ink/white details. A small scene may use a third accent. Keep the overall palette shared across apps.
5. Flat fills; no gradients, glow, artificial texture, glass, realistic shadows, bevels, or photographic materials. Solid overlap may describe structure.
6. Use purposeful asymmetry and pose. Avoid a uniform row of smiling front-facing mascots.
7. Maintain two optical versions where needed: expressive entry art at 120–240px and simplified app marks at 32–48px. Do not squeeze expressions into 16px favicons.
8. Final repeatable assets are editable SVG compositions with documented proportions and color tokens. Reuse parts and poses; don't independently generate each new asset.

## Applications

- Tango Cards: a real, memorable character peeking from a small card stack. Preserve existing collection art; do not redraw the whole collection to match the shell.
- Marble Battles: colorful marbles crossing territory tiles, with a clear motion cue. No face needed: movement is the personality.
- Name Quest: a name tile with a listening cue and two category choices. Add a small curious guide only if it helps explain the action.
- Animal Outsider: two related animals and an obviously different third, in the same simple shape language. Educational relationships must be checked; do not invent a decorative family tree.

## UI for this audience

- One clear primary play task per view; short instructions and concrete verbs.
- Pair unfamiliar symbols with text. Optional read-aloud can support newer readers; sound is user-controlled and never the only feedback channel.
- Prefer 48–56px action targets, generous gaps, and visible pressed/selected/focus states. Keep keyboard and touch equally functional.
- Let a child recover from a wrong answer or unintended tap. Use helpful feedback such as “Try the animal with a different family,” when correct for the game, rather than punitive red screens.
- Celebrate an actual accomplishment briefly. Avoid engagement pressure, streak-loss threats, incessant rewards, and animation that competes with the question.
- Keep Home/Back in a consistent place. Creator support and adult settings should be quiet and separate from play choices.
- Preserve contrast targets, accessible names, non-color state cues, responsive layout, and reduced-motion behavior from v1.

## Next prototype and validation

Build one real homepage entry and one answer screen as the next proof. Include a normal state, selected answer, correct answer, retry, keyboard focus, and reduced motion. Use an actual game example, not a marketing mockup.

Review with a small spread of children near ages 6, 8, and 10, with appropriate adult involvement. Observe whether they can choose a game, start it, understand feedback, and return without coaching. Ask what looks fun, too young, or confusing. Use observations to refine the style rather than treating adult aesthetic approval as usability evidence.

The desired outcome is a recognizable family of inviting games. The memorable part should be the object, character, or action the child wants to return to.
