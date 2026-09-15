export const PLAY_APPS = [
  {
    id: "tango-cards",
    name: "Tango Cards",
    shortName: "Tango Cards",
    kind: "gallery",
    label: "Gallery app",
    status: "published",
    route: "/tango-cards",
    previewImage: "/lab-art/tango-cards-preview.jpg",
    previewClassName: "tango-app-art",
    cardClassName: "tango-app-card",
    description: "Browse bright collectible cards and open expansion packs.",
    actionLabel: "Gallery",
    ownership: "portal",
  },
  {
    id: "marble-battles",
    name: "Marble Battles",
    shortName: "Marble Battles",
    kind: "simulation",
    label: "Game app",
    status: "published",
    route: "/marble-battles",
    publicPath: "/apps/marble-battles",
    previewImage: "/lab-art/marble-battles-preview.jpg",
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
    label: "Word game",
    status: "published",
    route: "/name-quest",
    previewImage: "/lab-art/name-quest-preview.png",
    previewClassName: "name-app-art",
    cardClassName: "name-app-card",
    description: "Spot what a name belongs to, then keep the streak going.",
    actionLabel: "Play",
    ownership: "portal",
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
