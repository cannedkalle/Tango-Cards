// Portal owns these shared visual assets. Run after edits, before importing apps.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public', 'design-system');
const css = fs.readFileSync(path.join(source, 'playform.css'), 'utf8');
const colors = Object.fromEntries([...css.matchAll(/--pf-([a-z-]+): (#[a-f0-9]{6});/g)].map(([, name, value]) => [name, value]));
fs.writeFileSync(path.join(source, 'palette.js'), '// Generated from playform.css by npm run design:sync.\nexport const colors = ' + JSON.stringify(colors, null, 2) + ';\nexport const teamColors = [colors.coral, colors.gold, colors.mint, colors.blue, colors.violet, colors.rose, colors.orange, colors.teal];\n');
// Copy the shared assets to the repo root so the standalone games in apps/
// resolve ../../design-system/... when served from the repo root.
const localDesign = path.join(root, 'design-system');
fs.rmSync(localDesign, { recursive: true, force: true });
fs.cpSync(source, localDesign, { recursive: true });
console.log('Synced Playform Kids assets to design-system/ for local app serving.');
