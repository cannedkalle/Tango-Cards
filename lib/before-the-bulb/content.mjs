/* Before the Bulb content: the full catalog assembled from the repo JSONs.
 * Pure and browser-safe (no node: imports, no process.env). The data is
 * imported statically, so the game needs no fetch before its first question
 * and works offline once installed. The files are unchanged in content. */
import { buildFunWildPairs, validateContent } from './game.mjs';
import baseObjects from './objects.json';
import basePairs from './pairs.json';
import baseSources from './sources.json';
import expansion from './expansion.json';

export const objects = [...baseObjects, ...expansion.objects];
export const pairs = [...basePairs, ...expansion.pairs];
export const sources = [...baseSources, ...expansion.sources];

const { objectMap, sourceMap } = validateContent({ objects, pairs, sources });
export { objectMap, sourceMap };

/* Every clearly ordered pairing that is also a fun comparison — the
 * set Wild mode deals (disconnected chronology never deals). */
export const wildPairs = buildFunWildPairs(objects);
