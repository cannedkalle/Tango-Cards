import { seriesList } from "./cards";
import { maxPullChances, pullIntervalMs } from "./pack-state";
import { rarityLabels } from "./rarities";

export { maxPullChances, pullIntervalMs };
export const cardsPerPull = 2;

export const packOdds = [
  { rarity: "common", rate: 0.6 },
  { rarity: "uncommon", rate: 0.25 },
  { rarity: "rare", rate: 0.12 },
  { rarity: "ultra-rare", rate: 0.03 },
];

export const expansionPacks = seriesList.map((series) => ({
  key: `${series.key}-pack`,
  seriesKey: series.key,
  label: `${series.label} Pack`,
  seriesLabel: series.label,
  description: `${series.label} digital cards`,
  coverSrc: series.cards[0]?.src || "",
  odds: packOdds,
}));

export function oddsLabel() {
  return packOdds.map((item) => `${rarityLabels[item.rarity]} ${Math.round(item.rate * 100)}%`).join(" / ");
}
