'use client';

import { useEffect, useRef, useState } from 'react';
import PortalNav from '../components/PortalNav';
import { STEPS, DISC_RADIUS, PIN_RADIUS, PALETTE, DEFAULT_COLOR_INDEX } from '../../lib/spin-draw/disc.mjs';

/* Spin Draw: the rotating-disc drawing toy, playable.
 * World space is disc units: the pin sits at (0,0), the rim has radius
 * 100. The paper is the background itself; draw marks live in world
 * coordinates under the disc, exactly like the physical toy.
 *
 * Modes:
 * - spin: drag to rotate the disc (with fling); releasing near a mark
 *   auto-aligns it to the top.
 * - draw: draw inside the aligned slot; marks stay on the paper.
 * - view: the disc is lifted away; the paper and its marks are shown.
 *
 * Camera: pinch / wheel to zoom, two-finger drag to pan, double-tap to
 * reset. Default zoom puts the pin at the bottom-center of the screen
 * with the disc rim barely touching the top, below the title rows.
 */

const TAU = Math.PI * 2;
const SNAP_TOL = 7; // degrees: auto-align window around a mark
const PAPER = '#fffdf6';
const INK = '#24352f';
const ACCENT = '#fa8869';

/* Tool icons as inline SVG (currentColor stroke): Unicode arrows (↩↪↻)
 * render as emoji on phones and look out of style next to the pills.
 * Undo/redo are mirrored hook arrows; restart is a full circular loop
 * so the three read as distinct at a glance. */
const svgIcon = (inner) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {inner}
  </svg>
);
const ICON_UNDO = svgIcon(<><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>);
const ICON_REDO = svgIcon(<><path d="M15 14l5-5-5-5" /><path d="M20 9h-10.5a5.5 5.5 0 0 0 0 11H13" /></>);
const ICON_RESTART = svgIcon(<><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>);

const wrapDeg = (d) => {
  d = (d + 180) % 360;
  if (d < 0) d += 360;
  return d - 180;
};
// Clockwise-positive rotation in y-down world coordinates, matching the
// disc layout: mark N sits at TOP + delta, and rotating the disc by
// R = -delta brings it back to the top.
const rotPt = (p, deg) => {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
};
function pointInPoly(pt, poly) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function Game() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [mode, setMode] = useState('draw');
  const [status, setStatus] = useState('');
  const [restartArmed, setRestartArmed] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [selIdx, setSelIdx] = useState(DEFAULT_COLOR_INDEX);
  const eng = useRef(null);

  if (!eng.current) {
    eng.current = {
      mode: 'draw',
      R: 0, // disc rotation, degrees, clockwise-positive
      cam: { s: 0, cx: 0, cy: -50 },
      camReady: false,
      W: 0,
      H: 0,
      strokes: [], // {step, color, pts:[[x,y]...]} in world coords
      pointers: new Map(),
      spin: null, // {lastAngle, vel, lastT}
      flingVel: 0,
      tween: null, // {from, to, t0, dur}
      drawing: null, // {step, color, pts}
      pinch: null, // {d0, s0, mid, cx0, cy0}
      pan: null, // single-pointer pan in view mode {x, y, cx, cy}
      aligned: 0,
      dirty: true,
      lastStatus: '',
      discCanvas: null, // offscreen layer: the disc with punched-out slots
      selIdx: DEFAULT_COLOR_INDEX, // selected palette color (mirrored from state each render)
      history: [], // undo snapshots, oldest first (bounded)
      redo: [], // redo snapshots (cleared by any new change)
    };
  }
  const E = eng.current;
  // Mirror the chosen color onto the engine so the pointer handlers
  // (registered once) always draw with the current selection.
  E.selIdx = selIdx;

  const markAngle = (delta) => wrapDeg(delta + E.R);
  const computeAligned = () => {
    let best = 0;
    let bestD = Infinity;
    for (const st of STEPS) {
      const d = Math.abs(markAngle(st.delta));
      if (d < bestD) {
        bestD = d;
        best = st.step;
      }
    }
    return bestD <= SNAP_TOL ? best : 0;
  };

  const requestRender = () => {
    E.dirty = true;
  };

  /* ---------- camera ---------- */
  const defaultCam = (W, H) => ({ s: H / DISC_RADIUS, cx: 0, cy: -DISC_RADIUS / 2 });
  const zoomLimits = (W, H) => ({
    min: Math.min(W, H) / (DISC_RADIUS * 2.3),
    max: (H / DISC_RADIUS) * 8,
  });
  const zoomAt = (px, py, factor) => {
    const { s, cx, cy } = E.cam;
    const { W, H } = E;
    const { min, max } = zoomLimits(W, H);
    const ns = clamp(s * factor, min, max);
    if (ns === s) return;
    // Keep the world point under the cursor fixed.
    const wx = cx + (px - W / 2) / s;
    const wy = cy + (py - H / 2) / s;
    E.cam = { s: ns, cx: wx - (px - W / 2) / ns, cy: wy - (py - H / 2) / ns };
    setShowHint(false);
    requestRender();
  };

  /* ---------- render ---------- */
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !E.camReady) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { W, H } = E;
    const { s, cx, cy } = E.cam;
    const X = (x) => (x - cx) * s + W / 2;
    const Y = (y) => (y - cy) * s + H / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    // Draw marks live on the paper, under the disc.
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const paintStroke = (st) => {
      if (st.pts.length < 2) return;
      // Physical mask: ink only lands on the paper through the cut-out.
      // The pen has width, so constraining the stroke's centerline to the
      // slot is not enough — clip the whole stroke to the slot polygon
      // (at its aligned rotation, when this stroke was drawn).
      const slot = STEPS[st.step - 1];
      ctx.save();
      ctx.beginPath();
      const r0 = rotPt(slot.poly[0], -slot.delta);
      ctx.moveTo(X(r0[0]), Y(r0[1]));
      for (let i = 1; i < slot.poly.length; i++) {
        const q = rotPt(slot.poly[i], -slot.delta);
        ctx.lineTo(X(q[0]), Y(q[1]));
      }
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.moveTo(X(st.pts[0][0]), Y(st.pts[0][1]));
      for (let i = 1; i < st.pts.length; i++) ctx.lineTo(X(st.pts[i][0]), Y(st.pts[i][1]));
      ctx.stroke();
      ctx.restore();
    };
    for (const st of E.strokes) paintStroke(st);
    if (E.drawing) paintStroke(E.drawing);

    // The disc lives on its own layer so the slots are true cut-outs:
    // they are punched transparent, and the paper + draw marks beneath
    // show through — including while the disc spins.
    const renderDiscLayer = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const layer = E.discCanvas;
      const dw = Math.round(W * dpr), dh = Math.round(H * dpr);
      if (layer.width !== dw || layer.height !== dh) { layer.width = dw; layer.height = dh; }
      const c = layer.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const pcx = X(0), pcy = Y(0), rPx = DISC_RADIUS * s;
      // Body.
      c.save();
      c.shadowColor = 'rgba(36,53,47,.22)'; c.shadowBlur = 22; c.shadowOffsetY = 7;
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(pcx, pcy, rPx, 0, TAU); c.fill();
      c.restore();
      c.lineWidth = Math.max(1, 0.154 * s); c.strokeStyle = '#d9ded2';
      c.beginPath(); c.arc(pcx, pcy, rPx, 0, TAU); c.stroke();
      const trace = (poly) => {
        c.beginPath();
        const p0 = rotPt(poly[0], E.R); c.moveTo(X(p0[0]), Y(p0[1]));
        for (let i = 1; i < poly.length; i++) { const q = rotPt(poly[i], E.R); c.lineTo(X(q[0]), Y(q[1])); }
        c.closePath();
      };
      // Punch the slots: real holes, not paper-colored paint.
      c.save();
      c.globalCompositeOperation = 'destination-out';
      for (const st of STEPS) { trace(st.poly); c.fill(); }
      c.restore();
      // Cut edges.
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const st of STEPS) {
        const active = st.step === E.aligned;
        trace(st.poly);
        if (active) {
          c.save(); c.shadowColor = 'rgba(250,136,105,.9)'; c.shadowBlur = 14;
          c.lineWidth = Math.max(2, 0.55 * s); c.strokeStyle = ACCENT; c.stroke(); c.restore();
        } else {
          c.lineWidth = Math.max(1, 0.32 * s); c.strokeStyle = '#3a443e'; c.stroke();
        }
      }
      // Rim ticks + numbers, glued to their tick.
      c.fillStyle = INK; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const st of STEPS) {
        const a = ((st.delta + E.R) * Math.PI) / 180;
        const dx = Math.sin(a), dy = -Math.cos(a);
        c.lineWidth = Math.max(1, 0.35 * s); c.strokeStyle = INK;
        c.beginPath();
        c.moveTo(pcx + dx * 96.5 * s, pcy + dy * 96.5 * s);
        c.lineTo(pcx + dx * 100 * s, pcy + dy * 100 * s);
        c.stroke();
        c.save();
        c.translate(pcx + dx * 91 * s, pcy + dy * 91 * s); c.rotate(a);
        c.font = `800 ${4.4 * s}px system-ui, -apple-system, sans-serif`;
        c.fillText(String(st.step), 0, 0.3 * s);
        c.restore();
      }
      // Slot number badges with short leaders.
      for (const st of STEPS) {
        const b = rotPt(st.label, E.R), bx = X(b[0]), by = Y(b[1]);
        let nx = bx, ny = by, nd = Infinity;
        for (const q of st.poly) {
          const r = rotPt(q, E.R), sx = X(r[0]), sy = Y(r[1]);
          const d = (sx - bx) * (sx - bx) + (sy - by) * (sy - by);
          if (d < nd) { nd = d; nx = sx; ny = sy; }
        }
        c.lineWidth = Math.max(1, 0.28 * s); c.strokeStyle = '#8a948c';
        c.beginPath(); c.moveTo(bx, by); c.lineTo(nx, ny); c.stroke();
        c.fillStyle = '#ffffff'; c.strokeStyle = st.color; c.lineWidth = Math.max(1, 0.32 * s);
        c.beginPath(); c.arc(bx, by, 3 * s, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = INK; c.font = `800 ${3.1 * s}px system-ui, -apple-system, sans-serif`;
        c.fillText(String(st.step), bx, by + 0.2 * s);
      }
      // Pin: a real circle, not a dot.
      c.fillStyle = INK;
      c.beginPath(); c.arc(pcx, pcy, PIN_RADIUS * s, 0, TAU); c.fill();
      c.fillStyle = PAPER;
      c.beginPath(); c.arc(pcx, pcy, 1.5 * s, 0, TAU); c.fill();
    };

    if (E.mode !== 'view') {
      renderDiscLayer();
      ctx.drawImage(E.discCanvas, 0, 0, W, H);
      // TOP marker tracks the disc's actual top on screen, so it stays
      // truthful after pinch/pan instead of sitting at a fixed point.
      const mx = clamp(X(0), 26, W - 26);
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.moveTo(mx - 9, 6); ctx.lineTo(mx + 9, 6); ctx.lineTo(mx, 18);
      ctx.closePath(); ctx.fill();
    }
  };

  /* ---------- status ---------- */
  const updateStatus = () => {
    const done = new Set(E.strokes.map((st) => st.step)).size;
    let text;
    if (E.mode === 'draw') {
      text = E.aligned
        ? 'Draw inside the highlighted shape — drag elsewhere to spin'
        : 'Drag the disc to spin a number to the top';
    } else {
      text = done === 0 ? 'Nothing drawn yet — spin and draw first' : `${done} of ${STEPS.length} shapes on the paper`;
    }
    if (text !== E.lastStatus) {
      E.lastStatus = text;
      setStatus(text);
    }
  };

  /* ---------- snap + fling ---------- */
  const snapToNearest = () => {
    let best = null;
    let bestD = Infinity;
    for (const st of STEPS) {
      const d = Math.abs(markAngle(st.delta));
      if (d < bestD) {
        bestD = d;
        best = st;
      }
    }
    if (best && bestD <= SNAP_TOL) {
      const target = E.R - wrapDeg(best.delta + E.R);
      E.tween = { from: E.R, to: target, t0: performance.now(), dur: 180 };
      requestRender();
    }
  };

  /* ---------- pointer handling ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    E.discCanvas = document.createElement('canvas');

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      E.W = Math.max(1, rect.width);
      E.H = Math.max(1, rect.height);
      canvas.width = Math.round(E.W * dpr);
      canvas.height = Math.round(E.H * dpr);
      if (!E.camReady) {
        E.cam = defaultCam(E.W, E.H);
        E.camReady = true;
      }
      requestRender();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const pos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };
    const pinScreen = () => {
      const { s, cx, cy } = E.cam;
      return [(0 - cx) * s + E.W / 2, (0 - cy) * s + E.H / 2];
    };
    const toWorld = (px, py) => {
      const { s, cx, cy } = E.cam;
      return [cx + (px - E.W / 2) / s, cy + (py - E.H / 2) / s];
    };
    const activeSlotWorld = () => {
      if (!E.aligned) return null;
      const st = STEPS[E.aligned - 1];
      return st.poly.map((p) => rotPt(p, E.R));
    };

    const onDown = (e) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      const [px, py] = pos(e);
      E.pointers.set(e.pointerId, { x: px, y: py, t: performance.now() });
      if (E.pointers.size > 2) {
        E.pointers.delete(e.pointerId); // two fingers are plenty
        return;
      }
      E.tween = null;
      E.flingVel = 0;
      if (E.pointers.size === 2) {
        // Pinch takes over: cancel any one-pointer gesture.
        E.spin = null;
        E.drawing = null;
        E.pan = null;
        const [a, b] = [...E.pointers.values()];
        E.pinch = {
          d0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          s0: E.cam.s,
          mx: (a.x + b.x) / 2,
          my: (a.y + b.y) / 2,
          cx0: E.cam.cx,
          cy0: E.cam.cy,
        };
        return;
      }
      if (E.mode === 'draw') {
        // One smart mode, no toggle: tap the aligned cut-out → color it;
        // press anywhere else (disc body, paper) → spin the disc.
        const slot = activeSlotWorld();
        const w = toWorld(px, py);
        if (slot && pointInPoly(w, slot)) {
          const st = STEPS[E.aligned - 1];
          E.drawing = { step: st.step, color: PALETTE[E.selIdx] ?? PALETTE[0], pts: [w] };
        } else {
          const [qx, qy] = pinScreen();
          E.spin = { lastAngle: (Math.atan2(py - qy, px - qx) * 180) / Math.PI, vel: 0, lastT: performance.now() };
        }
      } else {
        E.pan = { x: px, y: py, cx: E.cam.cx, cy: E.cam.cy };
      }
      requestRender();
    };

    const onMove = (e) => {
      const rec = E.pointers.get(e.pointerId);
      if (!rec) return;
      const [px, py] = pos(e);
      const now = performance.now();
      const dx = px - rec.x;
      const dy = py - rec.y;
      rec.x = px;
      rec.y = py;

      if (E.pinch && E.pointers.size >= 2) {
        const [a, b] = [...E.pointers.values()];
        const d1 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const { W, H } = E;
        const { min, max } = zoomLimits(W, H);
        const ns = clamp(E.pinch.s0 * (d1 / E.pinch.d0), min, max);
        // Keep the world point that started under the pinch midpoint
        // under the current midpoint: one step handles zoom and pan.
        const wx = E.pinch.cx0 + (E.pinch.mx - W / 2) / E.pinch.s0;
        const wy = E.pinch.cy0 + (E.pinch.my - H / 2) / E.pinch.s0;
        E.cam = { s: ns, cx: wx - (mx - W / 2) / ns, cy: wy - (my - H / 2) / ns };
        setShowHint(false);
        requestRender();
        return;
      }

      if (E.spin) {
        const [qx, qy] = pinScreen();
        const ang = (Math.atan2(py - qy, px - qx) * 180) / Math.PI;
        const dA = wrapDeg(ang - E.spin.lastAngle);
        const dt = Math.max(1, now - E.spin.lastT) / 1000;
        E.spin.vel = 0.75 * E.spin.vel + 0.25 * (dA / dt);
        E.spin.lastAngle = ang;
        E.spin.lastT = now;
        E.R = wrapDeg(E.R + dA);
        E.aligned = computeAligned();
        requestRender();
        return;
      }
      if (E.drawing) {
        const slot = activeSlotWorld();
        const w = toWorld(px, py);
        const pts = E.drawing.pts;
        const last = pts[pts.length - 1];
        if (slot && pointInPoly(w, slot) && Math.hypot(w[0] - last[0], w[1] - last[1]) > 0.25) {
          pts.push(w);
          requestRender();
        }
        return;
      }
      if (E.pan) {
        E.cam.cx = E.pan.cx - dx / E.cam.s;
        E.cam.cy = E.pan.cy - dy / E.cam.s;
        E.pan.cx = E.cam.cx;
        E.pan.cy = E.cam.cy;
        E.pan.x = px;
        E.pan.y = py;
        setShowHint(false);
        requestRender();
      }
    };

    const onUp = (e) => {
      E.pointers.delete(e.pointerId);
      if (E.pinch) {
        if (E.pointers.size < 2) E.pinch = null;
        // The remaining pointer (if any) stays idle until it is lifted
        // and pressed again; its gesture was cancelled when pinching began.
      }
      if (E.spin && E.pointers.size <= 1) {
        const v = E.spin.vel;
        E.spin = null;
        if (Math.abs(v) > 90) {
          E.flingVel = v; // deg/s, decays in the loop
        } else {
          snapToNearest();
        }
      }
      if (E.drawing) {
        if (E.drawing.pts.length > 1) {
          pushHistory();
          E.strokes.push(E.drawing);
        }
        E.drawing = null;
        requestRender();
      }
      E.pan = null;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const [px, py] = pos(e);
      zoomAt(px, py, Math.exp(-e.deltaY * 0.0012));
    };
    const onDbl = (e) => {
      e.preventDefault();
      E.cam = defaultCam(E.W, E.H);
      requestRender();
    };
    const onCtx = (e) => e.preventDefault();

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDbl);
    canvas.addEventListener('contextmenu', onCtx);

    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Snap tween.
      if (E.tween) {
        const t = clamp((now - E.tween.t0) / E.tween.dur, 0, 1);
        const k = 1 - Math.pow(1 - t, 3);
        E.R = E.tween.from + (E.tween.to - E.tween.from) * k;
        if (t >= 1) E.tween = null;
        E.aligned = computeAligned();
        E.dirty = true;
      }
      // Fling with friction; snap when it settles near a mark.
      if (E.flingVel) {
        E.R = wrapDeg(E.R + E.flingVel * dt);
        E.flingVel *= Math.exp(-2.6 * dt);
        if (Math.abs(E.flingVel) < 45) {
          E.flingVel = 0;
          snapToNearest();
        }
        E.aligned = computeAligned();
        E.dirty = true;
      }
      const a = computeAligned();
      if (a !== E.aligned) {
        E.aligned = a;
        E.dirty = true;
      }
      updateStatus();
      if (E.dirty) {
        E.dirty = false;
        render();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    updateStatus();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDbl);
      canvas.removeEventListener('contextmenu', onCtx);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (m) => {
    E.mode = m;
    E.spin = null;
    E.drawing = null;
    E.pan = null;
    E.pinch = null;
    E.flingVel = 0;
    E.pointers.clear();
    setMode(m);
    updateStatus();
    E.dirty = true;
  };

  // Restart: full fresh start — paper wiped, disc rotation and camera
  // reset, back to draw mode. Two-tap: the first tap arms it.
  const restartAll = () => {
    if (!restartArmed) {
      setRestartArmed(true);
      setTimeout(() => setRestartArmed(false), 3000);
      return;
    }
    pushHistory();
    E.strokes = [];
    E.drawing = null;
    E.spin = null;
    E.flingVel = 0;
    E.tween = null;
    E.pinch = null;
    E.pan = null;
    E.R = 0;
    E.cam = defaultCam(E.W, E.H);
    E.aligned = computeAligned();
    setRestartArmed(false);
    switchMode('draw');
  };

  // Undo/redo: a snapshot is taken before every mutation (stroke,
  // restart), so Undo reverts the last change — a bad stroke or a wiped
  // paper alike — and Redo re-applies it. Any new change clears redo.
  // Both work in every mode, including view.
  const snapState = () => ({
    strokes: E.strokes.map((s) => ({ step: s.step, color: s.color, pts: s.pts.map((p) => [p[0], p[1]]) })),
    R: E.R,
    cam: { s: E.cam.s, cx: E.cam.cx, cy: E.cam.cy },
    mode: E.mode,
  });
  const restoreState = (s) => {
    E.strokes = s.strokes;
    E.R = s.R;
    E.cam = s.cam;
    E.drawing = null;
    E.spin = null;
    E.flingVel = 0;
    E.tween = null;
    E.pinch = null;
    E.pan = null;
    E.aligned = computeAligned();
    if (s.mode !== E.mode) switchMode(s.mode);
    else {
      updateStatus();
      E.dirty = true;
    }
  };
  const pushHistory = () => {
    E.history.push(snapState());
    if (E.history.length > 50) E.history.shift();
    E.redo.length = 0;
    setCanUndo(true);
    setCanRedo(false);
  };
  const undo = () => {
    const prev = E.history.pop();
    if (!prev) return;
    E.redo.push(snapState());
    restoreState(prev);
    setCanUndo(E.history.length > 0);
    setCanRedo(true);
  };
  const redo = () => {
    const next = E.redo.pop();
    if (!next) return;
    E.history.push(snapState());
    if (E.history.length > 50) E.history.shift();
    restoreState(next);
    setCanUndo(true);
    setCanRedo(E.redo.length > 0);
  };

  const zoomStep = (f) => zoomAt(E.W / 2, E.H / 2, f);

  return (
    <div className="spin-draw-page">
      <PortalNav />
      <main className="spin-draw">
        <header className="qs-bar">
          <h1 className="qs-bar-title">Spin Draw</h1>
          <div className="qs-bar-actions">
            <div className="sd-pills sd-modes" role="group" aria-label="Mode">
              {[
                ['draw', 'Draw'],
                ['view', 'View'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={mode === key ? 'is-on' : ''}
                  aria-pressed={mode === key}
                  onClick={() => switchMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="sd-pills sd-tools" role="group" aria-label="Tools">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo last change"
                title="Undo last change"
              >
                {ICON_UNDO}
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo last undone change"
                title="Redo last undone change"
              >
                {ICON_REDO}
              </button>
              <button
                type="button"
                className={restartArmed ? 'is-armed' : ''}
                onClick={restartAll}
                aria-label={restartArmed ? 'Tap again to restart' : 'Restart: start over with a fresh paper and disc'}
                title={restartArmed ? 'Tap again to restart' : 'Restart: start over with a fresh paper and disc'}
              >
                {restartArmed ? 'Sure?' : ICON_RESTART}
              </button>
            </div>
          </div>
        </header>
        <p className="qs-status">{status}</p>
        <div className="sd-palette" role="group" aria-label="Drawing colors">
            {PALETTE.map((c, i) => (
              <button
                key={c}
                type="button"
                className={`sd-swatch${i === selIdx ? ' is-on' : ''}`}
                style={{ background: c }}
                aria-label={`Color ${i + 1}`}
                aria-pressed={i === selIdx}
                onClick={() => setSelIdx(i)}
              />
            ))}
          </div>
        <div className="spin-draw-stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          aria-label="Spinning drawing disc on paper. Spin a number to the top, draw inside its shape, then view your picture."
        />
        {showHint && (
          <div className="sd-hint" aria-hidden="true">
            Pinch or scroll to zoom · double-tap to reset
          </div>
        )}
        <div className="sd-zoom" aria-label="Zoom controls">
          <button type="button" onClick={() => zoomStep(1.3)} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => zoomStep(1 / 1.3)} aria-label="Zoom out">
            −
          </button>
        </div>
      </div>
      </main>
    </div>
  );
}
