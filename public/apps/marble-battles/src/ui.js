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
    // Keep disclosure nodes mounted: live simulation updates must not close
    // a team's details or interrupt keyboard focus.
    const signature = state.teams.map(team => team.id).join(",");
    if (this.teamSignature !== signature) {
      this.teamSignature = signature;
      this.elements.scoreboard.innerHTML = state.teams.map(team => `
        <details class="team-summary" data-team="${team.id}">
          <summary>
            <span class="team-summary-title"><span class="swatch"></span><strong data-stat="name"></strong><span class="team-level" data-stat="level"></span></span>
            <span class="team-scoreline" data-stat="score"></span>
            <span class="team-disclosure" aria-hidden="true">⌄</span>
          </summary>
          <div class="team-details">
            <p class="team-progress-label" data-stat="progress"></p>
            <progress aria-label="Progress to next capture upgrade"></progress>
            <dl class="team-metrics">
              <div><dt>Marbles waiting</dt><dd data-stat="reserve"></dd></div>
              <div><dt>Marbles moving</dt><dd data-stat="moving"></dd></div>
              <div><dt>Marbles at once</dt><dd data-stat="concurrent"></dd></div>
              <div><dt>Starting number</dt><dd data-stat="starting"></dd></div>
              <div><dt>Marble power</dt><dd data-stat="power"></dd></div>
              <div><dt>Tiles captured</dt><dd data-stat="captures"></dd></div>
            </dl>
            <h3>Upgrades earned</h3><p data-stat="upgrades"></p>
            <h3>Latest upgrade</h3><p data-stat="latest"></p>
            <h3>Current slots</h3><p class="team-slot-list" data-stat="slots"></p>
            <p class="team-slot-key">S = shoot waiting marbles · R = reset to starting number</p>
          </div>
        </details>`).join("") + '<p class="neutral-summary"></p>';
      this.teamViews = new Map(state.teams.map(team => {
        const element = this.elements.scoreboard.querySelector(`[data-team="${team.id}"]`);
        return [team.id, {
          element,
          swatch: element.querySelector('.swatch'),
          progress: element.querySelector('progress'),
          fields: Object.fromEntries([...element.querySelectorAll('[data-stat]')].map(node => [node.dataset.stat, node]))
        }];
      }));
    }
    for (const team of state.teams) {
      const view = this.teamViews.get(team.id);
      const territory = state.territory.find(item => item.id === team.id);
      const remaining = Math.max(0, team.nextLevelAt - team.captures);
      const upgrades = [];
      if (team.upgrades.concurrentPinballs) upgrades.push(`+${team.upgrades.concurrentPinballs} marbles at once`);
      if (team.upgrades.startingReserve) upgrades.push(`+${team.upgrades.startingReserve} starting marbles`);
      if (team.upgrades.marblePower) upgrades.push(`+${team.upgrades.marblePower} power`);
      if (team.upgrades.slots.length) upgrades.push(`${team.upgrades.slots.length} slot upgrades`);
      const values = {
        name: `${team.id + 1} · ${team.name}`,
        level: `Level ${team.level}`,
        score: `${((territory?.share ?? 0) * 100).toFixed(1)}% territory · HP ${team.baseHp}/${team.maxBaseHp}${team.active ? '' : ' · Out'}`,
        progress: team.active ? `${remaining} tiles to the next capture upgrade` : 'Team eliminated',
        reserve: team.reserve,
        moving: state.marbles.filter(marble => marble.teamId === team.id).length,
        concurrent: `${team.settings.concurrentPinballs} (+${team.upgrades.concurrentPinballs})`,
        starting: `${team.settings.startingReserve} (+${team.upgrades.startingReserve})`,
        power: `${team.settings.marblePower} (+${team.upgrades.marblePower})`,
        captures: team.captures,
        upgrades: upgrades.join(' · ') || 'No upgrades yet',
        latest: team.lastUpgrade?.label ?? 'Capture tiles to earn upgrades',
        slots: formatSlotSummary(team.settings)
      };
      for (const [key, value] of Object.entries(values)) {
        if (view.fields[key].textContent !== String(value)) view.fields[key].textContent = String(value);
      }
      view.swatch.style.backgroundColor = team.color;
      view.element.classList.toggle('is-eliminated', !team.active);
      view.progress.max = state.config.levelUpEvery;
      view.progress.value = Math.max(0, state.config.levelUpEvery - remaining);
    }
    const neutral = this.elements.scoreboard.querySelector('.neutral-summary');
    neutral.textContent = `Unclaimed territory: ${(state.territory.neutralShare * 100).toFixed(1)}%`;

    this.elements.statusStrip.innerHTML = [
      ["Elapsed", `${state.elapsed.toFixed(1)}s`],
      ["Marbles moving", state.marbles.length],
      ["Marbles waiting", state.teams.reduce((sum, team) => sum + team.reserve, 0)],
      ["Launchers awake", state.teams.filter((team) => team.active).length],
      ["Slots", formatSlotSummary(state.config)],
      ["Upgrade cards", state.config.upgradeDeck.map((upgrade) => upgrade.label).join(" ")],
      ["Winner", state.winner ? state.winner.name : "Pending"]
    ]
      .map(([label, value]) => `<div class="status-line"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");
  }
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
