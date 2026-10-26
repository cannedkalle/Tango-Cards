// Familiar pets, farm animals, wildlife and small creatures for ages 6–10.
// Stable IDs keep this list independent of display-name changes.
export const easyAnimalIds = new Set([
  "dog", "wolf", "fox", "cat", "lion", "tiger", "leopard", "cheetah",
  "brown-bear", "polar-bear", "panda", "horse", "zebra", "donkey",
  "cow", "goat", "sheep", "pig", "deer", "giraffe", "elephant",
  "mouse", "rat", "squirrel", "hamster", "rabbit", "gorilla", "monkey",
  "kangaroo", "koala", "dolphin", "blue-whale", "seal",
  "duck", "goose", "swan", "chicken", "turkey", "eagle", "owl",
  "parrot", "penguin", "flamingo", "crocodile", "alligator", "turtle",
  "lizard", "snake", "frog", "toad", "goldfish", "great-white-shark",
  "butterfly", "moth", "bee", "ant", "ladybug", "spider",
  "crab", "lobster", "octopus", "squid", "snail", "slug"
]);

export function getAnimalPool(animals, difficulty) {
  return difficulty === "easy" ? animals.filter(animal => easyAnimalIds.has(animal.id)) : animals;
}
