# Kids Play Portal

A Next.js website for polished kids play apps. This repository is published from GitHub/Vercel and is wired to `https://github.com/cannedkalle/Tango-Cards`.

## Project Role

Kids Play Portal owns the art, design, publishing, and launch layer for the play ecosystem. It should make each app feel visually curated, polished, and easy to launch.

The `apps/` folder in this repo owns app-specific source where practical: rules, simulations, game mechanics, datasets, state, and core interactions. This portal owns how those apps are represented on the site: app registry entries, preview art, route wiring, typography, layout, and launch experience.

Every app added to the portal should have two-way navigation: the portal links into the app, and the app experience links back to the portal. Shared shell elements should feel consistent, while the app interior can keep the visual details needed for its own play pattern.

## App sources

- This repo is the single source of truth: the website and the standalone games all live here.
- App inventory for the website lives in `lib/apps.js`.
- Standalone game sources live in `apps/<app-id>/`.
- Release wiring (which apps get copied into the site) lives in `app-manifest.json`.
- Static app exports are imported into the website with `npm run apps:import`. The build runs this automatically, and the generated output in `public/apps/` is not committed.

The current app set is:

- `tango-cards`: portal-integrated AI-assisted collectible card gallery.
- `marble-battles`: static simulation app sourced from `apps/marble-battles`.
- `animal-outsider`: static taxonomy game sourced from `apps/animal-outsider`.
- `before-the-bulb`: static invention-history quiz sourced from `apps/before-the-bulb`.
- `name-quest`: portal-integrated AI-assisted categorization game.

For a scalable app catalog, add new app ideas under `apps/<app-id>` and register publishable apps in both the Apps manifest and this portal's `lib/apps.js`. Keep app-specific data inside the app folder, and move only genuinely shared utilities into `lib/`.

## Playform Kids visual system

The approved house style is Playform Kids, for ages 6–10: flat geometric characters, recognizable play objects, warm cream surfaces, dark green type and controls, and a restrained shared palette. All five apps use the same typography, focus treatment, spacing, and shapes. Original collectible card artwork remains content inside this visual system.

The canonical rules are in `docs/visual-style.md`; asset construction is in `docs/art-direction-prompt.md`. Tokens and reusable SVG art live in `public/design-system/`.

After changing shared art or tokens, run `npm run apps:import`. This generates the canvas palette, syncs the design system for local standalone serving, and imports the released apps. Edit Animal Outsider, Marble Battles, and Before the Bulb in `apps/`, never only the generated copies in `public/apps/`.

Run `npm run design:check` for asset and token consistency; `npm run build` includes this check. The build is self-contained: it imports the apps from `apps/` first, so no sibling folder is needed.

Run locally with:

```sh
npm install
npm run dev
```

## GitHub and Vercel Publishing

Repository: https://github.com/cannedkalle/Tango-Cards

Import this GitHub repository into Vercel to publish the lab website.

Use a small README-only commit when testing GitHub push access.

## Deploy on Vercel

This is a Next.js app.

Use these Vercel project settings:

- Framework Preset: `Next.js`
- Root Directory: repository root, or this folder if deploying from a larger repo
- Build Command: `npm run build`
- Output Directory: leave blank / default
- Install Command: default is fine

If Vercel says `No Next.js version detected`, check that the Vercel Root Directory points at the folder containing this `package.json`.

### Ko-fi Link

The lab homepage `Support Creator` link defaults to:

```txt
https://ko-fi.com/cannedkalle
```

Set `NEXT_PUBLIC_KOFI_URL` in Vercel Project Settings if the Ko-fi URL should be different.

### Project on GitHub Link

The `Project on GitHub` header link defaults to the portal repository:

```txt
https://github.com/cannedkalle/Tango-Cards
```

Set `NEXT_PUBLIC_CONTACT_URL` in Vercel Project Settings to use an email form, profile page, or other contact destination.


## Popularity Sorting

Series popularity is based on `added_to_binder` events from the last 30 days. The homepage can also sort by pack opens, based on `pack_opened` events from the last 30 days.

To enable it on Vercel:

1. Add a Postgres-compatible database integration to the Vercel project, such as Neon through the Vercel Marketplace.
2. Make sure Vercel exposes `DATABASE_URL`, `POSTGRES_URL`, or `POSTGRES_PRISMA_URL` to the project.
3. Redeploy normally with `npm run build`.

The app uses `@neondatabase/serverless` to record visitor interactions through `/api/events`, read series popularity through `/api/series-popularity`, and read pack-open counts through `/api/series-pack-opens`. The database table is created automatically on first use.

If no Postgres environment variable is configured, the app keeps the default series order and still works locally. Event requests are accepted but not recorded.

## Expansion Packs

The `/packs` page lets visitors open local digital expansion packs by series. Collection progress is stored in the visitor's browser with `localStorage`.

Pack rules:

- 2 cards per pull.
- 1 pull chance refreshes every 12 hours.
- Pull chances bank up to 4.
- Each card slot rolls independently.
- Pull odds per card slot: Common 60%, Uncommon 25%, Rare 12%, Ultra Rare 3%.

## Regenerate Display Assets

From the project root, run:

```sh
for src in outputs/Series\ A/*.png outputs/Series\ B/*.png outputs/Series\ C/*.png outputs/Series\ D/*.png outputs/Series\ D/finalized-20-cards/*.png; do [ -f "$src" ] || continue; case "$src" in *contact-sheet*) continue ;; esac; rel="${src#outputs/}"; dest="website/Tango Cards/assets/cards/${rel%.png}.jpg"; mkdir -p "$(dirname "$dest")"; sips -s format jpeg -s formatOptions 82 -Z 1100 "$src" --out "$dest" >/dev/null; done
```

Then regenerate `cards-data.js` from inside this website folder:

```sh
node scripts/build-manifest.js
```

## Balls in the Ballpark

Database-backed comparison game at `/wild-guess`, with generated matchups across count, duration, weight, frequency, length, area, volume, and speed. The original 100 authored proposals remain available for editorial review. Run `npm run wild-guess:setup` before first play, then `npm run dev`. See [database evaluation and setup](docs/wild-guess.md), the [editorial pipeline](docs/wild-guess-editorial-pipeline.md), and the [numbered proposal review sheet](docs/wild-guess-comparison-proposals.md).
