# Kids Play Portal Art Styles

Use this as the shared vocabulary for future portal and app-shell design. The portal should feel like a small authored web place for family-made play apps: simple, visual, tactile, and direct.

## Reference Sites

- `neal.fun`: direct personal intro plus project-first index. The site frame stays quiet; each project carries the memorable idea.
- `ncase.me`: authored voice, playful category language, minimal chrome, clear support/contact links.
- `worrydream.com`: strong point of view through plain hierarchy, naming, and restraint rather than decoration.
- `jazerchand.com/playground`: portfolio-like project previews where images and experiments do most of the visual work.

## Recommended Default: Paper Toy Index

This is the house style for the public portal.

- Use warm paper as the main surface.
- Let app preview images provide most of the color and detail.
- Use one small app accent color per app, not a full saturated card background.
- Use dark ink borders, compact square-ish labels, and offset shadows.
- Keep app preview images straight or almost straight. Use no more than a very subtle rotation when the image needs a physical pasted-photo feeling.
- Prefer sparse layouts: title, creator line, creator actions, app entries.

Why this is best: it matches the one-person-site references. The portal feels authored and distinctive, but it does not become a loud product grid or generated toy catalogue.

## Style Option: Cut-Paper Preview Art

Use for portal-owned app thumbnails and occasional app-shell hero art.

- Show the app's play object clearly: cards for Tango Cards, a board and marbles for Marble Battles.
- Use cut-paper forms, visible marker outlines, imperfect collage edges, and warm paper texture.
- Avoid readable text inside the generated image. Site labels live in HTML.
- Avoid generic geometric decoration, mascots, UI screenshots, browser frames, glossy 3D, and smooth gradient blobs.
- Generate from `docs/art-direction-prompt.md`, then extend only the subject section for each app.

Current assets:

- `public/portal-art/tango-cards-preview.jpg`
- `public/portal-art/marble-battles-preview.jpg`

## Style Option: App Accent Board

Use only as a supporting treatment behind an app entry.

- Good: off-white card with a colored left edge, top tape strip, small corner patch, or narrow underline.
- Risky: full solid yellow, mint, blue, or pink card backgrounds. They can look like placeholders and compete with the preview image.
- Avoid diagonal color blocks and large gradients. They read as generated-template decoration.

Decision: move away from full solid app-entry backgrounds. Keep accent colors smaller and let preview images lead.

## Style Option: Pasted Photo

Use when a preview image should feel like a physical object placed onto the portal.

- Good: subtle border, paper shadow, small tape mark, tiny imperfection.
- Risky: obvious rotation on every image. If the generated image already has perspective, extra CSS tilt can feel forced.
- Avoid stacking multiple tilt effects: generated perspective plus CSS rotation plus skewed shadows.

Decision: default to straight previews. Use at most `0.5deg` to `1deg` of rotation for a specific composition.

## Style Option: Handmade UI Controls

Use for creator links, back links, app type labels, filters, and game controls.

- Use compact, square-ish bordered controls.
- Use `--portal-control-radius`, not pill radii.
- Use offset shadows instead of soft floating shadows.
- Use body/UI font sizing that fits the box without looking like SaaS navigation.
- Keep controls functional and quiet. They should not compete with app art.

## Style Option: Full App Interior

Use inside an individual app route when this portal wraps an app.

- Keep shared shell elements consistent: topbar, back-to-portal link, spacing, border language.
- Let the app own its mechanics, gameplay layout, gallery structure, state, and dense interaction surfaces.
- Only apply portal art direction where the app needs a frame, launch surface, or visual bridge back to the portal.

## Anti-Styles

These are known wrong directions for this project.

- Generic AI landing page: gradients, glass cards, large empty hero, vague feature chips.
- Kids SaaS dashboard: too many cards, badges, metrics, and admin-like panels.
- Clip-art playground: random shapes that do not describe the app.
- Over-tilted scrapbook: everything rotated, taped, and shadowed until hierarchy gets noisy.
- Full-color tile grid: saturated card backgrounds fighting with generated thumbnails.
- Novelty-font overload: playful fonts everywhere, hurting readability and polish.

## Quick Decision Rules

- If an element helps launch or return from an app, the portal owns its style.
- If an element is the app's core gameplay or gallery mechanic, the app owns it.
- If an image is only decoration, remove it or make it app-specific.
- If a color fills a large surface, ask whether it is supporting the preview art or competing with it.
- If a tilt is visible before the art is visible, remove the tilt.
- If a button could belong on a generic AI product page, square it off, reduce padding, and make it quieter.
