import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPresetKey, presets } from '../lib/marble-battles/config.mjs';
import {
  Simulation,
  normalizeConfig,
  normalizeGateDeck,
  normalizeGridSize,
  normalizeTeamCount,
} from '../lib/marble-battles/simulation.mjs';

// The simulation only reads width/height off its bounds, so tests pass a
// plain object instead of a canvas — the same 1280x720 arena the page uses.
const BOUNDS = { width: 1280, height: 720 };

function newGame() {
  const sim = new Simulation(presets.royale, BOUNDS);
  // Pinballs spawn on random timers; clear them so steps stay deterministic.
  for (const team of sim.teams) team.pinballs = [];
  return sim;
}

function cellCenter(sim, teamId) {
  for (let y = 0; y < sim.board.length; y += 1) {
    for (let x = 0; x < sim.board.length; x += 1) {
      const cell = sim.board[y][x];
      if (cell.teamId === teamId && !cell.levelUp) {
        const tile = sim.layout.board.size / sim.board.length;
        return {
          x: sim.layout.board.x + (x + 0.5) * tile,
          y: sim.layout.board.y + (y + 0.5) * tile,
          gx: x,
          gy: y,
        };
      }
    }
  }
  throw new Error(`no plain cell for team ${teamId}`);
}

test('presets keep the standalone decks and default', () => {
  assert.equal(defaultPresetKey, 'royale');
  assert.deepEqual(Object.keys(presets), ['royale', 'frenzy', 'tactical']);
  assert.equal(presets.royale.name, 'Multiply or Release');
  assert.equal(presets.frenzy.name, 'Fast Records');
  assert.equal(presets.tactical.name, 'Slow Territory');
  assert.deepEqual(
    presets.royale.gateDeck.map((gate) => gate.label),
    ['S', 'S', 'R', 'S', 'S'],
  );
});

test('gate deck strings normalize with a reset in the middle', () => {
  assert.deepEqual(
    normalizeGateDeck('S,S,R,S,S').map((gate) => gate.label),
    ['S', 'S', 'R', 'S', 'S'],
  );
  assert.deepEqual(
    normalizeGateDeck('x2,+5').map((gate) => gate.label),
    ['x2', 'R', '+5'],
  );
  assert.deepEqual(
    normalizeGateDeck('').map((gate) => gate.label),
    ['S', 'S', 'R', 'S', 'S'],
  );
  assert.deepEqual(
    normalizeGateDeck('R').map((gate) => gate.label),
    ['S', 'S', 'R', 'S', 'S'],
  );
  const weighted = normalizeGateDeck('S:2,R');
  // A single non-reset slot gets the reset inserted before it (middle of 1).
  assert.deepEqual(weighted.map((gate) => gate.label), ['R', 'S']);
  assert.equal(weighted.find((gate) => gate.type === 'shoot').weight, 2);
  assert.equal(weighted.find((gate) => gate.type === 'reset').label, 'R');
});

test('config normalization snaps teams, grid size, and radius', () => {
  assert.equal(normalizeTeamCount(2), 2);
  assert.equal(normalizeTeamCount(3), 4);
  assert.equal(normalizeTeamCount(7), 8);
  assert.equal(normalizeGridSize(43), 42);
  assert.equal(normalizeGridSize(100), 72);
  const config = normalizeConfig({ ...presets.royale, teams: 3, gridSize: 43, radius: 99 });
  assert.equal(config.teams, 4);
  assert.equal(config.gridSize, 42);
  assert.equal(config.radius, 16);
});

test('a deterministic step moves a marble and strengthens its own tile', () => {
  const sim = newGame();
  const spot = cellCenter(sim, 0);
  sim.marbles.push({
    teamId: 0, x: spot.x, y: spot.y, vx: 100, vy: 0, radius: 5, life: 1, power: 1,
  });
  sim.step(0.05);
  const marble = sim.marbles[0];
  assert.equal(marble.x, spot.x + 5);
  assert.equal(marble.y, spot.y);
  assert.equal(marble.life, 1);
  assert.equal(marble.power, 1);
  assert.ok(sim.board[spot.gy][spot.gx].strength > 1);
  assert.equal(sim.elapsed, 0.05);
  assert.equal(sim.state().winner, null);
});

test('a marble captures an enemy tile and spends one power', () => {
  const sim = newGame();
  const spot = cellCenter(sim, 1);
  sim.marbles.push({
    teamId: 0, x: spot.x, y: spot.y, vx: 0, vy: 0, radius: 5, life: 1, power: 2,
  });
  sim.step(0.05);
  assert.equal(sim.board[spot.gy][spot.gx].teamId, 0);
  assert.equal(sim.teams[0].captures, 1);
  assert.equal(sim.marbles[0].power, 1);
  assert.equal(sim.marbles[0].life, 1);
});

test('the game ends when one team remains, and then freezes', () => {
  const sim = newGame();
  sim.teams[1].active = false;
  sim.teams[2].active = false;
  sim.teams[3].active = false;
  sim.step(0.1);
  assert.notEqual(sim.finishedAt, null);
  assert.equal(sim.state().winner.id, 0);
  const elapsed = sim.elapsed;
  sim.step(0.1);
  assert.equal(sim.elapsed, elapsed);
});
