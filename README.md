# Tango Cards Gallery

A Next.js website for browsing the generated Tango Cards artwork.

Run locally with:

```sh
npm install
npm run dev
```

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

The `Support Tango Cards` header link defaults to:

```txt
https://ko-fi.com/cannedkalle
```

Set `NEXT_PUBLIC_KOFI_URL` in Vercel Project Settings if the Ko-fi URL should be different.

## Popularity Sorting

Series popularity is based on `added_to_binder` events from the last 30 days.

To enable it on Vercel:

1. Add a Postgres-compatible database integration to the Vercel project, such as Neon through the Vercel Marketplace.
2. Make sure Vercel exposes `POSTGRES_URL` or `POSTGRES_PRISMA_URL` to the project.
3. Redeploy normally with `npm run build`.

The app records visitor interactions through `/api/events` and reads series popularity through `/api/series-popularity`. The database table is created automatically on first use.

If no Postgres environment variable is configured, the app keeps the default Series A-D order and still works locally. Event requests are accepted but not recorded.

## Regenerate Display Assets

From the project root, run:

```sh
for src in outputs/Series\ A/*.png outputs/Series\ B/*.png outputs/Series\ C/*.png outputs/Series\ D/*.png outputs/Series\ D/final/*.png; do [ -f "$src" ] || continue; case "$src" in *contact-sheet*) continue ;; esac; rel="${src#outputs/}"; dest="website/Tango Cards/assets/cards/${rel%.png}.jpg"; mkdir -p "$(dirname "$dest")"; sips -s format jpeg -s formatOptions 82 -Z 1100 "$src" --out "$dest" >/dev/null; done
```

Then regenerate `cards-data.js` from inside this website folder:

```sh
node scripts/build-manifest.js
```
