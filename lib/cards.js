import cards from "../data/cards.json";

export const expectedCardsPerSeries = 20;

export const seriesList = [
  { key: "series-a", label: "Series A", source: "Series A", href: "/series-a/" },
  { key: "series-b", label: "Series B", source: "Series B", href: "/series-b/" },
  { key: "series-c", label: "Series C", source: "Series C", href: "/series-c/" },
  { key: "series-d", label: "Series D", source: "Series D Final", href: "/series-d/" },
].map((series) => ({
  ...series,
  cards: cards.filter((card) => card.series === series.source),
}));

export function getSeriesByKey(key) {
  return seriesList.find((series) => series.key === key);
}

export function bracketCount(count) {
  return `[${count}]`;
}

export function countLabel(count) {
  return `${bracketCount(count)} ${count === 1 ? "card" : "cards"}`;
}

export function allCards() {
  return cards;
}
