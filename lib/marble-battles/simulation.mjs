import { palette } from "./config.mjs";
import { clamp, normalize } from "./vector.mjs";

const baseSize = 2;

export class Simulation {
  constructor(config, bounds) {
    this.bounds = bounds;
    this.reset(config);
  }

  reset(config, colors = palette) {
    this.config = normalizeConfig(config);
    this.teams = makeTeams(this.config, colors);
    this.board = makeBoard(this.config, this.teams);
    this.marbles = [];
    this.events = [];
    this.elapsed = 0;
    this.finishedAt = null;
    this.layout = makeLayout(this.bounds, this.config.teams);
    for (const team of this.teams) spawnPinball(team, this.bounds, this.config);
  }

  updateConfig(patch) {
    this.config = normalizeConfig({ ...this.config, ...patch });
  }

  resize(bounds) {
    this.bounds = bounds;
    this.layout = makeLayout(bounds, this.config.teams);
  }

  step(dt) {
    if (this.finishedAt !== null) return;

    this.elapsed += dt;
    this.updateCannons(dt);
    this.updatePinboards(dt);
    this.moveMarbles(dt);
    this.fadeEvents(dt);

    const winner = getWinner(this.board, this.teams, this.config);
    if (winner) this.finishedAt = this.elapsed;
  }

  state() {
    const territory = countTerritory(this.board, this.teams);
    return {
      config: this.config,
      teams: this.teams,
      board: this.board,
      marbles: this.marbles,
      events: this.events,
      layout: this.layout,
      elapsed: this.elapsed,
      territory,
      winner: getWinner(this.board, this.teams, this.config)
    };
  }

  updateCannons(dt) {
    for (const team of this.teams) {
      if (!team.active) continue;
      const cannon = team.cannon;
      cannon.angle = normalizeAngle(cannon.angle + cannon.direction * this.config.cannonTurnSpeed * dt);
    }
  }

  updatePinboards(dt) {
    for (const team of this.teams) {
      if (!team.active) continue;

      if (team.pinballs.length < team.settings.concurrentPinballs) {
        team.dropTimer -= dt;
        if (team.dropTimer <= 0) {
          spawnPinball(team, this.bounds, this.config);
          team.dropTimer = getDropDelay(this.config);
        }
      }

      const lane = denormalize(team.slot.lane, this.bounds);
      for (const pinball of team.pinballs) {
        updatePinball(pinball, lane, dt);
        const slotIndex = getLandedSlot(pinball, lane, this.config, team.settings.gateDeck);
        if (slotIndex === -1) continue;

        const gate = team.settings.gateDeck[slotIndex] ?? null;
        if (gate) applyGate(team, gate, this);
        team.lastGate = gate;
        team.lastSlotIndex = gate ? slotIndex : null;
        team.lastSlotLife = 0.9;
        pinball.landed = true;
        this.events.push({ teamId: team.id, label: gate.label, life: 1, maxLife: 1 });
      }

      team.pinballs = team.pinballs.filter((pinball) => !pinball.landed);
    }
  }

  moveMarbles(dt) {
    for (const marble of this.marbles) {
      if (!this.teams[marble.teamId]?.active) {
        marble.life = 0;
        continue;
      }

      marble.x += marble.vx * dt;
      marble.y += marble.vy * dt;
      marble.life -= this.config.decayRate * dt;

      containToBoard(marble, this.layout.board);
      captureTile(marble, this.board, this.layout.board, this.config, this.teams);
    }

    this.marbles = this.marbles.filter((marble) => marble.life > 0);
  }

  fadeEvents(dt) {
    for (const event of this.events) event.life -= dt;
    this.events = this.events.filter((event) => event.life > 0);
  for (const team of this.teams) {
    team.lastSlotLife = Math.max(0, team.lastSlotLife - dt);
    team.lastUpgradeLife = Math.max(0, team.lastUpgradeLife - dt);
  }
  }
}

function normalizeConfig(config) {
  const maxPinballRadius = getMaxPinballRadius();
  return {
    ...config,
    teams: normalizeTeamCount(config.teams),
    startingReserve: clamp(Math.round(config.startingReserve), 1, 999),
    gridSize: normalizeGridSize(config.gridSize),
    radius: clamp(Number(config.radius), 3, 16),
    pinballRadius: clamp(Number(config.pinballRadius ?? 5), 3, maxPinballRadius),
    concurrentPinballs: clamp(Math.round(config.concurrentPinballs ?? 1), 1, 6),
    marblePower: clamp(Math.round(config.marblePower ?? 1), 1, 20),
    cannonBaseHp: clamp(Math.round(config.cannonBaseHp ?? 9), 1, 99),
    speed: clamp(Number(config.speed), 20, 300),
    cannonTurnSpeed: clamp(Number(config.cannonTurnSpeed ?? 0.7), 0, 3),
    gateRate: clamp(Number(config.gateRate), 0.25, 5),
    levelUpEvery: clamp(Math.round(config.levelUpEvery ?? 18), 1, 999),
    maxActiveMarbles: clamp(Math.round(config.maxActiveMarbles), 50, 1200),
    gateDeck: normalizeGateDeck(config.gateDeck),
    upgradeDeck: normalizeUpgradeDeck(config.upgradeDeck)
  };
}

function normalizeGateDeck(gateDeck) {
  const source = typeof gateDeck === "string"
    ? gateDeck.split(/[\s,|/]+/)
    : (Array.isArray(gateDeck) ? gateDeck : []);
  const normalized = source.map(normalizeGate).filter(Boolean);
  const nonResetSlots = normalized.filter((gate) => gate.type !== "reset").slice(0, 7);
  return nonResetSlots.length ? insertMiddleReset(nonResetSlots) : makeDefaultGateDeck();
}

function normalizeGate(gate) {
  const raw = typeof gate === "string" ? gate.trim() : gate?.label;
  const [labelText, weightText] = String(raw ?? "").split(":");
  const label = labelText.trim();
  if (!label) return null;
  const weight = clamp(Number(weightText ?? gate?.weight ?? 1), 0.1, 20);
  const upper = label.toUpperCase();
  if (upper === "S") return { type: "shoot", label: "S", value: 1, weight };
  if (upper === "R") return makeResetGate();

  const multiplier = upper.match(/^X(\d+)$/);
  if (multiplier) {
    const value = clamp(Number(multiplier[1]), 2, 99);
    return { type: "multiply", label: `x${value}`, value, weight, path: "multiply" };
  }

  const add = upper.match(/^\+(\d+)$/);
  if (add) {
    const value = clamp(Number(add[1]), 1, 999);
    return { type: "add", label: `+${value}`, value, weight, path: "add" };
  }

  return null;
}

function makeResetGate() {
  return { type: "reset", label: "R", value: 1, weight: 1 };
}

function makeDefaultGateDeck() {
  return [
    { type: "shoot", label: "S", value: 1, weight: 1 },
    { type: "shoot", label: "S", value: 1, weight: 1 },
    makeResetGate(),
    { type: "shoot", label: "S", value: 1, weight: 1 },
    { type: "shoot", label: "S", value: 1, weight: 1 }
  ];
}

function insertMiddleReset(nonResetSlots) {
  const slots = cloneGateDeck(nonResetSlots);
  const middleIndex = Math.floor(slots.length / 2);
  slots.splice(middleIndex, 0, makeResetGate());
  return slots;
}

function normalizeUpgradeDeck(upgradeDeck = []) {
  const allowed = new Set(["concurrentPinballs", "startingReserve", "marblePower", "slot"]);
  return upgradeDeck
    .filter((upgrade) => allowed.has(upgrade.key))
    .map((upgrade) => ({
      key: upgrade.key,
      label: upgrade.label,
      value: clamp(Math.round(upgrade.value ?? 1), 1, 20),
      path: normalizeUpgradePath(upgrade.path),
      gate: upgrade.key === "slot" && upgrade.gate ? normalizeGate(upgrade.gate) : null
    }))
    .filter((upgrade) => upgrade.key !== "slot" || upgrade.path || (upgrade.gate && upgrade.gate.type !== "reset"));
}

function normalizeUpgradePath(path) {
  if (path === "multiply" || path === "add") return path;
  return null;
}

function normalizeTeamCount(value) {
  const count = Math.round(Number(value) || 4);
  if (count <= 2) return 2;
  if (count <= 4) return 4;
  return 8;
}

function normalizeGridSize(value) {
  const raw = clamp(Math.round(Number(value) || 42), 24, 72);
  return clamp(Math.round(raw / 6) * 6, 24, 72);
}

function getMaxPinballRadius() {
  const laneWidth = 0.12 * 1280;
  const pegRadius = 3.5;
  const sideMargin = 16;
  const columns = 5;
  const usableWidth = laneWidth - sideMargin * 2;
  const stepX = usableWidth / (columns - 1);
  const wallClear = sideMargin - pegRadius;
  const horizontalClear = stepX - pegRadius * 2;
  const minGap = Math.min(wallClear, horizontalClear);
  return Math.floor((minGap - 0.5) / 2);
}

function makeTeams(config, colors) {
  return Array.from({ length: config.teams }, (_, id) => ({
    id,
    name: ["Red", "Yellow", "Green", "Blue", "Purple", "Pink", "Orange", "Teal"][id],
    color: colors[id % colors.length],
    active: true,
    baseHp: 0,
    maxBaseHp: 0,
    reserve: 0,
    released: 0,
    captures: 0,
    level: 0,
    nextLevelAt: config.levelUpEvery,
    upgrades: {
      concurrentPinballs: 0,
      startingReserve: 0,
      marblePower: 0,
      slots: []
    },
    settings: makeTeamSettings(config),
    lastUpgrade: null,
    lastUpgradeLife: 0,
    dropTimer: 0.3 + id * 0.2,
    pinballs: [],
    lastGate: null,
    lastSlotIndex: null,
    lastSlotLife: 0,
    cannon: makeCannon(id, config.teams),
    slot: getTeamSlot(id, config.teams)
  })).map((team) => ({ ...team, reserve: 0 }));
}

function makeTeamSettings(config) {
  return {
    concurrentPinballs: config.concurrentPinballs,
    startingReserve: config.startingReserve,
    marblePower: config.marblePower,
    gateDeck: cloneGateDeck(config.gateDeck)
  };
}

function cloneGateDeck(gateDeck) {
  return gateDeck.map((gate) => ({ ...gate }));
}

function getTeamSlot(teamId, teamCount) {
  if (teamCount === 8) {
    const topRow = [
      { x: 0.34, y: 0.035 },
      { x: 0.47, y: 0.035 },
      { x: 0.6, y: 0.035 },
      { x: 0.73, y: 0.035 }
    ];
    const bottomRow = [
      { x: 0.34, y: 0.785 },
      { x: 0.47, y: 0.785 },
      { x: 0.6, y: 0.785 },
      { x: 0.73, y: 0.785 }
    ];
    const position = teamId < 4 ? topRow[teamId] : bottomRow[teamId - 4];
    return { side: teamId < 4 ? "top" : "bottom", lane: { ...position, w: 0.115, h: 0.18 } };
  }

  if (teamCount === 2) {
    const positions = [
      { side: "left", lane: { x: 0.075, y: 0.2, w: 0.12, h: 0.28 } },
      { side: "right", lane: { x: 0.805, y: 0.52, w: 0.12, h: 0.28 } }
    ];
    return positions[teamId];
  }

  const positions = [
    { side: "left", lane: { x: 0.075, y: 0.14, w: 0.12, h: 0.28 } },
    { side: "right", lane: { x: 0.805, y: 0.14, w: 0.12, h: 0.28 } },
    { side: "left", lane: { x: 0.075, y: 0.58, w: 0.12, h: 0.28 } },
    { side: "right", lane: { x: 0.805, y: 0.58, w: 0.12, h: 0.28 } }
  ];
  return positions[teamId];
}

function makeCannon(teamId, teamCount) {
  const center = getBaseCenterUnit(teamId, teamCount);
  const baseAngle = Math.atan2(0.5 - center.y, 0.5 - center.x);
  return {
    baseAngle,
    angle: baseAngle,
    direction: teamId % 2 ? -1 : 1
  };
}

function normalizeAngle(angle) {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
}

function makeBoard(config, teams) {
  const cells = [];
  for (let y = 0; y < config.gridSize; y += 1) {
    const row = [];
    for (let x = 0; x < config.gridSize; x += 1) {
      const teamId = initialZoneOwner(x, y, config.gridSize, teams.length);
      row.push({ teamId, strength: 1, levelUp: false });
    }
    cells.push(row);
  }
  placeLevelUpTiles(cells, teams);

  for (const team of teams) {
    team.reserve = team.settings.startingReserve;
    team.baseHp = config.cannonBaseHp;
    team.maxBaseHp = config.cannonBaseHp;
  }
  return cells;
}

function placeLevelUpTiles(board, teams) {
  for (const team of teams) {
    const origin = findLevelUpOrigin(board, team.id);
    if (!origin) continue;
    for (let y = origin.y; y < origin.y + 2; y += 1) {
      for (let x = origin.x; x < origin.x + 2; x += 1) {
        board[y][x].levelUp = true;
        board[y][x].teamId = null;
        board[y][x].strength = 1;
      }
    }
  }
}

function findLevelUpOrigin(board, teamId) {
  const centroid = getTerritoryCentroid(board, teamId);
  if (!centroid) return null;

  let best = null;
  let bestDistance = Infinity;
  for (let y = 0; y < board.length - 1; y += 1) {
    for (let x = 0; x < board.length - 1; x += 1) {
      if (!isOwnedBlock(board, teamId, x, y)) continue;
      const cx = x + 1;
      const cy = y + 1;
      const distance = (cx - centroid.x) ** 2 + (cy - centroid.y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { x, y };
      }
    }
  }
  return best;
}

function getTerritoryCentroid(board, teamId) {
  let xSum = 0;
  let ySum = 0;
  let count = 0;
  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board.length; x += 1) {
      if (board[y][x].teamId !== teamId) continue;
      xSum += x + 0.5;
      ySum += y + 0.5;
      count += 1;
    }
  }
  return count ? { x: xSum / count, y: ySum / count } : null;
}

function isOwnedBlock(board, teamId, x, y) {
  return board[y][x].teamId === teamId
    && board[y][x + 1].teamId === teamId
    && board[y + 1][x].teamId === teamId
    && board[y + 1][x + 1].teamId === teamId;
}

function initialZoneOwner(x, y, gridSize, teamCount) {
  if (teamCount === 2) return diagonalOwner(x, y, gridSize);
  if (teamCount === 4) return quadrantOwner(x, y, gridSize);

  const zoneSize = gridSize / 3;
  const zx = Math.floor(x / zoneSize);
  const zy = Math.floor(y / zoneSize);
  const zoneKey = `${zx},${zy}`;
  if (zoneKey === "1,1") return null;

  const maps = {
    8: {
      "0,0": 0,
      "1,0": 1,
      "2,0": 2,
      "2,1": 3,
      "2,2": 4,
      "1,2": 5,
      "0,2": 6,
      "0,1": 7
    }
  };
  return maps[teamCount][zoneKey];
}

function diagonalOwner(x, y, gridSize) {
  const diagonal = x + y;
  if (diagonal < gridSize - 1) return 0;
  if (diagonal > gridSize - 1) return 1;
  return x % 2;
}

function quadrantOwner(x, y, gridSize) {
  const half = gridSize / 2;
  if (x < half && y < half) return 0;
  if (x >= half && y < half) return 1;
  if (x < half && y >= half) return 2;
  return 3;
}

function makeLayout(bounds, teamCount = 4) {
  const boardSize = teamCount === 8
    ? Math.min(bounds.width * 0.48, bounds.height * 0.47)
    : Math.min(bounds.width * 0.58, bounds.height * 0.72);
  return {
    board: {
      x: (bounds.width - boardSize) / 2,
      y: (bounds.height - boardSize) / 2,
      size: boardSize
    }
  };
}

function applyGate(team, gate, simulation) {
  if (!team.active) return;

  if (gate.type === "multiply") {
    team.reserve = Math.min(999, Math.max(1, Math.floor(team.reserve * gate.value)));
    return;
  }

  if (gate.type === "add") {
    team.reserve = Math.min(999, team.reserve + gate.value);
    return;
  }

  if (gate.type === "shoot") {
    releaseMarbles(team, simulation, team.reserve);
    team.reserve = team.settings.startingReserve;
    return;
  }

  if (gate.type === "reset") {
    team.reserve = team.settings.startingReserve;
  }
}

function spawnPinball(team, bounds, config) {
  const lane = denormalize(team.slot.lane, bounds);
  const margin = lane.w * 0.22;
  team.pinballs.push({
    x: lane.x + margin + Math.random() * (lane.w - margin * 2),
    y: lane.y + 14,
    vx: (Math.random() - 0.5) * 90,
    vy: 0,
    radius: config.pinballRadius,
    age: 0,
    trail: []
  });
}

function getDropDelay(config) {
  return config.gateRate;
}

function updatePinball(ball, lane, dt) {
  ball.age += dt;
  ball.trail.push({ x: ball.x, y: ball.y });
  if (ball.trail.length > 8) ball.trail.shift();

  const gravity = 760;
  ball.vy += gravity * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  const left = lane.x + 10;
  const right = lane.x + lane.w - 10;
  if (ball.x - ball.radius < left) {
    ball.x = left + ball.radius;
    ball.vx = Math.abs(ball.vx) * 0.72;
  }
  if (ball.x + ball.radius > right) {
    ball.x = right - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 0.72;
  }

  for (const peg of getPegs(lane)) {
    const dx = ball.x - peg.x;
    const dy = ball.y - peg.y;
    const distance = Math.hypot(dx, dy);
    const minDistance = ball.radius + peg.radius;
    if (distance === 0 || distance >= minDistance) continue;

    const normal = normalize(dx, dy);
    ball.x = peg.x + normal.x * minDistance;
    ball.y = peg.y + normal.y * minDistance;
    const dot = ball.vx * normal.x + ball.vy * normal.y;
    ball.vx = (ball.vx - 2 * dot * normal.x) * 0.82 + normal.x * 24 + (Math.random() - 0.5) * 22;
    ball.vy = (ball.vy - 2 * dot * normal.y) * 0.82;
  }

  ball.vx *= 0.994;

}

function getLandedSlot(ball, lane, config, gateDeck) {
  const slotTop = lane.y + lane.h - 24;
  if (ball.y < slotTop) return -1;
  const band = getSlotBand(lane, config, gateDeck);
  const hitX = clamp(ball.x - band.x, 0, band.w);
  let cursor = 0;
  for (let i = 0; i < gateDeck.length; i += 1) {
    cursor += band.w * (gateDeck[i].weight / band.totalWeight);
    if (hitX <= cursor) return i;
  }
  return gateDeck.length - 1;
}

function getSlotBand(lane, config, gateDeck) {
  return {
    x: lane.x,
    w: lane.w,
    totalWeight: gateDeck.reduce((sum, gate) => sum + gate.weight, 0)
  };
}

function getPegs(lane) {
  const pegs = [];
  const columns = 5;
  const rows = 6;
  const pegRadius = 3.5;
  const sideMargin = 16;
  const usableWidth = lane.w - sideMargin * 2;
  const stepX = usableWidth / (columns - 1);
  const top = lane.y + lane.h * 0.18;
  const stepY = lane.h * 0.105;

  for (let y = 0; y < rows; y += 1) {
    const rowColumns = y % 2 ? columns - 1 : columns;
    const rowOffset = y % 2 ? stepX * 0.5 : 0;
    for (let x = 0; x < rowColumns; x += 1) {
      pegs.push({
        x: lane.x + sideMargin + rowOffset + x * stepX,
        y: top + y * stepY,
        radius: pegRadius
      });
    }
  }
  return pegs;
}

function denormalize(rect, bounds) {
  return {
    x: rect.x * bounds.width,
    y: rect.y * bounds.height,
    w: rect.w * bounds.width,
    h: rect.h * bounds.height
  };
}

function releaseMarbles(team, simulation, amount) {
  if (!team.active) return;

  const availableSlots = simulation.config.maxActiveMarbles - simulation.marbles.length;
  const count = Math.max(0, Math.min(amount, availableSlots));
  if (count === 0) return;

  const entry = getEntryPoint(team.id, simulation.layout, simulation.config);
  for (let i = 0; i < count; i += 1) {
    const angle = team.cannon.angle;
    const spread = count > 1 ? (i - (count - 1) / 2) * 0.004 : 0;
    const shotAngle = angle + spread;
    simulation.marbles.push({
      id: `${team.id}-${simulation.elapsed}-${i}-${Math.random()}`,
      teamId: team.id,
      x: entry.x + Math.cos(angle) * 20 + Math.cos(angle + Math.PI / 2) * (Math.random() - 0.5) * 16,
      y: entry.y + Math.sin(angle) * 20 + Math.sin(angle + Math.PI / 2) * (Math.random() - 0.5) * 16,
      vx: Math.cos(shotAngle) * simulation.config.speed,
      vy: Math.sin(shotAngle) * simulation.config.speed,
      radius: simulation.config.radius,
      life: 1,
      power: team.settings.marblePower
    });
  }

  team.released += count;
}

function getEntryPoint(teamId, layout, config) {
  const b = layout.board;
  const tile = b.size / config.gridSize;
  const center = getBaseCenterTiles(teamId, config.teams, config.gridSize);
  return {
    x: b.x + (center.x + 0.5) * tile,
    y: b.y + (center.y + 0.5) * tile
  };
}

function containToBoard(marble, board) {
  if (marble.x - marble.radius < board.x) {
    marble.x = board.x + marble.radius;
    marble.vx = Math.abs(marble.vx);
  }
  if (marble.x + marble.radius > board.x + board.size) {
    marble.x = board.x + board.size - marble.radius;
    marble.vx = -Math.abs(marble.vx);
  }
  if (marble.y - marble.radius < board.y) {
    marble.y = board.y + marble.radius;
    marble.vy = Math.abs(marble.vy);
  }
  if (marble.y + marble.radius > board.y + board.size) {
    marble.y = board.y + board.size - marble.radius;
    marble.vy = -Math.abs(marble.vy);
  }
  marble.x = clamp(marble.x, board.x + marble.radius, board.x + board.size - marble.radius);
  marble.y = clamp(marble.y, board.y + marble.radius, board.y + board.size - marble.radius);
}

function captureTile(marble, board, layout, config, teams) {
  const size = board.length;
  const tile = layout.size / size;
  const x = clamp(Math.floor((marble.x - layout.x) / tile), 0, size - 1);
  const y = clamp(Math.floor((marble.y - layout.y) / tile), 0, size - 1);
  const cell = board[y][x];

  if (cell.levelUp) {
    claimLevelUpTile(cell, marble, teams, config);
    return;
  }

  if (cell.teamId === marble.teamId) {
    cell.strength = Math.min(5, cell.strength + 0.08);
    return;
  }

  const previousTeamId = cell.teamId;
  cell.teamId = marble.teamId;
  cell.strength = 1;
  const attackingTeam = teams[marble.teamId];
  attackingTeam.captures += 1;
  applyPendingLevelUps(attackingTeam, config);
  if (previousTeamId !== null) damageBaseAt(x, y, marble.teamId, teams, config);
  marble.power -= 1;
  if (marble.power <= 0) marble.life = 0;
}

function claimLevelUpTile(cell, marble, teams, config) {
  cell.teamId = marble.teamId;
  cell.strength = 1;
  cell.levelUp = false;
  const team = teams[marble.teamId];
  team.captures += 1;
  applyLevelUp(team, config);
  applyPendingLevelUps(team, config);
  marble.power -= 1;
  if (marble.power <= 0) marble.life = 0;
}

function applyPendingLevelUps(team, config) {
  while (team.captures >= team.nextLevelAt) {
    applyLevelUp(team, config);
    team.nextLevelAt += config.levelUpEvery;
  }
}

function applyLevelUp(team, config) {
  const deck = config.upgradeDeck.length
    ? config.upgradeDeck
    : [{ key: "startingReserve", label: "+1 start", value: 1 }];
  const upgrade = deck[Math.floor(Math.random() * deck.length)];
  team.level += 1;
  if (upgrade.key === "slot") {
    team.upgrades.slots.push({ gate: upgrade.gate, path: upgrade.path });
  } else {
    team.upgrades[upgrade.key] += upgrade.value;
  }
  team.settings = applyTeamUpgrades(config, team.upgrades);
  team.reserve = Math.max(team.reserve, team.settings.startingReserve);
  team.lastUpgrade = upgrade;
  team.lastUpgradeLife = 1.6;
}

function applyTeamUpgrades(config, upgrades) {
  return {
    concurrentPinballs: clamp(config.concurrentPinballs + upgrades.concurrentPinballs, 1, 12),
    startingReserve: clamp(config.startingReserve + upgrades.startingReserve, 1, 999),
    marblePower: clamp(config.marblePower + upgrades.marblePower, 1, 20),
    gateDeck: applySlotUpgrades(config.gateDeck, upgrades.slots)
  };
}

function applySlotUpgrades(baseGateDeck, slotUpgrades) {
  const gateDeck = cloneGateDeck(baseGateDeck);
  for (const upgrade of slotUpgrades) {
    if (upgrade.gate) {
      const replaceIndex = gateDeck.findIndex((gate) => gate.type === "shoot");
      if (replaceIndex === -1) continue;
      gateDeck[replaceIndex] = { ...upgrade.gate };
      continue;
    }
    advanceSlotPath(gateDeck, upgrade.path);
  }
  return normalizeGateDeck(gateDeck);
}

function advanceSlotPath(gateDeck, path) {
  const upgradeIndex = findPathIndex(gateDeck, path);
  if (upgradeIndex !== -1) {
    gateDeck[upgradeIndex] = nextPathGate(gateDeck[upgradeIndex], path);
    return;
  }

  const replaceIndex = path === "add"
    ? findLastShootIndex(gateDeck)
    : gateDeck.findIndex((gate) => gate.type === "shoot");
  if (replaceIndex !== -1) gateDeck[replaceIndex] = firstPathGate(path);
}

function findPathIndex(gateDeck, path) {
  if (path === "add") {
    for (let i = gateDeck.length - 1; i >= 0; i -= 1) {
      if (gateDeck[i].path === path) return i;
    }
    return -1;
  }
  return gateDeck.findIndex((gate) => gate.path === path);
}

function findLastShootIndex(gateDeck) {
  for (let i = gateDeck.length - 1; i >= 0; i -= 1) {
    if (gateDeck[i].type === "shoot") return i;
  }
  return -1;
}

function firstPathGate(path) {
  if (path === "add") return { type: "add", label: "+5", value: 5, weight: 1, path };
  return { type: "multiply", label: "x2", value: 2, weight: 1, path: "multiply" };
}

function nextPathGate(gate, path) {
  if (path === "add") {
    const value = clamp(gate.value + 5, 5, 999);
    return { type: "add", label: `+${value}`, value, weight: gate.weight, path };
  }
  const value = clamp(gate.value + 1, 2, 99);
  return { type: "multiply", label: `x${value}`, value, weight: gate.weight, path: "multiply" };
}

function damageBaseAt(x, y, attackingTeamId, teams, config) {
  const baseOwner = getBaseOwnerAt(x, y, config.gridSize, teams.length);
  if (baseOwner == null || baseOwner === attackingTeamId) return;

  const team = teams[baseOwner];
  if (!team?.active) return;

  team.baseHp -= 1;
  if (team.baseHp <= 0) {
    team.baseHp = 0;
    team.active = false;
    team.pinballs = [];
    team.reserve = 0;
  }
}

function getBaseOwnerAt(x, y, size, teamCount) {
  for (let teamId = 0; teamId < teamCount; teamId += 1) {
    const origin = getBaseOrigin(teamId, teamCount, size);
    if (x >= origin.x && x < origin.x + baseSize && y >= origin.y && y < origin.y + baseSize) {
      return teamId;
    }
  }
  return null;
}

function getBaseOrigin(teamId, teamCount, gridSize) {
  const max = gridSize - baseSize;
  const mid = Math.floor((gridSize - baseSize) / 2);
  const positionsByCount = {
    2: [
      { x: 0, y: 0 },
      { x: max, y: max }
    ],
    4: [
      { x: 0, y: 0 },
      { x: max, y: 0 },
      { x: 0, y: max },
      { x: max, y: max }
    ],
    8: [
      { x: 0, y: 0 },
      { x: mid, y: 0 },
      { x: max, y: 0 },
      { x: max, y: mid },
      { x: max, y: max },
      { x: mid, y: max },
      { x: 0, y: max },
      { x: 0, y: mid }
    ]
  };
  return positionsByCount[teamCount][teamId];
}

function getBaseCenterTiles(teamId, teamCount, gridSize) {
  const origin = getBaseOrigin(teamId, teamCount, gridSize);
  const offset = (baseSize - 1) / 2;
  return {
    x: origin.x + offset,
    y: origin.y + offset
  };
}

function getBaseCenterUnit(teamId, teamCount) {
  const center = getBaseCenterTiles(teamId, teamCount, 100);
  return {
    x: center.x / 99,
    y: center.y / 99
  };
}

function countTerritory(board, teams) {
  const counts = teams.map((team) => ({ ...team, tiles: 0, share: 0 }));
  let neutralTiles = 0;
  const total = board.length * board.length;
  for (const row of board) {
    for (const cell of row) {
      if (cell.teamId === null) {
        neutralTiles += 1;
      } else {
        counts[cell.teamId].tiles += 1;
      }
    }
  }
  for (const count of counts) count.share = count.tiles / total;
  counts.neutralTiles = neutralTiles;
  counts.neutralShare = neutralTiles / total;
  return counts;
}

function getWinner(board, teams, config) {
  const activeTeams = teams.filter((team) => team.active);
  if (activeTeams.length === 1) return activeTeams[0];
  return null;
}

/* Extra named exports for tests; the simulation behavior is unchanged. */
export { normalizeConfig, normalizeGateDeck, normalizeTeamCount, normalizeGridSize };
