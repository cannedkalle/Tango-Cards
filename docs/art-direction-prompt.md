# Playform Kids asset construction brief

Create a flat vector illustration for a children's play app, ages 6–10. Use the exact palette from `public/design-system/playform.css`, simple circles, rounded rectangles, triangles and a few deliberate paths. Give the subject a recognizable silhouette at small sizes. Keep one focal object and no more than three supporting pieces. If a character is needed, reuse the shared fox, bear or owl geometry, or construct a matching simple face with dot eyes and a small mouth. Keep the expression curious and friendly, not babyish.

Use a 480×300 SVG viewBox for previews. No raster embeds, photographic texture, shadows, gradients, filters, fake depth, glints, paper edges, tape, or arbitrary decorative confetti. No text inside art. Keep accessible labels in the interface. Export small, self-contained SVGs with generous margins.

This is an SVG construction brief, not a requirement to generate bitmap images. Shared `characters.svg` is the source for character geometry; supplied standalone portraits and compositions are its reusable outputs. For a new pose, update the master and affected exports together. Compare faces and proportions side by side before accepting them.

Name the asset for the app, register it in `lib/apps.js`, and run the sync/import and design checks described in [visual-style.md](visual-style.md). Do not invent one-off style rules.
