export const PLAY_APPS = [
  {
    id: "wild-guess",
    section: "quiz",
    name: "Balls in the Ballpark",
    shortName: "Balls in the Ballpark",
    kind: "estimation-game",
    label: "Think ridiculously big",
    status: "published",
    route: "/wild-guess",
    previewImage: "/design-system/wild-guess.svg",
    previewClassName: "wild-app-art",
    cardClassName: "wild-app-card",
    description: "Stars or sand? Ants or whales? Pick which side is bigger, heavier, longer, or more frequent.",
    actionLabel: "Play",
    ownership: "portal",
  },
  {
    id: "tango-cards",
    section: "other",
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
    section: "other",
    name: "Marble Battles",
    shortName: "Marble Battles",
    kind: "simulation",
    label: "Watch what happens",
    status: "published",
    route: "/marble-battles",
    previewImage: "/design-system/marble-battles.svg",
    previewClassName: "marble-app-art",
    cardClassName: "marble-app-card",
    description: "Launch marbles, claim tiles, and watch the board shift.",
    actionLabel: "Game",
    ownership: "portal",
  },
  {
    id: "name-quest",
    section: "quiz",
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
    section: "quiz",
    name: "Animal Outsider",
    shortName: "Animal Outsider",
    kind: "taxonomy-game",
    label: "Look closer",
    status: "published",
    route: "/animal-outsider",
    previewImage: "/design-system/animal-outsider.svg",
    previewClassName: "animal-app-art",
    cardClassName: "animal-app-card",
    description: "Three animals. Two closer cousins. Can you spot the outsider?",
    actionLabel: "Play",
    ownership: "portal",
  },
  {
    id: "before-the-bulb",
    section: "quiz",
    name: "Before the Bulb",
    shortName: "Before the Bulb",
    kind: "invention-history-game",
    label: "Travel through time",
    status: "published",
    route: "/before-the-bulb",
    previewImage: "/design-system/before-the-bulb.svg",
    previewClassName: "before-app-art",
    cardClassName: "before-app-card",
    description: "Two things. One curious question. Which came first?",
    actionLabel: "Play",
    ownership: "portal",
  },
  {
    id: "twin-terms",
    section: "quiz",
    name: "Twin Terms",
    shortName: "Twin Terms",
    kind: "riddle-game",
    label: "Two hints. One answer.",
    status: "published",
    route: "/twin-terms",
    previewImage: "/design-system/twin-terms.svg",
    previewClassName: "twin-terms-app-art",
    cardClassName: "twin-terms-app-card",
    description: "Two words from one field's vocabulary. Name the field they both belong to.",
    actionLabel: "Play",
    ownership: "portal",
  },
];

export const APP_NAMES = Object.fromEntries(
  PLAY_APPS.map((app) => [toCamelCase(app.id), app.name]),
);

/* Home page sections. Quiz games first — they are the portal's key
 * section — then the games that are not quizzes: Tango Cards (collecting)
 * and Marble Battles (a simulation). */
export const QUIZ_APPS = PLAY_APPS.filter((app) => app.section === "quiz");
export const OTHER_APPS = PLAY_APPS.filter((app) => app.section === "other");

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
