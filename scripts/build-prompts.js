const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "data");
const outputFile = path.join(dataDir, "prompts.json");

function findSourceRoot() {
  const candidates = process.env.TANGO_PROMPTS_SOURCE_ROOT
    ? [process.env.TANGO_PROMPTS_SOURCE_ROOT]
    : [
        process.cwd(),
        path.resolve(process.cwd(), ".."),
        path.resolve(process.cwd(), "../.."),
      ];

  return candidates.find((candidate) =>
    fs.existsSync(path.join(candidate, "prompts/card-prompts")) &&
    fs.existsSync(path.join(candidate, "artifacts")),
  );
}

const projectRoot = findSourceRoot();

if (!projectRoot) {
  if (fs.existsSync(outputFile)) {
    console.log("Prompt source files not found; using existing data/prompts.json");
    process.exit(0);
  }

  throw new Error("Prompt source files not found and data/prompts.json is missing");
}

const promptDir = path.join(projectRoot, "prompts/card-prompts");
const artifactDir = path.join(projectRoot, "artifacts");

function read(file) {
  return fs.readFileSync(file, "utf8").trim();
}

function titleCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parsePromptSheet(file) {
  const text = read(file);
  const prompts = {};
  const pattern = /^### (\d{2})\/20 ([^\n]+)\n\n([\s\S]*?)(?=\n### \d{2}\/20 |\s*$)/gm;
  let match;

  while ((match = pattern.exec(text))) {
    const [, number, title, body] = match;
    prompts[number] = `### ${number}/20 ${title}\n\n${body.trim()}`;
  }

  return prompts;
}

function parseD2CardList(file) {
  const text = read(file);
  const prompts = {};
  const styleSource = text.split("\n## Card List")[0] || "";
  const styleBlock = styleSource
    .replace(/^# Series D2 Prompts\s*/, "")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
  const pattern = /^(\d+)\. ([^-]+) - ([^-]+) - (.+)$/gm;
  let match;

  while ((match = pattern.exec(text))) {
    const [, rawNumber, title, rarity, description] = match;
    const number = rawNumber.padStart(2, "0");
    const cardTitle = title.trim();
    const rarityText = rarity.trim();
    const nameBar = cardTitle.toLowerCase();

    prompts[number] = `### ${number}/20 ${cardTitle}

Create artwork for a finalized Series D2 Tango Card featuring ${nameBar} as the clear central specimen.

${styleBlock}

Card-specific content: ${description.trim()}

Use fixed three top header boxes with exact text: SERIES D2, ${number}/20, and ${rarityText.toUpperCase()}. Show the bottom name bar text exactly as ${nameBar}. Keep the name bar, inner card border, and outer card border as separate visible outlined shapes with clear pale gaps between them.

Rarity: ${rarityText}.`;
  }

  return prompts;
}

function addIndividualPromptFiles(prompts, seriesLetter) {
  const prefix = `series-${seriesLetter}-card-`;
  const files = fs
    .readdirSync(promptDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  files.forEach((file) => {
    const number = (file.match(/card-(\d{2})/) || [])[1];
    if (!number) return;
    const id = file.replace(/\.md$/, "");
    prompts[`series-${seriesLetter}-card-${number}`] = read(path.join(promptDir, file));
  });
}

const prompts = {};

addIndividualPromptFiles(prompts, "a");
addIndividualPromptFiles(prompts, "b");

const seriesC = parsePromptSheet(path.join(artifactDir, "series-c-prompts.md"));
Object.entries(seriesC).forEach(([number, prompt]) => {
  prompts[`series-c-card-${number}`] = prompt;
});

const seriesD = parsePromptSheet(path.join(artifactDir, "series-d-prompts.md"));
Object.entries(seriesD).forEach(([number, prompt]) => {
  const heading = prompt.split("\n", 1)[0] || "";
  const subject = heading.replace(/^### \d{2}\/20 /, "").replace(/\s+/g, "-").toLowerCase();
  prompts[`series-d-card-${number}-${subject}`] = prompt;
});

const seriesD2 = parseD2CardList(path.join(artifactDir, "series-d2-prompts.md"));
Object.entries(seriesD2).forEach(([number, prompt]) => {
  const heading = prompt.split("\n", 1)[0] || "";
  const subject = heading.replace(/^### \d{2}\/20 /, "").replace(/\s+/g, "-").toLowerCase();
  prompts[`series-d2-card-${number}-${subject}`] = prompt;
});

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(prompts, null, 2)}\n`);
console.log(`Wrote ${Object.keys(prompts).length} prompts to data/prompts.json`);
