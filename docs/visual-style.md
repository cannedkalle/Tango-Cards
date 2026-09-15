# Kids Play Portal Visual Style Controls

Kids Play Portal should feel like a small authored web place: simple, playful, direct, and clearly made by a person. The portal owns app representation and art direction. Individual apps own their mechanics and native experience.

Use `docs/art-styles.md` as the named reference for style families, anti-styles, and future art-direction decisions. Use `docs/content-style.md` for naming, labels, helper text, and app-shell wording.

## Reference Notes

- `neal.fun` keeps the index direct and project-first: a short personal line, then web experiments.
- `ncase.me` groups playful work by what visitors can do: play, read, watch.
- `worrydream.com` shows that a personal site can be mostly an index and still feel authored through voice, rhythm, and restraint.

## Font Lock

Use three roles, even when the underlying fallback stack overlaps:

- Display: `--font-display` for the site title, app names, and rare large celebratory words. It should feel direct, friendly, and personal-web poster-like.
- Body: `--font-body` for descriptions, page text, and game/help copy. It should stay readable and informal, with enough warmth for a kids project.
- UI: `--font-ui` for labels, small navigation, counters, controls, and compact actions. It should be sturdy, short, and legible in bordered elements.

Compatible directions for later refinement:

- Keep now: `Trebuchet MS` as the primary display/body/UI face, with `Arial Rounded MT Bold` only as a display fallback and `Avenir Next` as a body/UI fallback.
- If adding bundled webfonts later: use a hand-lettered display face only for headings, paired with a plain rounded sans for body.
- Avoid: generic geometric SaaS fonts, thin modern grotesks, novelty fonts for paragraphs, and fonts that make buttons look like generated product UI.

## Shape

- Use heavy ink borders for lab-owned surfaces: `--lab-border`.
- Use irregular sticker corners for cards: `--lab-card-radius`.
- Use small uneven corners for buttons, labels, and navigation: `--lab-control-radius`.
- Lock fixed-format play objects with aspect ratios. Tango Cards images use `5 / 7`; Marble Battles arena uses `16 / 9`; lab app previews use `4 / 3`.
- Avoid AI-like rounded buttons. Do not use pill buttons for lab navigation, app labels, or metadata.
- Public app cards should not need separate CTA buttons. The whole card is the link; use a tiny underlined type label such as `Gallery` or `Game` when useful.
- Do not show internal publishing, repository, or roadmap metadata on the public lab unless it helps a visitor choose an app.
- True circles are allowed only when the content calls for them, such as marbles, counters, or game pieces.
- Use offset shadows instead of soft floating shadows: `--lab-shadow` and `--lab-shadow-hover`.

## Fonts

- Display font: `--font-display`.
- Body font: `--font-body`.
- UI font: `--font-ui`.
- Keep the current rounded/system stack until there is a specific reason to add webfont loading. It feels informal and hand-made without relying on trendy AI-site typography.
- Avoid geometric SaaS fonts, ultra-smooth hero type, tiny uppercase nav systems, and over-polished marketing typography.

## Image Art Lock

- App preview images must be generated from `docs/art-direction-prompt.md` or an app-specific extension of it.
- Each app preview should show the app's play object, not abstract decoration. Tango Cards uses collectible card art; Marble Battles uses a handmade territory board with marbles.
- Do not use cheap placeholder geometry for app entry art.
- Do not include readable text inside generated preview images; the site provides labels outside the artwork.
- Use app-entry backgrounds as quiet support surfaces. Prefer paper-colored cards with small app accent areas over full solid-color cards.
- Keep app preview images straight by default. Use only subtle rotation when the specific composition benefits from a pasted-photo feeling.

## Lab-Owned Elements

- Homepage app cards.
- Preview art inside app cards.
- App type labels.
- Topbar framing.
- Back links labeled with the public site name: `Back to Kids Play Portal`.
- Cross-app spacing, borders, shadows, and typography.

## App-Owned Elements

- Tango Cards gallery views, card data, packs, and gallery mechanics.
- Marble Battles simulation, controls, canvas rendering, and game mechanics.
- Any future app's core rules, state, and interaction model.

## Keep It Simple

The lab should behave like a memorable index of play apps, not a product landing page. Prefer one strong visual idea, direct labels, and useful launch cards over decorative filler.
