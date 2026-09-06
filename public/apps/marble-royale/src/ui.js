import { palette, presets } from "./config.js";

const fields = {
  teamCount: "teams",
  startingReserve: "startingReserve",
  gridSize: "gridSize",
  ballRadius: "radius",
  pinballRadius: "pinballRadius",
  concurrentPinballs: "concurrentPinballs",
  marblePower: "marblePower",
  cannonBaseHp: "cannonBaseHp",
  speed: "speed",
  cannonTurnSpeed: "cannonTurnSpeed",
  gateRate: "gateRate",
  levelUpEvery: "levelUpEvery",
  maxActiveMarbles: "maxActiveMarbles"
};

export class ControlPanel {
  constructor(elements, onChange) {
    this.elements = elements;
    this.onChange = onChange;
    this.colors = [...palette];
    this.bind();
  }

  bind() {
    for (const [presetKey, preset] of Object.entries(presets)) {
      const option = document.createElement("option");
      option.value = presetKey;
      option.textContent = preset.name;
      this.elements.presetSelect.append(option);
    }

    this.elements.presetSelect.addEventListener("change", () => {
      this.onChange({ type: "preset", presetKey: this.elements.presetSelect.value });
    });

    for (const [elementId, configKey] of Object.entries(fields)) {
      this.elements[elementId].addEventListener("input", () => {
    updateOutput(elementId, this.elements[elementId]);
        this.onChange({ type: "config", patch: { [configKey]: readValue(this.elements[elementId]) } });
      });
    }
    this.elements.gateSlots.addEventListener("change", () => {
      this.onChange({ type: "config", patch: { gateDeck: this.elements.gateSlots.value } });
    });

    this.elements.restartButton.addEventListener("click", () => this.onChange({ type: "restart" }));
    this.elements.pauseButton.addEventListener("click", () => this.onChange({ type: "pause" }));
    this.elements.shuffleButton.addEventListener("click", () => {
      this.colors = shuffle([...this.colors]);
      this.onChange({ type: "colors", colors: this.colors });
    });
  }

  sync(config, presetKey, paused) {
    this.elements.presetSelect.value = presetKey;
    this.elements.pauseButton.textContent = paused ? "Resume" : "Pause";

    for (const [elementId, configKey] of Object.entries(fields)) {
      this.elements[elementId].value = config[configKey];
      updateOutput(elementId, this.elements[elementId]);
    }
    this.elements.gateSlots.value = config.gateDeck.map(formatGateToken).join(", ");
  }

  renderStatus(state) {
    const teamScores = state.territory
      .map((team) => {
        const hp = team.active ? `${team.baseHp}/${team.maxBaseHp}` : "KO";
        return `<span class="score-pill"><span class="swatch" style="background:${team.color}"></span>${team.name}: ${(team.share * 100).toFixed(1)}% HP ${hp}</span>`;
      })
      .join("");
    const neutralScore = state.territory.neutralTiles > 0
      ? `<span class="score-pill"><span class="swatch neutral-swatch"></span>Neutral: ${(state.territory.neutralShare * 100).toFixed(1)}%</span>`
      : "";
    this.elements.scoreboard.innerHTML = teamScores + neutralScore;

    this.elements.statusStrip.innerHTML = [
      ["Elapsed", `${state.elapsed.toFixed(1)}s`],
<<<<<<< HEAD
<<<<<<< HEAD
      ["Marbles moving", state.marbles.length],
      ["Marbles waiting", state.teams.reduce((sum, team) => sum + team.reserve, 0)],
      ["Launchers awake", state.teams.filter((team) => team.active).length],
      ["Team levels", state.teams.map(formatTeamLevel).join(" ")],
      ["Slots", formatSlotSummary(state.config)],
      ["Upgrade cards", state.config.upgradeDeck.map((upgrade) => upgrade.label).join(" ")],
=======
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
      ["Active Marbles", state.marbles.length],
      ["Total Counter", state.teams.reduce((sum, team) => sum + team.reserve, 0)],
      ["Active Cannons", state.teams.filter((team) => team.active).length],
      ["Team Levels", state.teams.map(formatTeamLevel).join(" ")],
      ["Slots", formatSlotSummary(state.config)],
      ["Upgrade Deck", state.config.upgradeDeck.map((upgrade) => upgrade.label).join(" ")],
<<<<<<< HEAD
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
      ["Winner", state.winner ? state.winner.name : "Pending"]
    ]
      .map(([label, value]) => `<div class="status-line"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");
  }
}

function formatTeamLevel(team) {
  const slots = team.settings.gateDeck.map((gate) => gate.label).join("");
  return `${team.name[0]}${team.level}(P${team.settings.concurrentPinballs}/S${team.settings.startingReserve}/M${team.settings.marblePower}/${slots})`;
}

function formatGateToken(gate) {
  return gate.weight === 1 ? gate.label : `${gate.label}:${gate.weight}`;
}

function formatSlotSummary(config) {
  const totalWeight = config.gateDeck.reduce((sum, gate) => sum + gate.weight, 0);
  const slots = config.gateDeck
    .map((gate) => `${gate.label} ${(gate.weight / totalWeight * 100).toFixed(1)}%`)
    .join(" ");
  return slots;
}

function readValue(element) {
  if (element.type === "number" || element.type === "range") {
    return Number(element.value);
  }
  return element.value;
}

function updateOutput(elementId, element) {
  if (element.type !== "range") return;

  const output = document.querySelector(`output[data-for="${elementId}"]`);
  if (!output) return;
  const value = Number(element.value);
  output.value = Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
