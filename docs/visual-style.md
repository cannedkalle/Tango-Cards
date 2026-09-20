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
| Tango Cards | Coral; a stack of cards | Flat three-card stack with the shared fox on the front; real artwork inside the gallery |
| Marble Battles | Blue; board and marbles | Flat territory fills, rounded white lanes with team-color borders, numbered team badges, simple circular launchers and outlined marbles; team level, capture progress, earned upgrades and slot widths live in expandable team summaries below the arena, no glow or miniature floating panels |
| Name Quest | Violet; talking face and choices | Small guide plus clear word-first game surface |
| Animal Outsider | Coral, blue, gold animal trio | Welcoming header; named choices preserve the full taxonomy dataset |
| Before the Bulb | Gold; a simple invention timeline | Two clear choice cards, calm source reveal, and a shared portal shell |

Original collectible cards are content, not interface assets; keep their art and 5:7 format. Do not substitute arbitrary mascot drawings for named species or leak hidden taxonomy through choice decoration.

## Layout and states

The homepage is an index of four things to play: brand, brief invitation, large illustrated links. Interiors retain the space their mechanics need. Shared back navigation, typography and controls tie them together. Keep artwork away from dense choices, scientific explanations and collection grids.

Check narrow phones, tablets and desktop. Controls wrap instead of overflowing. Selection, correct, wrong, disabled, empty, loading and keyboard-focus states must remain distinguishable without color alone. Avoid pressure, streaks or decorative metrics added merely to fill space.

## Ownership and acceptance

Portal owns `public/design-system/`, integrated Name Quest/Tango screens, and this rulebook. The sibling Apps workspace owns Marble Battles, Animal Outsider, and Before the Bulb source. Run `npm run apps:import` after edits to sync shared tokens and import source apps. `palette.js` is generated from CSS; canvas colors must come from it.

Before accepting an app: use the shared stylesheet and palette; reuse or construct matching SVG art; verify the asset paths with `npm run design:check`; build; inspect the homepage and interior at desktop and phone widths; exercise a real action and return navigation. A new illustration must pass the same silhouette, palette, geometry and no-effects rules. Do not change the grammar for one app.

Return navigation is always the shared `pf-back` control: a hidden decorative left arrow plus “Back to all apps”, linking to `/`, in the top `pf-portal-nav` row before the app heading. React apps use `PortalNav`; static apps use equivalent markup and the shared CSS. Do not add duplicate return links inside app controls.

Marble Battles team summaries keep territory, HP and level visible when collapsed. Use native details/summary controls and update values in place; live rendering must not replace disclosure nodes or discard their open state or keyboard focus. Keep per-team settings and upgrades out of the canvas and out of the global control status list.

Slot weight percentages describe physical width, never landing probability. Peg collisions, launch positions, velocity and board geometry determine landings. Only measured or modeled results may be presented as landing estimates, with their basis stated.

Arena layout uses uniform presentation transforms in `makeArenaView`: a central board with adjacent lanes for 2/4 teams, and a board beside a two-column lane grid for 8 teams. Do not reserve gutters for removed stat panels. Presentation scaling must leave simulation coordinates, peg collision geometry and physical slot widths unchanged.

Board team identifiers use small translucent outline numerals without a filled badge or backing. Keep underlying territory visible; solid numbered badges belong on peg lanes and team summaries, not over playable tiles.
