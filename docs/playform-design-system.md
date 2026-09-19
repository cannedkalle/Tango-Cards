# Playform — visual system v1

> Update September 18, 2026: the user confirmed ages 6–10 and found this first icon direction too distant. See [Playform Kids](kids-ui-direction.md) for the current direction. This document and its specimen remain the initial construction study; the updated direction governs identity presentation and emotional tone.

Status: proposed specification and editable specimen. September 17, 2026.

Playform is the working name of the design system, not a new public site name. It defines the next design direction for Kids Play Portal. It supersedes the previous paper/collage direction for future design work; the live implementation has not yet migrated.

## Position

Flat, minimal, geometric, warm, and playful. A modern collection of independent web toys with a recognizable family resemblance.

The signature is a small set of bold play pieces, composed with clear negative space and one meaningful departure from repetition: a card stepping out of a stack, a marble leaving a grid, a choice set inside a speech shape, an animal different from its pair. This variation must describe the game. Do not add a random floating dot to every asset.

Distinctiveness comes from the recurring shape grammar and specific metaphors. Flatness alone is not sufficient: stock icons on colored squares are still stock icons. Recognition is a goal to test, not something established by naming this style.

## Research and interpretation

- Apple recommends simple, recognizable app icons and visual consistency across supported platforms. Adopt that identity discipline. Platform-specific glass or material treatments are not part of this flat web system. [Apple app icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- Atlassian defines consistent optical scale, shapes, stroke treatment, and familiar metaphors, and recommends text support for icons. Adopt explicit construction rules and reuse common symbols for actions. Its enterprise UI dimensions are not copied into this child-facing product. [Atlassian iconography](https://atlassian.design/foundations/iconography)
- Material Symbols distinguishes fill, weight, grade, and optical size. The lesson is to lock a family and tune small-size rendering rather than scale every drawing mechanically. [Material Symbols](https://developers.google.com/fonts/docs/material_symbols)
- Atlassian uses spacing tokens based on an 8px unit. Adopt a bounded spacing scale rather than inventing distances per component. [Atlassian spacing](https://atlassian.design/foundations/spacing)

These sources inform the system's structure. The specific palette, geometry, proposed app symbols, and numeric rules below are project design decisions.

## Four asset roles

| Role | Purpose | Construction | Detail budget |
| --- | --- | --- | --- |
| App identity | Recognize a particular game | Custom filled SVG symbol, optionally on a solid tile | One metaphor; typically 2–5 major shapes |
| UI icon | Understand a common action | One outline family; 24-unit canvas, 2-unit stroke, rounded caps/joins | One familiar action; monochrome |
| Illustration | Explain a game or celebrate a meaningful event | Flat vector composition using the same primitives | One subject group; up to 3 supporting elements |
| Game content | The collectible, puzzle, or board itself | Rules appropriate to the game | Preserve necessary information and existing collection art |

Do not shrink a three-animal illustration into an app icon. Do not turn a UI arrow into the brand mark. Do not redraw existing Tango collection art merely to match the portal shell.

## Geometry and composition

- Base primitives: circle, rounded rectangle, capsule, quarter-circle, and purposeful triangle/wedge.
- Curves are smooth and deliberate. No random wobble, torn edges, uneven CSS corners, texture, fake paper, fur marks, glow, bevels, or perspective shading.
- Identity symbols use solid fills without surrounding ink outlines. Interior cutouts create separation. UI controls use the separate outline icon family.
- App symbol master: 96 × 96 viewBox, preferred live area x/y 16–80. Allow optical adjustment where circles or pointed shapes appear smaller than rectangles.
- Tile container for web: 96 × 96, radius 24. This is a web presentation component, not an Apple export mask. Native app exports must follow the relevant platform requirements.
- Minimum meaningful gap: 6 master units for the primary mark; inspect at 32px where this becomes 2px. Remove small internal features in a dedicated 16px micro version.
- Do not rotate every symbol. Use aligned shapes and intentional overlap. Any angle should improve the object's meaning.
- Balance visual mass, not bounding boxes alone. A thin speech shape may need a larger footprint than a solid stack.

## App identity proposals

| App | Symbol concept | Key distinguishing shape | Accent |
| --- | --- | --- | --- |
| Tango Cards | Two offset collectible cards with one round cutout | Tall stepped stack | Apricot |
| Marble Battles | Three square territories and one free circle | Grid broken by a marble | Blue |
| Name Quest | Speech shape containing two different choice pieces | Speech tail plus contrasting choices | Violet |
| Animal Outsider | Two rounded animal heads with one pointed head | Repeated pair and angular outsider | Mint |

These are first-pass custom marks, shown together in the specimen. They must pass recognition and differentiation review before final adoption. Name Quest may read as chat without its label; Animal Outsider may read as animals without communicating taxonomy. Keep labels, and test these metaphors with unfamiliar users.

## Color system

| Token | Value | Role |
| --- | --- | --- |
| canvas | #F7F8FA | Neutral page background |
| surface | #FFFFFF | Interactive and content surfaces |
| ink | #202630 | Main text and symbols |
| muted | #596575 | Secondary text |
| line | #DCE1E8 | Decorative dividers, not sole control boundary |
| control-line | #788493 | Essential input boundary |
| action | #3158D5 | Primary action and focus |
| action-hover | #2445B0 | Hover/pressed emphasis |
| apricot | #FFBB91 | Tango identity / illustration |
| blue | #A8C8FF | Marble identity / illustration |
| violet | #CEBEFA | Name Quest identity / illustration |
| mint | #A9DDC5 | Animal Outsider identity / illustration |
| success | #216B4F | Success text/symbol, paired with a check and message |
| error | #A83240 | Error text/symbol, paired with a message |

Neutral UI; one app accent per context; at most three chromatic fills per illustration. Use ink on the pastel identity fills. Use white on action blue. Do not use pastel fills as text colors on white. App identity color is not feedback: Animal Outsider mint does not mean correct, and Tango apricot does not mean warning. When colors represent gameplay teams, preserve labels or distinct marks alongside them.

Acceptance targets: 4.5:1 for normal text; 3:1 for large text and essential non-text indicators, under the applicable WCAG criteria. Decorative separation does not need to behave like an input boundary. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Dark mode is a later explicit token map, not CSS inversion of light artwork. App marks must also work as a single ink color with transparent negative space. The specimen includes a monochrome test.

## Typography and layout

- Initial family: system-ui sans serif. Avoid adding a font dependency before hierarchy is established. A distinctive custom wordmark can be explored separately.
- Body: 16px / 24px, weight 400. Labels: 14px / 20px, weight 600. Secondary metadata: 12px / 16px, sparingly. Game prompts: 28px / 34px, weight 700. App names: 20px / 26px, weight 700. Page heading: 32px / 38px, weight 700.
- Set text as text. No generated lettering or outlined SVG text for ordinary interface copy.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px. Layout mostly uses 8px steps; 4px supports small details.
- Component radii: 8px for small fields, 12px for buttons, 20px for app entries. Symmetrical corners. Pill shapes are acceptable for actual switches or segmented controls; shape is not evidence of AI authorship.
- 48px preferred interactive height for game actions. 44px minimum project target for compact controls. These are project targets, not a claim that every WCAG target must be 44px.
- Use whitespace and hierarchy before adding a box. No nested card frames or default offset shadows. A real floating overlay can have a restrained elevation treatment.
- Catalog layout: compact header, readable app titles, icon plus concise description. Use a two-column catalog for the current four games; a wider catalog can use additional columns based on content and minimum readable width. Small screens use one column.

## Interaction language

- Default: readable label, clear affordance. Hover: one surface/color change. Press: darker action color. Focus: 3px action-blue outline with 3px offset. Disabled: visibly disabled plus native disabled behavior.
- Primary action: solid action-blue fill. Secondary: neutral fill or clear border. Tertiary: quiet text link. Do not make all actions equally colorful.
- Selected answers use a border/check and text, not color alone. Success/error states include a short message.
- Motion: 120–180ms for small control feedback, 180–240ms for state changes. No looping decorative motion, bouncing cards, or hover rotation. Respect reduced-motion preferences.
- Use familiar back, play, pause, sound, replay, and settings metaphors. The specimen's small custom set demonstrates one shared 24/2 outline grammar; production can use a single licensed library with matching construction instead of mixing libraries.

## Illustration rules

- Start with the same symbol or object vocabulary, then add only enough to explain the activity. Illustrations are not merely enlarged app icons.
- Maximum three subject colors plus ink and background. No color changes chosen solely to make each object different.
- Animals: recognizable outline first; one species-defining feature; eyes optional; no fur, realistic anatomy rendering, shading, or generic grin on every face. Shapes may be exaggerated, but educationally important traits must remain identifiable.
- Preview layout: 4:3 with roughly 12% clear edge margin. Use one compositional focus, maximum three main subjects. Review at 240px wide.
- A real game example or curated existing asset can be more useful than a new illustration. Text belongs in HTML or deliberately typeset vector compositions.
- AI generation may explore concepts. Final icons and repeatable brand geometry are editable SVGs with controlled paths and colors, reviewed at actual size. A more detailed prompt is not the production system.

## Scalability and acceptance

For each new app:

1. Write its defining object or play action in one sentence.
2. Draw three monochrome symbol concepts using the existing grammar.
3. Test next to the entire icon family at 32, 48, and 96px; inspect a purpose-built 16px version if needed.
4. Choose by recognizability, silhouette distinction, optical balance, and absence of decorative detail. Color must not be the only distinguishing feature.
5. Assign an existing accent. Color reuse is allowed; do not invent a new palette for every app.
6. Derive an illustration only if it improves understanding. Reuse common UI components and states.
7. Add SVG master, micro variant if needed, app registry mapping, accessible labels, and usage example.
8. Review light/monochrome use, keyboard focus, contrast, long names, and mobile composition. Check licensed asset terms for imported resources.

The concept becomes iconic through a stable symbol and repeated exposure. Test whether users can match four unlabeled icons to the games after seeing the labeled catalog; compare confusion patterns before polishing contours. Do not claim recognizability has been validated yet.

## First implementation slice

Deliverables in `docs/playform/`: editable SVG identity studies, shared CSS tokens, and a standalone visual specimen showing app marks, monochrome treatment, small sizes, and interactive control states.

Next migration: homepage and shared navigation first; then app shell styles in the owning workspace; then previews. Preserve app mechanics and existing collectible content. The production site remains unchanged during this specification stage.
