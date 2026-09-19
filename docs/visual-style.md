# Playform Kids — canonical visual rules

Approved direction for Kids Play Portal, ages 6–10. This supersedes the Paper Toy Index and adult Playform studies. The demo in `docs/playform-kids/` records the direction; production tokens and assets in `public/design-system/` are authoritative.

## Foundations

- Use the exact `--pf-*` tokens in `public/design-system/playform.css`. Cream page, white surfaces, dark green ink and primary actions. Coral, blue, gold, violet and mint identify play objects; pale tints support them.
- Use the shared rounded system font stack. Short bold headings, readable regular body copy; no decorative lettering or all-caps paragraphs.
- Use spacing from the 4–64px token scale and symmetric 12/16/24px corners. Use circles for faces, marbles and counters.
- Surfaces use quiet 1px borders. Stronger borders communicate input and selection. Only pressable controls use the small solid bottom edge; no floating shadows.
- Primary choices and navigation should offer at least 44px targets. Keep text labels beside unfamiliar icons. Show keyboard focus and honor reduced motion.
- Use the main green for actions, with text and symbols as well as color for outcomes. Do not use a decorative accent as small text on white.

## Art grammar

Flat SVG, a clear silhouette, one recognizable subject and at most three supporting pieces. Use circles, rounded rectangles, triangles and simple paths. Two dot eyes and a small mouth provide warmth. Reuse the exact fox, bear and owl geometry from `characters.svg`; change poses deliberately, not randomly. A character is a guide, never a decoration on every surface.

Use broad areas of solid color and dark ink for small functional details. No photographic material, 3D lighting, gloss, gradients, texture noise, fuzzy outlines, fake paper, tape or decorative wallpaper. Do not mix emoji or unrelated icon libraries with the house art. Labels stay in HTML, not in SVG images.

Build previews on a 480×300 viewBox with comfortable internal margins. Keep the essential object readable at thumbnail size. Standalone animal portraits use their supplied square viewBox. Use empty alt text when an adjacent label already communicates the same information.

## App mapping

| App | Identity | Use |
| --- | --- | --- |
| Tango Cards | Coral; a stack of cards | Real collection cards on the homepage; flat card-stack fallback |
| Marble Battles | Blue; board and marbles | Flat canvas fills, consistent palette, dark outlines, no glow |
| Name Quest | Violet; talking face and choices | Small guide plus clear word-first game surface |
| Animal Outsider | Coral, blue, gold animal trio | Welcoming header; named choices preserve the full taxonomy dataset |

Original collectible cards are content, not interface assets; keep their art and 5:7 format. Do not substitute arbitrary mascot drawings for named species or leak hidden taxonomy through choice decoration.

## Layout and states

The homepage is an index of four things to play: brand, brief invitation, large illustrated links. Interiors retain the space their mechanics need. Shared back navigation, typography and controls tie them together. Keep artwork away from dense choices, scientific explanations and collection grids.

Check narrow phones, tablets and desktop. Controls wrap instead of overflowing. Selection, correct, wrong, disabled, empty, loading and keyboard-focus states must remain distinguishable without color alone. Avoid pressure, streaks or decorative metrics added merely to fill space.

## Ownership and acceptance

Portal owns `public/design-system/`, integrated Name Quest/Tango screens, and this rulebook. The sibling Apps workspace owns Marble Battles and Animal Outsider source. Run `npm run apps:import` after edits to sync shared tokens and import source apps. `palette.js` is generated from CSS; canvas colors must come from it.

Before accepting an app: use the shared stylesheet and palette; reuse or construct matching SVG art; verify the asset paths with `npm run design:check`; build; inspect the homepage and interior at desktop and phone widths; exercise a real action and return navigation. A new illustration must pass the same silhouette, palette, geometry and no-effects rules. Do not change the grammar for one app.
