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

## Regenerate Display Assets

From the project root, run:

```sh
for src in outputs/Series\ A/*.png outputs/Series\ B/*.png outputs/Series\ C/*.png outputs/Series\ D/*.png outputs/Series\ D/final/*.png; do [ -f "$src" ] || continue; case "$src" in *contact-sheet*) continue ;; esac; rel="${src#outputs/}"; dest="website/Tango Cards/assets/cards/${rel%.png}.jpg"; mkdir -p "$(dirname "$dest")"; sips -s format jpeg -s formatOptions 82 -Z 1100 "$src" --out "$dest" >/dev/null; done
```

Then regenerate `cards-data.js` from inside this website folder:

```sh
node scripts/build-manifest.js
```
