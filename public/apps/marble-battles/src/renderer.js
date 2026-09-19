import { colors } from "/design-system/palette.js";

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  }

  render(state) {
    const ctx = this.context;
    const { width, height } = this.canvas;

    ctx.clearRect(0, 0, width, height);
    drawTable(ctx, width, height);
    drawLanes(ctx, state);
    drawBoard(ctx, state);
    drawCannons(ctx, state);
    drawMarbles(ctx, state);
    drawGateEvents(ctx, state);

    if (state.winner) drawWinner(ctx, width, height, state.winner);
  }
}

function drawTable(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = colors["blue-soft"];
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawBoard(ctx, state) {
  const { board, layout, teams } = state;
  const bounds = layout.board;
  const tileSize = bounds.size / board.length;

  ctx.save();
  ctx.fillStyle = colors["paper"];
  roundRect(ctx, bounds.x - 18, bounds.y - 18, bounds.size + 36, bounds.size + 36, 8);
  ctx.fill();

  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board.length; x += 1) {
      const cell = board[y][x];
      ctx.fillStyle = cell.teamId === null ? colors["line"] : teams[cell.teamId].color;
      ctx.globalAlpha = 0.72 + Math.min(cell.strength, 5) * 0.04;
      ctx.fillRect(bounds.x + x * tileSize, bounds.y + y * tileSize, tileSize + 0.2, tileSize + 0.2);
      if (cell.levelUp) drawLevelUpTile(ctx, bounds, tileSize, x, y);
    }
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= board.length; x += 4) {
    ctx.beginPath();
    ctx.moveTo(bounds.x + x * tileSize, bounds.y);
    ctx.lineTo(bounds.x + x * tileSize, bounds.y + bounds.size);
    ctx.stroke();
  }
  for (let y = 0; y <= board.length; y += 4) {
    ctx.beginPath();
    ctx.moveTo(bounds.x, bounds.y + y * tileSize);
    ctx.lineTo(bounds.x + bounds.size, bounds.y + y * tileSize);
    ctx.stroke();
  }

  drawBases(ctx, state, tileSize);
  drawTeamMarks(ctx, state);
  ctx.restore();
}

function drawLevelUpTile(ctx, bounds, tileSize, x, y) {
  const px = bounds.x + x * tileSize;
  const py = bounds.y + y * tileSize;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  ctx.fillRect(px + tileSize * 0.2, py + tileSize * 0.2, tileSize * 0.6, tileSize * 0.6);
  ctx.strokeStyle = colors["ink"];
  ctx.lineWidth = Math.max(1, tileSize * 0.08);
  ctx.strokeRect(px + tileSize * 0.2, py + tileSize * 0.2, tileSize * 0.6, tileSize * 0.6);
  if (tileSize >= 8) {
    ctx.fillStyle = colors["ink"];
    ctx.font = `800 ${Math.max(6, tileSize * 0.5)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("L", px + tileSize / 2, py + tileSize / 2);
  }
  ctx.restore();
}

function drawBases(ctx, state, tileSize) {
  const { layout, config, teams } = state;
  const b = layout.board;

  for (const team of teams) {
    const base = getBaseRect(team.id, config.teams, config.gridSize, b, tileSize);
    ctx.save();
    ctx.globalAlpha = team.active ? 1 : 0.58;
    ctx.strokeStyle = team.active ? colors["surface"] : "rgba(255,255,255,0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(base.x + 1.5, base.y + 1.5, base.size - 3, base.size - 3);

    const ratio = team.maxBaseHp > 0 ? team.baseHp / team.maxBaseHp : 0;
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(base.x, base.y - 10, base.size, 5);
    ctx.fillStyle = team.color;
    ctx.fillRect(base.x, base.y - 10, base.size * ratio, 5);
    ctx.restore();
  }
}

function drawTeamMarks(ctx, state) {
  const { layout, config, teams } = state;
  const b = layout.board;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = config.teams > 4 ? "800 42px system-ui" : "800 72px system-ui";
  for (const team of teams) {
    const position = getTeamLabelPosition(team.id, config.teams, b);
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.fillText(team.name[0], position.x, position.y);
  }
}

function drawLanes(ctx, state) {
  const { teams, config } = state;
  const { width, height } = ctx.canvas;

  for (const team of teams) {
    const lane = denormalize(team.slot.lane, width, height);

    ctx.save();
    ctx.fillStyle = blend(team.color, colors["paper"], 0.28);
    ctx.strokeStyle = "rgba(37, 32, 27, 0.72)";
    ctx.lineWidth = 4;
    roundRect(ctx, lane.x, lane.y, lane.w, lane.h, 10);
    ctx.fill();
    ctx.stroke();

    drawDropChute(ctx, lane);
    drawSlotHighlight(ctx, lane, team, config);
    drawPegs(ctx, lane);
    drawLaneLabels(ctx, lane, team, config);
    drawUpgradeSummary(ctx, lane, team, config);
    drawPinball(ctx, team);
    if (!team.active) drawEliminatedLane(ctx, lane);
    ctx.restore();
  }
}

function drawPegs(ctx, lane) {
  ctx.fillStyle = "rgba(255,250,240,0.86)";
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
      const px = lane.x + sideMargin + rowOffset + x * stepX;
      const py = top + y * stepY;
      ctx.beginPath();
      ctx.arc(px, py, pegRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLaneLabels(ctx, lane, team, config) {
  const bottom = lane.y + lane.h - 24;
  const gateDeck = team.settings.gateDeck;
  const band = getSlotBand(lane, config, gateDeck);

  ctx.strokeStyle = "rgba(37, 32, 27, 0.22)";
  ctx.lineWidth = 1;
  let cursor = band.x;
  for (let i = 1; i < gateDeck.length; i += 1) {
    cursor += getSlotWidth(gateDeck[i - 1], band);
    ctx.beginPath();
    ctx.moveTo(cursor, lane.y + lane.h - 52);
    ctx.lineTo(cursor, lane.y + lane.h - 8);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "800 15px system-ui";
  cursor = band.x;
  for (const gate of gateDeck) {
    const slotW = getSlotWidth(gate, band);
    ctx.fillStyle = slotColor(gate.label);
    ctx.fillRect(cursor + 4, bottom - 12, Math.max(2, slotW - 8), 24);
    ctx.fillStyle = colors["ink"];
    ctx.fillText(gate.label, cursor + slotW / 2, bottom);
    cursor += slotW;
  }

  ctx.fillStyle = colors["ink"];
  ctx.font = "800 28px system-ui";
  ctx.fillText(team.active ? String(team.reserve) : "KO", lane.x + lane.w / 2, lane.y + 34);
  ctx.font = "700 12px system-ui";
  const stats = `Lv${team.level} P${team.settings.concurrentPinballs} S${team.settings.startingReserve} M${team.settings.marblePower}`;
  ctx.fillText(team.active ? stats : "eliminated", lane.x + lane.w / 2, lane.y + lane.h - 62);
  const activity = team.lastUpgradeLife > 0 && team.lastUpgrade
    ? team.lastUpgrade.label
    : (team.lastGate ? `last ${team.lastGate.label}` : "ready");
  ctx.fillText(team.active ? activity : "", lane.x + lane.w / 2, lane.y + lane.h - 46);
}

function drawUpgradeSummary(ctx, lane, team, config) {
  const summaryW = 92;
  const summaryH = 82;
  const gap = 8;
  const onRight = lane.x + lane.w + summaryW + gap < ctx.canvas.width - 10;
  const x = onRight ? lane.x + lane.w + gap : lane.x - summaryW - gap;
  const y = Math.max(10, Math.min(ctx.canvas.height - summaryH - 10, lane.y + 12));
  const progress = Math.max(0, team.nextLevelAt - team.captures);
  const slotText = team.settings.gateDeck.map((gate) => gate.label).join(" ");

  ctx.save();
  ctx.globalAlpha = team.active ? 1 : 0.54;
  ctx.fillStyle = "rgba(255, 250, 240, 0.9)";
  ctx.strokeStyle = "rgba(37, 32, 27, 0.55)";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, summaryW, summaryH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = team.color;
  ctx.font = "800 12px system-ui";
  ctx.fillText(`Lv ${team.level}`, x + 8, y + 7);
  ctx.fillStyle = colors["ink"];
  ctx.font = "700 11px system-ui";
  ctx.fillText(`Next ${progress}`, x + 48, y + 8);

  ctx.fillStyle = "rgba(37, 32, 27, 0.68)";
  ctx.font = "700 10px system-ui";
  ctx.fillText(`P +${team.upgrades.concurrentPinballs}`, x + 8, y + 27);
  ctx.fillText(`Start +${team.upgrades.startingReserve}`, x + 48, y + 27);
  ctx.fillText(`Power +${team.upgrades.marblePower}`, x + 8, y + 43);

  ctx.fillStyle = colors["ink"];
  ctx.font = "800 10px system-ui";
  ctx.fillText(slotText, x + 8, y + 62);
  ctx.restore();
}

function drawEliminatedLane(ctx, lane) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  roundRect(ctx, lane.x, lane.y, lane.w, lane.h, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.46)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lane.x + 14, lane.y + 14);
  ctx.lineTo(lane.x + lane.w - 14, lane.y + lane.h - 14);
  ctx.moveTo(lane.x + lane.w - 14, lane.y + 14);
  ctx.lineTo(lane.x + 14, lane.y + lane.h - 14);
  ctx.stroke();
  ctx.restore();
}

function drawDropChute(ctx, lane) {
  ctx.save();
  ctx.strokeStyle = "rgba(37, 32, 27, 0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lane.x + lane.w * 0.38, lane.y + 8);
  ctx.lineTo(lane.x + lane.w * 0.38, lane.y + 34);
  ctx.moveTo(lane.x + lane.w * 0.62, lane.y + 8);
  ctx.lineTo(lane.x + lane.w * 0.62, lane.y + 34);
  ctx.stroke();
  ctx.restore();
}

function drawSlotHighlight(ctx, lane, team, config) {
  if (team.lastSlotLife <= 0 || team.lastSlotIndex == null) return;

  const gateDeck = team.settings.gateDeck;
  const band = getSlotBand(lane, config, gateDeck);
  let slotX = band.x;
  for (let i = 0; i < team.lastSlotIndex; i += 1) {
    slotX += getSlotWidth(gateDeck[i], band);
  }
  const slotW = getSlotWidth(gateDeck[team.lastSlotIndex], band);
  const alpha = Math.min(1, team.lastSlotLife / 0.9);
  ctx.save();
  ctx.globalAlpha = 0.35 + alpha * 0.35;
  ctx.fillStyle = team.color;
  ctx.fillRect(slotX + 4, lane.y + lane.h - 43, Math.max(2, slotW - 8), 38);
  ctx.restore();
}

function getSlotBand(lane, config, gateDeck) {
  return {
    x: lane.x,
    w: lane.w,
    totalWeight: gateDeck.reduce((sum, gate) => sum + gate.weight, 0)
  };
}

function getSlotWidth(gate, band) {
  return band.w * (gate.weight / band.totalWeight);
}

function drawPinball(ctx, team) {
  for (const ball of team.pinballs) {
    drawSinglePinball(ctx, team, ball);
  }
}

function drawSinglePinball(ctx, team, ball) {
  ctx.save();
  for (let i = 0; i < ball.trail.length; i += 1) {
    const point = ball.trail[i];
    ctx.globalAlpha = (i + 1) / ball.trail.length * 0.24;
    ctx.fillStyle = team.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, ball.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.shadowColor = team.color;
  ctx.shadowBlur = 0;
  ctx.fillStyle = team.color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colors["ink"];
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function slotColor(label) {
  if (label.includes("x")) return colors["lime"];
  if (label.startsWith("+")) return colors["mint"];
  if (label === "R") return colors["coral"];
  return colors["violet"];
}

function drawCannons(ctx, state) {
  for (const team of state.teams) {
    const cannon = getCannon(team.id, state.layout.board, state.config);
    ctx.save();
    ctx.globalAlpha = team.active ? 1 : 0.36;
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(team.cannon.angle);

    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = team.color;
    roundRect(ctx, -8, -9, 34, 18, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colors["ink"];
    roundRect(ctx, 12, -5, 26, 10, 5);
    ctx.fill();

    ctx.fillStyle = colors["paper"];
    ctx.beginPath();
    ctx.arc(-7, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawMarbles(ctx, state) {
  for (const marble of state.marbles) {
    const team = state.teams[marble.teamId];
    ctx.save();
    ctx.shadowColor = team.color;
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.beginPath();
    ctx.arc(marble.x, marble.y, marble.radius + 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = team.color;
    ctx.beginPath();
    ctx.arc(marble.x, marble.y, marble.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawGateEvents(ctx, state) {
  const { width, height } = ctx.canvas;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 26px system-ui";
  for (const event of state.events) {
    const team = state.teams[event.teamId];
    const lane = denormalize(team.slot.lane, width, height);
    const alpha = Math.max(0, event.life / event.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = team.color;
    ctx.fillText(event.label, lane.x + lane.w / 2, lane.y - 22);
  }
  ctx.restore();
}

function drawWinner(ctx, width, height, winner) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.58)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = winner.color;
  ctx.textAlign = "center";
  ctx.font = "800 56px system-ui";
  ctx.fillText(`${winner.name} Wins`, width / 2, height / 2);
  ctx.fillStyle = colors["paper"];
  ctx.font = "600 20px system-ui";
  ctx.fillText("All other cannon bases were eliminated", width / 2, height / 2 + 42);
  ctx.restore();
}

function denormalize(rect, width, height) {
  return {
    x: rect.x * width,
    y: rect.y * height,
    w: rect.w * width,
    h: rect.h * height
  };
}

function getCannon(teamId, board, config) {
  const tileSize = board.size / config.gridSize;
  const base = getBaseRect(teamId, config.teams, config.gridSize, board, tileSize);
  return {
    x: base.x + base.size / 2,
    y: base.y + base.size / 2
  };
}

function getBaseRect(teamId, teamCount, gridSize, board, tileSize) {
  const origin = getBaseOrigin(teamId, teamCount, gridSize);
  return {
    x: board.x + origin.x * tileSize,
    y: board.y + origin.y * tileSize,
    size: tileSize * 2
  };
}

function getBaseOrigin(teamId, teamCount, gridSize) {
  const max = gridSize - 2;
  const mid = Math.floor((gridSize - 2) / 2);
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
  const positions = positionsByCount[teamCount] ?? positionsByCount[4];
  return positions[teamId];
}

function getTeamLabelPosition(teamId, teamCount, board) {
  const origin = getBaseOrigin(teamId, teamCount, 100);
  const baseCenter = {
    x: board.x + ((origin.x + 1) / 100) * board.size,
    y: board.y + ((origin.y + 1) / 100) * board.size
  };
  return {
    x: baseCenter.x + (board.x + board.size / 2 - baseCenter.x) * 0.38,
    y: baseCenter.y + (board.y + board.size / 2 - baseCenter.y) * 0.38
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function blend(hex, target, amount) {
  const a = parseHex(hex);
  const b = parseHex(target);
  const mix = a.map((value, index) => Math.round(value + (b[index] - value) * amount));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

function parseHex(hex) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
}
