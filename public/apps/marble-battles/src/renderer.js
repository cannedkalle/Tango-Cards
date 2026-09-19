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
    const view = makeArenaView(state, width, height);
    // Presentation transforms only: collision positions and slot widths stay intact.
    ctx.save();
    const board = state.layout.board;
    ctx.translate(view.board.x, view.board.y);
    ctx.scale(view.board.size / board.size, view.board.size / board.size);
    ctx.translate(-board.x, -board.y);
    drawBoard(ctx, state);
    drawCannons(ctx, state);
    drawMarbles(ctx, state);
    ctx.restore();

    for (const team of state.teams) {
      const source = denormalize(team.slot.lane, width, height);
      const target = view.lanes[team.id];
      ctx.save();
      ctx.translate(target.x, target.y);
      ctx.scale(target.scale, target.scale);
      ctx.translate(-source.x, -source.y);
      drawLanes(ctx, { ...state, teams: [team] });
      drawGateEvents(ctx, { ...state, events: state.events.filter(event => event.teamId === team.id) });
      ctx.restore();
    }

    if (state.winner) drawWinner(ctx, width, height, state.winner);
  }
}

// Pack the visual components around the board instead of retaining the
// simulation's legacy gutters. Uniform scaling keeps circles circular.
function makeArenaView(state, width, height) {
  const padding = 28;
  const gap = 24;
  const boardSize = Math.min(height - padding * 2 - 36, width * 0.54);
  const source = denormalize(state.teams[0].slot.lane, width, height);
  const lanes = {};
  if (state.teams.length === 8) {
    const laneScale = Math.min(
      (height - padding * 2 - gap * 3) / (4 * source.h),
      (width - padding * 2 - boardSize - 60 - gap) / (2 * source.w)
    );
    const laneW = source.w * laneScale;
    const laneH = source.h * laneScale;
    const groupW = boardSize + 60 + 2 * laneW + gap;
    const left = (width - groupW) / 2;
    for (const team of state.teams) {
      lanes[team.id] = {
        x: left + boardSize + 60 + (team.id % 2) * (laneW + gap),
        y: padding + Math.floor(team.id / 2) * (laneH + gap),
        scale: laneScale
      };
    }
    return { board: { x: left, y: (height - boardSize) / 2, size: boardSize }, lanes };
  }
  const rows = state.teams.length / 2;
  const laneScale = Math.min(
    (width - padding * 2 - boardSize - 72) / (2 * source.w),
    (height - padding * 2 - gap * (rows - 1)) / (rows * source.h)
  );
  const laneW = source.w * laneScale;
  const laneH = source.h * laneScale;
  const groupW = laneW * 2 + boardSize + 72;
  const left = (width - groupW) / 2;
  const top = (height - (laneH * rows + gap * (rows - 1))) / 2;
  for (const team of state.teams) {
    lanes[team.id] = {
      x: team.id % 2 ? left + laneW + boardSize + 72 : left,
      y: top + Math.floor(team.id / 2) * (laneH + gap),
      scale: laneScale
    };
  }
  return { board: { x: left + laneW + 36, y: (height - boardSize) / 2, size: boardSize }, lanes };
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
  roundRect(ctx, bounds.x - 18, bounds.y - 18, bounds.size + 36, bounds.size + 36, 24);
  ctx.fill();

  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board.length; x += 1) {
      const cell = board[y][x];
      ctx.fillStyle = cell.teamId === null ? colors["line"] : teams[cell.teamId].color;
      ctx.globalAlpha = 0.80 + Math.min(cell.strength, 5) * 0.04;
      ctx.fillRect(bounds.x + x * tileSize, bounds.y + y * tileSize, tileSize + 0.2, tileSize + 0.2);
      if (cell.levelUp) drawLevelUpTile(ctx, bounds, tileSize, x, y);
    }
  }

  ctx.globalAlpha = 1;

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
  // A quiet, hollow identifier: territory colors stay visible through the glyph.
  const board = state.layout.board;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${board.size * 0.18}px "Avenir Next", "Trebuchet MS", sans-serif`;
  ctx.strokeStyle = colors.ink;
  ctx.globalAlpha = 0.46;
  ctx.lineWidth = Math.max(1.5, board.size * 0.003);
  ctx.lineJoin = "round";
  for (const team of state.teams) {
    const p = getTeamLabelPosition(team.id, state.config.teams, board);
    ctx.strokeText(String(team.id + 1), p.x, p.y);
  }
  ctx.restore();
}

function drawLanes(ctx, state) {
  const { teams, config } = state;
  const { width, height } = ctx.canvas;

  for (const team of teams) {
    const lane = denormalize(team.slot.lane, width, height);

    ctx.save();
    ctx.fillStyle = colors.surface;
    ctx.strokeStyle = team.color;
    ctx.lineWidth = 4;
    roundRect(ctx, lane.x, lane.y, lane.w, lane.h, 22);
    ctx.fill();
    ctx.stroke();

    drawSlotHighlight(ctx, lane, team, config);
    drawPegs(ctx, lane);
    drawLaneLabels(ctx, lane, team, config);
    drawPinball(ctx, team);
    if (!team.active) drawEliminatedLane(ctx, lane);
    ctx.restore();
  }
}

function drawPegs(ctx, lane) {
  ctx.fillStyle = colors.line;
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
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '800 17px "Avenir Next", "Trebuchet MS", sans-serif';
  let cursor = band.x;
  for (const gate of gateDeck) {
    const slotW = getSlotWidth(gate, band);
    ctx.fillStyle = slotColor(gate.label);
    roundRect(ctx, cursor + 3, bottom - 15, Math.max(2, slotW - 6), 30, Math.min(6, slotW / 4));
    ctx.fill();
    ctx.fillStyle = colors.ink;
    ctx.fillText(gate.label, cursor + slotW / 2, bottom, Math.max(2, slotW - 6));
    cursor += slotW;
  }
  // Team number links each lane to its board launcher and scoreboard.
  ctx.fillStyle = team.color;
  roundRect(ctx, lane.x + 10, lane.y + 10, 32, 32, 10);
  ctx.fill();
  ctx.fillStyle = colors.ink;
  ctx.font = '800 20px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText(String(team.id + 1), lane.x + 26, lane.y + 27);
  ctx.textAlign = "right";
  ctx.fillText(team.active ? String(team.reserve) : "Out", lane.x + lane.w - 12, lane.y + 27);
  ctx.textAlign = "center";
  ctx.font = '700 16px "Avenir Next", "Trebuchet MS", sans-serif';

}


function drawEliminatedLane(ctx, lane) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  roundRect(ctx, lane.x, lane.y, lane.w, lane.h, 22);
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
    ctx.globalAlpha = team.active ? 1 : 0.4;
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(team.cannon.angle);
    ctx.fillStyle = colors.ink;
    roundRect(ctx, 0, -8, 36, 16, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fillStyle = team.color;
    ctx.fill();
    ctx.strokeStyle = colors.paper;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.ink;
    ctx.fill();
    ctx.restore();
  }
}

function drawMarbles(ctx, state) {
  for (const marble of state.marbles) {
    const team = state.teams[marble.teamId];
    ctx.save();

    ctx.fillStyle = colors.ink;
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
    ctx.fillStyle = colors.ink;
    ctx.fillText(event.label, lane.x + lane.w / 2, lane.y + lane.h - 58);
  }
  ctx.restore();
}

function drawWinner(ctx, width, height, winner) {
  ctx.save();
  ctx.fillStyle = "rgba(36,53,47,0.3)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colors.paper;
  roundRect(ctx, width / 2 - 260, height / 2 - 100, 520, 200, 32);
  ctx.fill();
  ctx.fillStyle = winner.color;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - 50, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.ink;
  ctx.textAlign = "center";
  ctx.font = '800 42px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText(`${winner.name} wins!`, width / 2, height / 2 + 15);
  ctx.font = '600 20px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText("Press Restart to play again", width / 2, height / 2 + 58);
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
