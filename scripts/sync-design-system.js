// Portal owns these shared visual assets. Run after edits, before importing apps.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public', 'design-system');
const css = fs.readFileSync(path.join(source, 'playform.css'), 'utf8');
const colors = Object.fromEntries([...css.matchAll(/--pf-([a-z-]+): (#[a-f0-9]{6});/g)].map(([, name, value]) => [name, value]));
fs.writeFileSync(path.join(source, 'palette.js'), '// Generated from playform.css by npm run design:sync.\nexport const colors = ' + JSON.stringify(colors, null, 2) + ';\nexport const teamColors = [colors.coral, colors.gold, colors.mint, colors.blue, colors.violet, colors.rose, colors.orange, colors.teal];\n');
const workspace = path.resolve(process.env.PLAY_APPS_WORKSPACE || path.join(root, '..', 'Kids Play Portal Apps'));
if (!fs.existsSync(path.join(workspace, 'app-manifest.json'))) {
  throw new Error(`Apps workspace not found: ${workspace}`);
}
fs.cpSync(source, path.join(workspace, 'design-system'), { recursive: true });
console.log('Synced Playform Kids assets to Apps workspace.');
