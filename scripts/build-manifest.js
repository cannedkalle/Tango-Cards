const fs = require("fs");
const path = require("path");

const root = "assets/cards";
const base = path.join(process.cwd(), root);

function titleCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const canonicalFiles = [
  ...Array.from({ length: 20 }, (_, index) => `Series A/series-a-card-${String(index + 1).padStart(2, "0")}.jpg`),
  ...Array.from({ length: 20 }, (_, index) => `Series B/series-b-card-${String(index + 1).padStart(2, "0")}.jpg`),
  ...Array.from({ length: 20 }, (_, index) => `Series C/series-c-card-${String(index + 1).padStart(2, "0")}.jpg`),
  "Series D/finalized-20-cards/series-d-card-01-banana-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-02-blueberry-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-03-avocado-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-04-carrot-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-05-watermelon-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-06-lemon-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-07-pineapple-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-08-tomato-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-09-grape-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-10-strawberry-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-11-eggplant-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-12-mango-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-13-corn-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-14-apple-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-15-broccoli-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-16-kiwi-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-17-cucumber-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-18-pumpkin-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-19-durian-bird.jpg",
  "Series D/finalized-20-cards/series-d-card-20-pea-bird.jpg",
];

const files = canonicalFiles
  .map((file) => path.join(base, file))
  .filter((file) => fs.existsSync(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const cards = files.map((file, index) => {
  const src = path.relative(process.cwd(), file).split(path.sep).join("/");
  const parts = src.split("/");
  const group = parts[2] || "Cards";
  const subfolder = parts.length > 4 ? parts[3] : "";
  const id = path.basename(file, ".jpg");
  const key = src
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const number = (id.match(/card-(\d+)/) || [])[1] || "";
  const rawTitle = id
    .replace(/^series-[a-z]-card-\d+-?/, "")
    .replace(/^series-[a-z]-card-\d+/, "")
    .replace(/-v\d.*$/, "")
    .replace(/-lettering-test$/, "")
    .replace(/-diversity$/, "");
  const isFinal = subfolder === "final" || subfolder === "finalized-20-cards";
  const status =
    isFinal
      ? "Final"
      : id.includes("-v") || id.includes("lettering") || id.includes("diversity")
        ? "Draft"
        : "Main";

  return {
    key,
    id,
    series: isFinal ? `${group} Final` : group,
    group,
    status,
    number,
    title: rawTitle ? titleCase(rawTitle) : `${group} Card ${number || index + 1}`,
    src,
  };
});

fs.writeFileSync("cards-data.js", `window.TANGO_CARDS = ${JSON.stringify(cards, null, 2)};\n`);
console.log(`Wrote ${cards.length} cards to cards-data.js`);
