import { defaultPresetKey, presets } from "./config.js";
import { CanvasRenderer } from "./renderer.js";
import { Simulation } from "./simulation.js";
import { ControlPanel } from "./ui.js";

const canvas = document.querySelector("#arena");
const renderer = new CanvasRenderer(canvas);
let presetKey = defaultPresetKey;
let paused = false;
let lastTime = performance.now();
let activeColors;

const simulation = new Simulation(presets[presetKey], canvas);
const controls = new ControlPanel(
  {
    presetSelect: document.querySelector("#presetSelect"),
    restartButton: document.querySelector("#restartButton"),
    pauseButton: document.querySelector("#pauseButton"),
    shuffleButton: document.querySelector("#shuffleButton"),
    teamCount: document.querySelector("#teamCount"),
    startingReserve: document.querySelector("#startingReserve"),
    gridSize: document.querySelector("#gridSize"),
    ballRadius: document.querySelector("#ballRadius"),
    pinballRadius: document.querySelector("#pinballRadius"),
    concurrentPinballs: document.querySelector("#concurrentPinballs"),
    marblePower: document.querySelector("#marblePower"),
    cannonBaseHp: document.querySelector("#cannonBaseHp"),
    speed: document.querySelector("#speed"),
    cannonTurnSpeed: document.querySelector("#cannonTurnSpeed"),
    gateRate: document.querySelector("#gateRate"),
    gateSlots: document.querySelector("#gateSlots"),
    levelUpEvery: document.querySelector("#levelUpEvery"),
    maxActiveMarbles: document.querySelector("#maxActiveMarbles"),
    scoreboard: document.querySelector("#scoreboard"),
    statusStrip: document.querySelector("#statusStrip")
  },
  handleControl
);

controls.sync(simulation.config, presetKey, paused);
requestAnimationFrame(loop);

function handleControl(action) {
  if (action.type === "preset") {
    presetKey = action.presetKey;
    simulation.reset(presets[presetKey], activeColors);
  }

  if (action.type === "config") {
    const structuralKeys = ["teams", "startingReserve", "gridSize", "marblePower", "pinballRadius", "concurrentPinballs", "cannonBaseHp", "levelUpEvery", "gateDeck"];
    const needsReset = Object.keys(action.patch).some((key) => structuralKeys.includes(key));
    simulation.updateConfig(action.patch);
    if (needsReset) simulation.reset(simulation.config, activeColors);
  }

  if (action.type === "restart") {
    simulation.reset(simulation.config, activeColors);
  }

  if (action.type === "pause") {
    paused = !paused;
  }

  if (action.type === "colors") {
    activeColors = action.colors;
    simulation.reset(simulation.config, activeColors);
  }

  controls.sync(simulation.config, presetKey, paused);
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  if (!paused) {
    simulation.step(dt);
  }

  const state = simulation.state();
  renderer.render(state);
  controls.renderStatus(state);
  requestAnimationFrame(loop);
}
