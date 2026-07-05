const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(process.cwd(), "../..");
const dataDir = path.join(process.cwd(), "data");
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

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "prompts.json"), `${JSON.stringify(prompts, null, 2)}\n`);
console.log(`Wrote ${Object.keys(prompts).length} prompts to data/prompts.json`);
