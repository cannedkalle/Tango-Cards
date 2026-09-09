export function length(x, y) {
  return Math.hypot(x, y);
}

export function normalize(x, y) {
  const magnitude = length(x, y) || 1;
  return { x: x / magnitude, y: y / magnitude };
}

export function randomUnit() {
  const angle = Math.random() * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
