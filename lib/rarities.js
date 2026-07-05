export const rarityOrder = ["common", "uncommon", "rare", "ultra-rare"];

export const rarityLabels = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  "ultra-rare": "Ultra Rare",
};

export function rarityForCard(card) {
  const promptRarity = (card.prompt || "").match(/Rarity:\s*(Ultra Rare|Uncommon|Rare|Common)|Place the (Ultra Rare|Uncommon|Rare|Common) rarity mark/i);
  const rarity = (promptRarity?.[1] || promptRarity?.[2] || "").toLowerCase().replace(/\s+/g, "-");

  if (rarity && rarityLabels[rarity]) return rarity;

  const number = Number(card.number || 0);

  if (number === 20) return "ultra-rare";
  if (number === 5 || number === 10 || number === 15) return "rare";
  if (number % 4 === 0 || number % 7 === 0) return "uncommon";
  return "common";
}

export function decorateCardsWithRarity(cards) {
  return cards.map((card) => ({
    ...card,
    rarity: rarityForCard(card),
  }));
}
