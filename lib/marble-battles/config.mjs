import { teamColors } from "./palette.mjs";

export const palette = teamColors;

export const presets = {
  royale: {
    name: "Multiply or Release",
    teams: 4,
    startingReserve: 1,
    gridSize: 42,
    radius: 5,
    pinballRadius: 5,
    concurrentPinballs: 1,
    marblePower: 1,
    cannonBaseHp: 9,
    speed: 92,
    cannonTurnSpeed: 0.7,
    gateRate: 1.5,
    levelUpEvery: 100,
    maxActiveMarbles: 360,
    decayRate: 0,
    gateDeck: [
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "reset", label: "R", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 }
    ],
    upgradeDeck: [
      { key: "concurrentPinballs", label: "+1 concurrent pinball", value: 1 },
      { key: "slot", label: "x2 slot", path: "multiply" },
      { key: "startingReserve", label: "+1 starting number", value: 1 },
      { key: "marblePower", label: "+1 marble power", value: 1 },
      { key: "slot", label: "+5 slot", path: "add" }
    ]
  },
  frenzy: {
    name: "Fast Records",
    teams: 4,
    startingReserve: 1,
    gridSize: 54,
    radius: 4,
    pinballRadius: 5,
    concurrentPinballs: 1,
    marblePower: 1,
    cannonBaseHp: 9,
    speed: 128,
    cannonTurnSpeed: 1,
    gateRate: 0.95,
    levelUpEvery: 100,
    maxActiveMarbles: 520,
    decayRate: 0,
    gateDeck: [
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "reset", label: "R", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 }
    ],
    upgradeDeck: [
      { key: "concurrentPinballs", label: "+1 concurrent pinball", value: 1 },
      { key: "slot", label: "x2 slot", path: "multiply" },
      { key: "startingReserve", label: "+1 starting number", value: 1 },
      { key: "marblePower", label: "+1 marble power", value: 1 },
      { key: "slot", label: "+5 slot", path: "add" }
    ]
  },
  tactical: {
    name: "Slow Territory",
    teams: 4,
    startingReserve: 1,
    gridSize: 36,
    radius: 6,
    pinballRadius: 5,
    concurrentPinballs: 1,
    marblePower: 1,
    cannonBaseHp: 9,
    speed: 68,
    cannonTurnSpeed: 0.45,
    gateRate: 1.8,
    levelUpEvery: 100,
    maxActiveMarbles: 260,
    decayRate: 0,
    gateDeck: [
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "reset", label: "R", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 },
      { type: "shoot", label: "S", value: 1, weight: 1 }
    ],
    upgradeDeck: [
      { key: "concurrentPinballs", label: "+1 concurrent pinball", value: 1 },
      { key: "slot", label: "x2 slot", path: "multiply" },
      { key: "startingReserve", label: "+1 starting number", value: 1 },
      { key: "marblePower", label: "+1 marble power", value: 1 },
      { key: "slot", label: "+5 slot", path: "add" }
    ]
  }
};

export const defaultPresetKey = "royale";
