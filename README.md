# Kids Play Portal

A Next.js website for polished kids play apps. This repository is published from GitHub/Vercel and is wired to `https://github.com/cannedkalle/Tango-Cards`.

## Project Role

Kids Play Portal owns the art, design, publishing, and launch layer for the play ecosystem. It should make each app feel visually curated, polished, and easy to launch.

The sibling `../Kids Play Portal Apps` workspace owns local app experimentation and app-specific source where practical: rules, simulations, game mechanics, datasets, state, and core interactions. This portal owns how those apps are represented on the site: app registry entries, preview art, route wiring, typography, layout, and launch experience.

Every app added to the portal should have two-way navigation: the portal links into the app, and the app experience links back to the portal. Shared shell elements should feel consistent, while the app interior can keep the visual details needed for its own play pattern.

## Two-Folder Workflow

- `Kids Play Portal` is the GitHub/Vercel website repository.
- `Kids Play Portal Apps` is the local app lab for testing AI-assisted playful app ideas.
- App inventory for the website lives in `lib/apps.js`.
- Local app inventory and release wiring lives in `../Kids Play Portal Apps/app-manifest.json`.
- Static app exports are imported into this website with `npm run apps:import`.

The current app set is:

- `tango-cards`: portal-integrated AI-assisted collectible card gallery.
- `marble-battles`: static simulation app sourced from `../Kids Play Portal Apps/apps/marble-battles`.
- `name-quest`: portal-integrated AI-assisted categorization game with mirrored local data in `../Kids Play Portal Apps/apps/name-quest/data`.

For a scalable app catalog, add new app ideas under `../Kids Play Portal Apps/apps/<app-id>` and register publishable apps in both the Apps manifest and this portal's `lib/apps.js`. Keep app-specific data inside the app folder, and move only genuinely shared utilities into `../Kids Play Portal Apps/shared`.

## Locked Visual Elements

Use these as the lab house style so new apps do not drift into generic generated UI:

- Warm paper/doodle background from `assets/site-art/tango-paper-doodles.jpg`
- Heavy ink borders using `--lab-border`
- Rounded-but-not-pill app cards using `--lab-radius`
- Sticker-tab labels for metadata and navigation
- Offset block shadows using `--lab-shadow`
- Hand-cut app preview art inside each lab card
- Two-way navigation on every app shell

Avoid default SaaS cards, glassmorphism, purple-blue gradient blobs, generic feature sections, and explanatory marketing layouts. The portal should feel tactile, kid-made, and curated.

See `docs/visual-style.md` for the locked shape, font, and app-ownership controls. See `docs/art-styles.md` for the named art styles and anti-styles. See `docs/content-style.md` for naming, labels, helper text, and app-shell wording. See `docs/art-direction-prompt.md` for the shared image-generation prompt used by lab-owned app preview art.

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

### Contact Creator Link

The `Contact Creator` header link defaults to:

```txt
https://github.com/cannedkalle
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
