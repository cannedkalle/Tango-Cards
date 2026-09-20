export const PLAY_APPS = [
  {
    id: "tango-cards",
    name: "Tango Cards",
    shortName: "Tango Cards",
    kind: "gallery",
    label: "Collect something curious",
    status: "published",
    route: "/tango-cards",
    previewImage: "/design-system/tango-cards.svg",
    previewClassName: "tango-app-art",
    cardClassName: "tango-app-card",
    description: "Meet strange characters, collect your favorites, and open card packs.",
    actionLabel: "Gallery",
    ownership: "portal",
  },
  {
    id: "marble-battles",
    name: "Marble Battles",
    shortName: "Marble Battles",
    kind: "simulation",
    label: "Watch what happens",
    status: "published",
    route: "/marble-battles",
    publicPath: "/apps/marble-battles/index.html",
    previewImage: "/design-system/marble-battles.svg",
    previewClassName: "marble-app-art",
    cardClassName: "marble-app-card",
    description: "Launch marbles, claim tiles, and watch the board shift.",
    actionLabel: "Game",
    ownership: "apps-workspace",
  },
  {
    id: "name-quest",
    name: "Name Quest",
    shortName: "Name Quest",
    kind: "word-game",
    label: "Give your brain a twist",
    status: "published",
    route: "/name-quest",
    previewImage: "/design-system/name-quest.svg",
    previewClassName: "name-app-art",
    cardClassName: "name-app-card",
    description: "Read a name. Guess what it belongs to. Find something new.",
    actionLabel: "Play",
    ownership: "portal",
  },
  {
    id: "animal-outsider",
    name: "Animal Outsider",
    shortName: "Animal Outsider",
    kind: "taxonomy-game",
    label: "Look closer",
    status: "published",
    route: "/animal-outsider",
    publicPath: "/apps/animal-outsider/index.html",
    previewImage: "/design-system/animal-outsider.svg",
    previewClassName: "animal-app-art",
    cardClassName: "animal-app-card",
    description: "Three animals. Two closer cousins. Can you spot the outsider?",
    actionLabel: "Play",
    ownership: "apps-workspace",
  },
  {
    id: "before-the-bulb",
    name: "Before the Bulb",
    shortName: "Before the Bulb",
    kind: "invention-history-game",
    label: "Travel through time",
    status: "published",
    route: "/before-the-bulb",
    publicPath: "/apps/before-the-bulb/index.html",
    previewImage: "/design-system/before-the-bulb.svg",
    previewClassName: "before-app-art",
    cardClassName: "before-app-card",
    description: "Two things. One curious question. Which came first?",
    actionLabel: "Play",
    ownership: "apps-workspace",
  },
];

export const APP_NAMES = Object.fromEntries(
  PLAY_APPS.map((app) => [toCamelCase(app.id), app.name]),
);

export function getAppById(id) {
  const app = PLAY_APPS.find((candidate) => candidate.id === id);

  if (!app) {
    throw new Error(`Unknown play app: ${id}`);
  }

  return app;
}

function toCamelCase(value) {
  return value.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
