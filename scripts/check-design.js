const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'public/design-system');
const css = fs.readFileSync(path.join(assets, 'playform.css'), 'utf8');
const colors = Object.fromEntries([...css.matchAll(/--pf-([a-z-]+): (#[a-f0-9]{6});/g)].map(([, k, v]) => [k, v]));
const errors = [];
const palette = fs.readFileSync(path.join(assets, 'palette.js'), 'utf8');
if (!palette.includes(JSON.stringify(colors, null, 2))) errors.push('Canvas palette is stale. Run npm run design:sync.');
for (const file of fs.readdirSync(assets).filter(f => f.endsWith('.svg'))) {
  const svg = fs.readFileSync(path.join(assets, file), 'utf8');
  if (!svg.includes('viewBox=')) errors.push(`${file}: missing scalable viewBox`);
  if (/<(?:filter|image|linearGradient|radialGradient|text)\b/i.test(svg)) errors.push(`${file}: unsupported art effect or embedded text/image`);
}
const registry = fs.readFileSync(path.join(root, 'lib/apps.js'), 'utf8');
for (const [, url] of registry.matchAll(/"(\/(?:design-system|assets|apps)\/[^"\n]+)"/g)) {
  if (!fs.existsSync(path.join(root, 'public', url))) errors.push(`Missing registered asset: ${url}`);
}
// The shared stylesheet is loaded globally by the portal shell now that
// every game is portal-native; there are no standalone game stylesheets
// left to check per game.
if (!fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8').includes('playform')) errors.push('app/globals.css: missing shared stylesheet');
for (const file of ['app/globals.css', 'app/page.jsx', 'lib/apps.js']) {
  if (/lab-art\/|tango-paper-doodles/.test(fs.readFileSync(path.join(root, file), 'utf8'))) errors.push(`${file}: retired visual reference`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Playform Kids: registered assets, SVG constraints, shared styles and canvas palette are consistent.');
