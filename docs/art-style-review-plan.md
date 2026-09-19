# Art style review and improvement plan

Review date: September 17, 2026.

Scope: the project referred to as Whimsical Kids AI Lab, currently titled Kids Play Portal in `lib/names.js` and the local browser. Reviewed the rendered homepage, Tango Cards index, Name Quest, Animal Outsider, and Marble Battles' direct static entry, plus source styles, preview assets, and existing art-direction documents. Browser observations were at 1280 × 720 on localhost; production and mobile rendering were not verified. These are design judgments, not audience research findings.

## Diagnosis

The site has appealing ingredients: warm colors, direct access to four unusual play projects, specific character artwork, and a family creator credit. Its strongest identity is the actual work made by CannedKalle and sons.

The inexpensive, generated impression comes from stacking familiar signals of handmade charm without enough selection or hierarchy. Aged paper, doodles, thick outlines, irregular corners, block shadows, saturated accents, tiny badges, and giant bold headings appear together. Each device says “playful”; too many say it at once. The result resembles a reusable craft-themed website skin.

The individual raster previews have considerable finish. Increasing image resolution or texture detail would not address the main problem. Greater specificity, restraint, and consistency would.

## Observed gaps

| Priority | Evidence | Why it feels generic or unfinished | Proposed response |
| --- | --- | --- | --- |
| P0 | Full-page doodle wallpaper, extra star/circle pseudo-elements, and a decorative ring in the header | Decorative motifs communicate a generic idea of childhood instead of these particular games | Plain warm background; remove large unrelated marks; retain one small authored detail if useful |
| P0 | App cards contain a border and shadow around another bordered, shadowed image, plus a bordered category badge | Repeated framing overwhelms the artwork and makes every layer compete for attention | One dominant frame per entry; remove image shadows and boxed category labels |
| P0 | Homepage header occupies roughly 280 px; contact/support controls sit below and right of the title | A large title panel and secondary actions consume prime space while games extend below the viewport | Compact header, shared alignment with content, quiet creator links |
| P0 | Tango preview shows abstract sun/star collage cards, while actual series show rockets, gummy characters, and fruit-birds | The preview could advertise any card product and suppresses the most distinctive assets | Compose the preview from real, selected collection assets |
| P1 | Name Quest preview contains blank cards and house/tree/car/star tokens; the game asks users to categorize names | Generic preschool icon vocabulary suggests a different activity and age level | Use a real example name and meaningful category relationships in a deliberately composed preview |
| P1 | Animal Outsider uses smooth SVG nodes, letter labels, and a repeated title; adjacent previews use textured physical materials | Different drawing methods, detail levels, and spatial cues make the set feel assembled from unrelated sources | Match subject scale, palette, crop, and edge treatment across previews; show a recognizable animal relationship |
| P1 | Trebuchet leads all three font roles; body defaults to 700 weight; headings and titles are very large | Almost everything is emphatic, so hierarchy comes mainly from size and boxes | Normal-weight descriptions, deliberate title scale, bold reserved for names and actions; evaluate fonts after this |
| P1 | At 1280 px the homepage has three cards followed by one orphan card | The catalog looks mechanically auto-flowed rather than composed for four projects | Intentional two-column desktop layout initially, one column on narrow screens; revisit as catalog grows |
| P1 | Name Quest's large header pushes answer choices below the initial 720 px viewport; Animal Outsider emphasizes several empty explanation panels | The surrounding interface competes with the play task | Prioritize question and answers; simplify empty states; preserve app-specific mechanics |
| P2 | Family authorship appears mainly in one formal “Presented by” line | The imagery supplies most of the personality, so the site feels less particular than the underlying project | Use direct first-person or family voice where accurate; consider one real creator-made mark |

### Why the prompt is contributing

`docs/art-direction-prompt.md` lists many aesthetic adjectives but does not specify a precise subject arrangement, visual density, stroke scale, or thumbnail readability target. It asks for flat graphic work yet the assets imply photographed paper with lighting, depth, and fine surface detail.

Its blanket prohibition on animals, creatures, and existing card artwork undermines representation of Tango Cards and Animal Outsider. Its ban on words also leaves Name Quest's defining object—a name—absent. Restricting generated lettering is sensible; forbidding deliberately typeset text or use of the project's own approved assets is unnecessarily limiting.

The existing guidance also conflicts internally: the README locks in doodle wallpaper and thick framing, while the art-style guide asks for a quiet, project-first index. Fixing these contradictions is part of the redesign, otherwise future additions will reproduce the same problems.

## Proposed direction: a family-made play shelf

A quiet warm page displaying a small collection of specific, surprising toys. The artwork supplies the energy. The surrounding typography and layout make the toys easy to understand and enter.

Keep cream, dark ink, a limited set of warm accents, the real Tango character art, and the family credit. Make the shared preview treatment graphic and controlled: clear silhouettes, consistent edges, restrained texture, generous empty areas. Game interiors can retain their own visual needs.

Do not interpret the change as “make everything beige.” The artwork can be vivid. Concentrate color and expression where they describe the game.

## Execution sequence

### 1. Prove the layout through subtraction

Deliverable: a homepage prototype using current artwork.

- Replace wallpaper with a plain warm surface; remove decorative pseudo-elements and title text shadows.
- Reduce the header to title, creator line, and quiet secondary links.
- Use an intentional two-column arrangement for the current four apps; use a single column on mobile.
- Remove category boxes and redundant type/action labels. Keep an obvious launch affordance and keyboard focus treatment.
- Give each preview more relative prominence; use at most one main border treatment per entry.
- Start with 28–36 px app titles, 16–18 px regular descriptions, and a restrained page title; tune against actual rendering.

Acceptance: games dominate the initial view; card titles are readable without consuming most of each card; the layout still feels intentional with all decorative imagery removed. Compare with the current page before commissioning new art.

### 2. Establish one preview system

Deliverable: a four-image contact sheet reviewed at actual display size, plus source compositions.

- Use a shared 4:3 canvas, comparable subject scale, a safe edge margin, and a consistent background treatment.
- Limit each preview to one main idea and two or three supporting colors. Avoid confetti, filler stars, blank prop cards, and simulated wear without a purpose.
- Tango Cards: two or three real collection cards with one memorable character dominant; preserve original card aspect ratios and artwork.
- Marble Battles: a legible board, a few marbles, and a clear trajectory or territory change. Match the current game's actual visual logic rather than implying a different physical board game.
- Name Quest: one deliberately typeset example name and a small set of meaningful category cues. Keep tiny interface details out.
- Animal Outsider: three recognizable animals with an accurate branching relationship, staged as an approachable puzzle. Avoid arbitrary letter-node filler.
- Generated assets, if used, should follow a composition brief and be curated as a set. Add text through code or design tooling. Do not require every preview to be generated.

Acceptance: each preview remains understandable at about 240 px wide; it depicts its own game; all four feel related when titles are hidden. Check fine lines, unintended symbols, material inconsistencies, and cropping at display size.

### 3. Add authentic authorship

Deliverable: compact identity and copy pass.

- Keep the current public name pending a separate naming decision; the older lab name is not an instruction to rename it.
- Consider replacing “Presented by CannedKalle and sons” with “Made by CannedKalle and sons,” if accurate.
- Use direct descriptions such as “Collect strange characters and open card packs” and “Hear a name. Guess what it belongs to.”
- If original family drawings are available, select one strong mark and use it sparingly. Do not fabricate child authorship or manufacture random wobble as a substitute.
- Tune typography first with current fonts; a font purchase or new dependency is not a prerequisite.

Acceptance: the site has a specific human voice without exaggerated marketing language or invented creator stories.

### 4. Carry the system into app shells

Deliverable: consistent navigation, typography, and surface hierarchy around each game.

- Reduce Tango's surrounding borders so existing card frames remain dominant.
- Compact Name Quest's heading and status area so the question and answers take precedence.
- Give Animal Outsider consistent return navigation and quieter pre-answer explanation states.
- Keep Marble's board visually primary and group secondary configuration controls appropriately.
- Coordinate changes to imported static apps with their source in the sibling Apps workspace, so the next import does not overwrite them.

Acceptance: entering a game feels like entering another room in the same site; controls remain readable, keyboard accessible, and suited to the mechanics.

### 5. Replace contradictory guidance and validate

Deliverable: revised README visual locks, `docs/visual-style.md`, `docs/art-styles.md`, and `docs/art-direction-prompt.md` after the prototype direction is selected.

- Define measurable rules for layout, type scale, preview composition, color, framing, and texture.
- Explicitly allow approved project assets and purposeful typeset text.
- Check desktop and mobile at representative widths (390, 768, 1280 px), long titles, image crops, focus states, and actual game launch/return paths.
- Ask a few people unfamiliar with the site what each thumbnail lets them do and what they notice first. Treat this as qualitative feedback, not a statistically meaningful study.

Success: visitors see the games before the decoration, can distinguish the activities without reading a paragraph, and encounter one coherent visual system. New additions can follow the documented rules without inventing another art style.

## Separate functional finding

The local `/marble-battles` wrapper rendered a 404 inside its iframe. Its configured source is `/apps/marble-battles`, while `/apps/marble-battles/index.html` loaded successfully. Verify and repair the route as an early quality fix; this observation does not establish production behavior.

## Scope of this review

This file records findings and a proposed implementation order. No site styles, assets, game mechanics, routes, or existing style rules were changed as part of the review.
