'use client';

import { useEffect, useRef, useState } from 'react';
import PortalNav from '../components/PortalNav';
import { RestartIcon } from '../components/Icons';
import { defaultPresetKey, palette, presets } from '../../lib/marble-battles/config.mjs';
import { CanvasRenderer } from '../../lib/marble-battles/renderer.mjs';
import { Simulation } from '../../lib/marble-battles/simulation.mjs';

/* Marble Battles, portal-native: the same canvas territory simulation as the
 * standalone game. The simulation runs on requestAnimationFrame through
 * refs; React state only carries control values and a throttled status
 * snapshot, so the board itself never re-renders through React. */

const STRUCTURAL_KEYS = [
  'teams',
  'startingReserve',
  'gridSize',
  'marblePower',
  'pinballRadius',
  'concurrentPinballs',
  'cannonBaseHp',
  'levelUpEvery',
  'gateDeck',
];

function formatGateToken(gate) {
  return gate.weight === 1 ? gate.label : `${gate.label}:${gate.weight}`;
}

function formatSlotSummary(source) {
  const totalWeight = source.gateDeck.reduce((sum, gate) => sum + gate.weight, 0);
  return source.gateDeck
    .map((gate) => `${gate.label} ${((gate.weight / totalWeight) * 100).toFixed(1)}% wide`)
    .join(' · ');
}

function formatOutput(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/* Everything the scoreboard and status strip render, snapshotted from one
 * simulation state so the panel stays consistent within a frame. */
function snapshot(state) {
  const movingByTeam = new Map();
  for (const marble of state.marbles) {
    movingByTeam.set(marble.teamId, (movingByTeam.get(marble.teamId) ?? 0) + 1);
  }
  return {
    elapsed: state.elapsed,
    marblesMoving: state.marbles.length,
    marblesWaiting: state.teams.reduce((sum, team) => sum + team.reserve, 0),
    launchersAwake: state.teams.filter((team) => team.active).length,
    winner: state.winner,
    config: state.config,
    neutralShare: state.territory.neutralShare,
    teams: state.teams.map((team) => {
      const territory = state.territory.find((item) => item.id === team.id);
      const remaining = Math.max(0, team.nextLevelAt - team.captures);
      const upgrades = [];
      if (team.upgrades.concurrentPinballs) upgrades.push(`+${team.upgrades.concurrentPinballs} marbles at once`);
      if (team.upgrades.startingReserve) upgrades.push(`+${team.upgrades.startingReserve} starting marbles`);
      if (team.upgrades.marblePower) upgrades.push(`+${team.upgrades.marblePower} power`);
      if (team.upgrades.slots.length) upgrades.push(`${team.upgrades.slots.length} slot upgrades`);
      return {
        id: team.id,
        name: team.name,
        color: team.color,
        active: team.active,
        level: team.level,
        baseHp: team.baseHp,
        maxBaseHp: team.maxBaseHp,
        captures: team.captures,
        reserve: team.reserve,
        moving: movingByTeam.get(team.id) ?? 0,
        concurrent: team.settings.concurrentPinballs,
        concurrentBonus: team.upgrades.concurrentPinballs,
        starting: team.settings.startingReserve,
        startingBonus: team.upgrades.startingReserve,
        power: team.settings.marblePower,
        powerBonus: team.upgrades.marblePower,
        share: territory?.share ?? 0,
        remaining,
        upgrades: upgrades.join(' · ') || 'No upgrades yet',
        latest: team.lastUpgrade?.label ?? 'Capture tiles to earn upgrades',
        slots: formatSlotSummary(team.settings),
      };
    }),
  };
}

export default function Game() {
  const canvasRef = useRef(null);
  const gateInputRef = useRef(null);
  const simRef = useRef(null);
  const colorsRef = useRef(undefined);
  const pausedRef = useRef(false);
  const [config, setConfig] = useState(null);
  const [presetKey, setPresetKey] = useState(defaultPresetKey);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState(null);

  // Control values before the simulation exists (first paint only).
  const cfg = config ?? presets[defaultPresetKey];

  const syncGateInput = () => {
    const sim = simRef.current;
    const input = gateInputRef.current;
    if (sim && input) input.value = sim.config.gateDeck.map(formatGateToken).join(', ');
  };

  const handleControl = (action) => {
    const sim = simRef.current;
    if (!sim) return;
    if (action.type === 'preset') {
      setPresetKey(action.presetKey);
      sim.reset(presets[action.presetKey], colorsRef.current);
    }
    if (action.type === 'config') {
      const needsReset = Object.keys(action.patch).some((key) => STRUCTURAL_KEYS.includes(key));
      sim.updateConfig(action.patch);
      if (needsReset) sim.reset(sim.config, colorsRef.current);
    }
    if (action.type === 'restart') sim.reset(sim.config, colorsRef.current);
    if (action.type === 'pause') {
      pausedRef.current = !pausedRef.current;
      setPaused(pausedRef.current);
    }
    if (action.type === 'colors') {
      colorsRef.current = action.colors;
      sim.reset(sim.config, colorsRef.current);
    }
    // Mirror the standalone panel sync: controls show the normalized config.
    setConfig(sim.config);
    setStatus(snapshot(sim.state()));
    syncGateInput();
  };

  const shuffleColors = () => {
    handleControl({ type: 'colors', colors: shuffle([...(colorsRef.current ?? palette)]) });
  };

  const commitGateSlots = () => {
    const input = gateInputRef.current;
    if (input) handleControl({ type: 'config', patch: { gateDeck: input.value } });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const renderer = new CanvasRenderer(canvas);
    const sim = new Simulation(presets[defaultPresetKey], canvas);
    simRef.current = sim;
    setConfig(sim.config);
    setPresetKey(defaultPresetKey);
    setStatus(snapshot(sim.state()));
    syncGateInput();
    let lastTime = performance.now();
    let lastStatus = 0;
    let raf = 0;
    const loop = (now) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;
      if (!pausedRef.current) sim.step(dt);
      const state = sim.state();
      renderer.render(state);
      if (now - lastStatus >= 100) {
        lastStatus = now;
        setStatus(snapshot(state));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConfig = (key) => (event) => {
    handleControl({ type: 'config', patch: { [key]: Number(event.target.value) } });
  };

  return (
    <main className="marble-battles">
      <div className="app-shell">
        <section className="stage-band" aria-label="Marble Battles arena">
          <PortalNav />
          <canvas
            ref={canvasRef}
            id="arena"
            width={1280}
            height={720}
            aria-label="Live marble arena. Numbered lanes match the teams on the board and scoreboard."
          />
          <div className="scoreboard">
            {status?.teams.map((team) => (
              <details
                className={team.active ? 'team-summary' : 'team-summary is-eliminated'}
                data-team={team.id}
                key={team.id}
              >
                <summary>
                  <span className="team-summary-title">
                    <span className="swatch" style={{ backgroundColor: team.color }}></span>
                    <strong>{team.id + 1} · {team.name}</strong>
                    <span className="team-level">Level {team.level}</span>
                  </span>
                  <span className="team-scoreline">
                    {(team.share * 100).toFixed(1)}% territory · HP {team.baseHp}/{team.maxBaseHp}
                    {team.active ? '' : ' · Out'}
                  </span>
                  <span className="team-disclosure" aria-hidden="true">⌄</span>
                </summary>
                <div className="team-details">
                  <p className="team-progress-label">
                    {team.active ? `${team.remaining} tiles to the next capture upgrade` : 'Team eliminated'}
                  </p>
                  <progress
                    aria-label="Progress to next capture upgrade"
                    max={status.config.levelUpEvery}
                    value={Math.max(0, status.config.levelUpEvery - team.remaining)}
                  ></progress>
                  <dl className="team-metrics">
                    <div><dt>Marbles waiting</dt><dd>{team.reserve}</dd></div>
                    <div><dt>Marbles moving</dt><dd>{team.moving}</dd></div>
                    <div><dt>Marbles at once</dt><dd>{team.concurrent} (+{team.concurrentBonus})</dd></div>
                    <div><dt>Starting number</dt><dd>{team.starting} (+{team.startingBonus})</dd></div>
                    <div><dt>Marble power</dt><dd>{team.power} (+{team.powerBonus})</dd></div>
                    <div><dt>Tiles captured</dt><dd>{team.captures}</dd></div>
                  </dl>
                  <h3>Upgrades earned</h3><p>{team.upgrades}</p>
                  <h3>Latest upgrade</h3><p>{team.latest}</p>
                  <h3>Slot widths · left to right</h3><p className="team-slot-list">{team.slots}</p>
                  <p className="team-slot-key">S = shoot waiting marbles · R = reset to starting number</p>
                  <p className="team-slot-key">Widths are not landing odds. Peg bounces and the drop position affect where marbles land.</p>
                </div>
              </details>
            ))}
            <p className="neutral-summary">
              {status ? `Unclaimed territory: ${(status.neutralShare * 100).toFixed(1)}%` : ''}
            </p>
          </div>
          <p className="arena-note">Follow the marbles. Watch the territory change.</p>
        </section>

        <aside className="control-panel" aria-label="Game controls">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Marble Battles</p>
              <h1>Multiply / Release</h1>
            </div>
            <button
              className="pf-btn"
              type="button"
              title="Pause or resume"
              onClick={() => handleControl({ type: 'pause' })}
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
          </div>

          <label>
            Preset
            <select value={presetKey} onChange={(event) => handleControl({ type: 'preset', presetKey: event.target.value })}>
              {Object.entries(presets).map(([key, preset]) => (
                <option key={key} value={key}>{preset.name}</option>
              ))}
            </select>
          </label>

          <div className="button-row">
            <button className="pf-btn" type="button" onClick={() => handleControl({ type: 'restart' })}><RestartIcon />Restart</button>
            <button className="pf-btn" type="button" onClick={shuffleColors}>Mix Colors</button>
          </div>

          <section className="control-section">
            <h2>Board</h2>
            <div className="control-grid">
              <label>
                Teams
                <select value={cfg.teams} onChange={onConfig('teams')}>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                </select>
              </label>
              <label>
                <span className="control-label">Grid Size <output>{formatOutput(cfg.gridSize)}</output></span>
                <input type="range" min="24" max="72" step="6" value={cfg.gridSize} onChange={onConfig('gridSize')} />
              </label>
              <label>
                <span className="control-label">Tiles per level <output>{formatOutput(cfg.levelUpEvery)}</output></span>
                <input type="range" min="25" max="250" step="5" value={cfg.levelUpEvery} onChange={onConfig('levelUpEvery')} />
              </label>
            </div>
          </section>

          <section className="control-section">
            <h2>Look</h2>
            <div className="control-grid">
              <label>
                <span className="control-label">Marble Size <output>{formatOutput(cfg.radius)}</output></span>
                <input type="range" min="3" max="14" step="1" value={cfg.radius} onChange={onConfig('radius')} />
              </label>
              <label>
                <span className="control-label">Pinball Size <output>{formatOutput(cfg.pinballRadius)}</output></span>
                <input type="range" min="3" max="6" step="1" value={cfg.pinballRadius} onChange={onConfig('pinballRadius')} />
              </label>
            </div>
          </section>

          <section className="control-section">
            <h2>Pins and marbles</h2>
            <div className="control-grid">
              <label>
                Starting Number
                <input type="number" min="1" max="200" step="1" value={cfg.startingReserve} onChange={onConfig('startingReserve')} />
              </label>
              <label>
                <span className="control-label">Marbles at once <output>{formatOutput(cfg.concurrentPinballs)}</output></span>
                <input type="range" min="1" max="6" step="1" value={cfg.concurrentPinballs} onChange={onConfig('concurrentPinballs')} />
              </label>
              <label>
                <span className="control-label">Gate Rate <output>{formatOutput(cfg.gateRate)}</output></span>
                <input type="range" min="0.4" max="3" step="0.05" value={cfg.gateRate} onChange={onConfig('gateRate')} />
              </label>
              <label>
                Slots and Widths
                <input
                  ref={gateInputRef}
                  type="text"
                  spellCheck={false}
                  placeholder="S,S,R,S,S"
                  onBlur={commitGateSlots}
                  onKeyDown={(event) => { if (event.key === 'Enter') commitGateSlots(); }}
                />
              </label>
            </div>
          </section>

          <section className="control-section">
            <h2>Launchers</h2>
            <div className="control-grid">
              <label>
                <span className="control-label">Marble Power <output>{formatOutput(cfg.marblePower)}</output></span>
                <input type="range" min="1" max="5" step="1" value={cfg.marblePower} onChange={onConfig('marblePower')} />
              </label>
              <label>
                <span className="control-label">Base HP <output>{formatOutput(cfg.cannonBaseHp)}</output></span>
                <input type="range" min="1" max="30" step="1" value={cfg.cannonBaseHp} onChange={onConfig('cannonBaseHp')} />
              </label>
              <label>
                <span className="control-label">Speed <output>{formatOutput(cfg.speed)}</output></span>
                <input type="range" min="30" max="260" step="5" value={cfg.speed} onChange={onConfig('speed')} />
              </label>
              <label>
                <span className="control-label">Cannon Turn <output>{formatOutput(cfg.cannonTurnSpeed)}</output></span>
                <input type="range" min="0" max="3" step="0.05" value={cfg.cannonTurnSpeed} onChange={onConfig('cannonTurnSpeed')} />
              </label>
              <label>
                <span className="control-label">Marble limit <output>{formatOutput(cfg.maxActiveMarbles)}</output></span>
                <input type="range" min="100" max="700" step="20" value={cfg.maxActiveMarbles} onChange={onConfig('maxActiveMarbles')} />
              </label>
            </div>
          </section>

          <section className="status-strip">
            {status && [
              ['Elapsed', `${status.elapsed.toFixed(1)}s`],
              ['Marbles moving', status.marblesMoving],
              ['Marbles waiting', status.marblesWaiting],
              ['Launchers awake', status.launchersAwake],
              ['Starting slot widths', formatSlotSummary(status.config)],
              ['Upgrade cards', status.config.upgradeDeck.map((upgrade) => upgrade.label).join(' ')],
              ['Winner', status.winner ? status.winner.name : 'Pending'],
            ].map(([label, value]) => (
              <div className="status-line" key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </section>
        </aside>
      </div>
    </main>
  );
}
