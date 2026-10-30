/* Scalable beautiful-palette generator for Spin Draw discs.
 *
 * The disc's own facet colors are honest but often muddy (low saturation),
 * so they make a boring drawing palette. This module derives a fresh,
 * beautiful palette from them instead — deterministically, so every
 * drawing gets its own unique default palette with no hand-picking:
 *
 * 1. Cluster the facet colors into hue families (weighted by count).
 * 2. Beautify: keep each family's hue, but normalize saturation/lightness
 *    to vivid-yet-pleasing values (S 60%, L 52%).
 * 3. Expand each family into tints and shades by mixing toward the paper
 *    and the ink, then add one neutral gray.
 *
 * Result: 10 colors — 3 families x (tint, base, shade) + 1 neutral —
 * ordered by hue, light to dark within each family.
 *
 * For a new disc: collect its facet colors and run
 *   node -e "import('./lib/spin-draw/palette.mjs').then(m =>
 *     console.log(JSON.stringify(m.buildPalette([...colors]), null, 1)))"
 * then store the output as PALETTE in that disc's data module.
 */

const PAPER = '#fffdf6';
const INK = '#24352f';

const hexRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const rgbHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (hex1, hex2, t) => {
  const [r1, g1, b1] = hexRgb(hex1), [r2, g2, b2] = hexRgb(hex2);
  return rgbHex([lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t)]);
};

function rgbHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? ((g - b) / d + (g < b ? 6 : 0))
    : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function hslHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0]; else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x]; else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c]; else rgb = [c, 0, x];
  return rgbHex(rgb.map((v) => (v + m) * 255));
}
const hueDist = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/* Cluster facet colors into hue families. Returns [{hue, weight}] sorted
 * by weight desc. Achromatic colors fall into the neutral bucket. */
function hueFamilies(colors) {
  const hues = [];
  let neutral = 0;
  for (const hex of colors) {
    const [h, s] = rgbHsl(hexRgb(hex));
    if (s < 0.12) { neutral++; continue; }
    hues.push(h);
  }
  hues.sort((a, b) => a - b);
  const clusters = [];
  for (const h of hues) {
    const last = clusters[clusters.length - 1];
    if (last && hueDist(h, last.hues[last.hues.length - 1]) <= 30) last.hues.push(h);
    else clusters.push({ hues: [h] });
  }
  // Merge first/last across the 0/360 seam.
  if (clusters.length > 1 && hueDist(clusters[0].hues[0], clusters[clusters.length - 1].hues.at(-1)) <= 30) {
    const tail = clusters.pop();
    clusters[0].hues.unshift(...tail.hues);
  }
  const fams = clusters.map((c) => {
    const sorted = [...c.hues].sort((a, b) => a - b);
    return { hue: sorted[Math.floor(sorted.length / 2)], weight: c.hues.length };
  }).sort((a, b) => b.weight - a.weight);
  return { fams, neutral };
}

/* Build the 10-color palette. Returns {colors, defaultIndex}. */
export function buildPalette(facetColors) {
  const { fams } = hueFamilies(facetColors);
  const picked = fams.slice(0, 3).map((f) => ({ ...f }));
  // Guarantee three families: fill with complements of the strongest.
  while (picked.length < 3 && picked.length > 0) {
    const top = picked[0];
    const comp = (top.hue + 180) % 360;
    if (picked.every((f) => hueDist(f.hue, comp) > 30)) picked.push({ hue: comp, weight: 0 });
    else break;
  }
  while (picked.length < 3) picked.push({ hue: [210, 0, 140][picked.length] ?? 210, weight: 0 });

  const families = picked.map((f) => ({
    ...f,
    base: hslHex(f.hue, 0.60, 0.52),
  }));
  const byHue = [...families].sort((a, b) => a.hue - b.hue);
  const colors = [];
  for (const fam of byHue) {
    colors.push(mix(fam.base, PAPER, 0.38)); // tint
    colors.push(fam.base);                   // base
    colors.push(mix(fam.base, INK, 0.35));   // shade
  }
  colors.push(mix(PAPER, INK, 0.5)); // neutral gray

  // Default: the base of the strongest family.
  const topHue = families.sort((a, b) => b.weight - a.weight)[0].hue;
  const famIdx = byHue.findIndex((f) => f.hue === topHue);
  return { colors, defaultIndex: famIdx * 3 + 1 };
}
