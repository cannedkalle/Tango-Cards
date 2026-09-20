# Kids Play Portal Content Style

Use this guide for names, labels, buttons, helper text, and app descriptions. The writing should match the visual style: simple, personal, concrete, and playful without sounding like marketing or generated filler.

## Voice

The lab voice is an authored family play index.

- Warm, plain, and specific.
- Short enough for kids to scan.
- Useful enough for parents to understand what opens.
- More like a handmade project label than a product pitch.

Good default tone: "Here is a thing to play with."

Avoid default tone: "Discover an immersive experience designed to unlock creativity."

## Naming Rules

Use these names consistently by context:

- Public site name: `Kids Play Portal`. This appears in the homepage title, browser metadata, and back links.
- Internal project name: `Kids Play Portal`. This is for the repository, package, README, and implementation notes only.
- App names: `Tango Cards`, `Marble Battles`, `Name Quest`, `Animal Outsider`, and `Before the Bulb`. These appear on app cards, app shells, and page metadata.
- Legacy URL redirects belong in `next.config.js`, not mismatched public route folders.

- Public UI may say `play ideas`, `apps`, `cards`, `game`, or `gallery`.
- Use `Made by CannedKalle and sons.` as the creator line.
- Use app type labels only when they help choose: `Gallery app`, `Game app`, `Card gallery`.
- Avoid internal project names, route names, repository names, deployment language, or build-process words in public UI.

## Lab Copy

Lab copy should help a visitor choose where to go.

- App card title: app name.
- App card description: one concrete sentence about the play action.
- App card footer: one short noun or verb such as `Gallery`, `Game`, `Play`, `Cards`, `Board`.
- Header actions: creator-facing only, currently `Contact Creator` and `Support Creator`.

Good:

- `Browse bright collectible cards and open expansion packs.`
- `Launch marbles, claim tiles, and watch the board shift.`

Avoid:

- `Explore a magical world of interactive imagination.`
- `2 apps`
- `More experiments soon`
- `GitHub to Vercel`
- `Generated images`

## App Shell Copy

App shell copy should bridge from the lab into the app without taking over the app.

- Keep topbar eyebrow short: `Card gallery`, `Marble board`, `Pack table`.
- Keep stats plain: `5 series`, `100 cards`, `4/4 chances`.
- Use `Back to all apps` for return navigation.
- Prefer play-object words over technical words.

Good:

- `Open expansion packs`
- `Card gallery`
- `My binder`
- `Open pack`
- `Ready when you are.`

Use sparingly:

- `Local collection`, because it explains browser-only saved state.
- `Sort by`, because it is a plain control label.

Avoid:

- `Generated card gallery`
- `Generated images`
- `Simulation controls`
- `Cosmetic settings`
- `Map/Grid settings`

## Control Labels

Controls can be more functional than lab cards, but should still sound like a game table.

- Use short labels.
- Use title case for visible button and section labels.
- Use sentence case for descriptions and helper text.
- Avoid slash-heavy labels unless the app mechanic truly needs them.
- Avoid engineering terms when a play term exists.

Preferred replacements:

- `Simulation controls` -> `Game controls`
- `Map/Grid Settings` -> `Board`
- `Cosmetic Settings` -> `Look`
- `Pinboard and Pinball Settings` -> `Pins and marbles`
- `Cannon and Marble Settings` -> `Launchers`
- `Converted Tiles / Level` -> `Tiles per level`
- `Concurrent Pinballs` -> `Marbles at once`
- `Active Limit` -> `Marble limit`
- `Shuffle Colors` -> `Mix colors`

## Status And Counts

Counts should be useful, not braggy.

- Use counts when they explain inventory or current state.
- Do not use counts as decorative badges on the lab.
- Avoid analytics-facing copy unless the user selected a sorting mode where it matters.

Good:

- `100 cards`
- `5 series`
- `4/4 chances`
- `No chances ready`

Avoid:

- `100 generated images`
- `2 apps`
- `Pack opens in 30 days` unless the current sort mode needs that context.

## Support And Contact

Support/contact links belong to the creator, not individual apps.

- Use `Support Creator`.
- Use `Contact Creator`.
- Do not use `Support Tango Cards` or app-specific donation language.
- Do not show GitHub, Vercel, or repository publishing information in public UI.

## Error And Empty States

Keep empty and waiting states kind.

Good:

- `Ready when you are.`
- `Choose a pack and open your first pull.`
- `Your binder is empty.`
- `No chances ready.`

Avoid:

- `No data available.`
- `Error occurred.`
- `Invalid state.`

## Anti-Styles

- Marketing copy: "unlock", "discover", "immersive", "curated experience", "seamless journey".
- Implementation copy: "generated", "repository", "Vercel", "simulation", "API", "database", "route".
- Dashboard copy: "status", "metrics", "analytics", "active users", "engagement".
- Over-cute copy: babyish words, forced rhymes, exclamation marks everywhere.
- Vague copy: labels that could fit any app.

## Quick Decision Rules

- If a child cannot guess what opens, make the label more concrete.
- If a parent cannot tell what state is saved, add one plain helper phrase.
- If the text describes how the site was built, move it to docs.
- If the text sounds like a pitch deck, rewrite it as an object or action.
- If the text repeats what the image already shows, shorten it.
- If a control label is long, make it a noun phrase first.

Return navigation is always the shared `pf-back` control: a hidden decorative left arrow plus “Back to all apps”, linking to `/`, in the top `pf-portal-nav` row before the app heading. React apps use `PortalNav`; static apps use equivalent markup and the shared CSS. Do not add duplicate return links inside app controls.
