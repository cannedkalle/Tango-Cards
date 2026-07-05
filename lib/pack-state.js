export const packStorageKey = "tangoCardCollection";
export const pullIntervalMs = 12 * 60 * 60 * 1000;
export const maxPullChances = 4;
const starterPullsVersion = 1;

export function emptyPackState() {
  return {
    chances: maxPullChances,
    lastUpdatedAt: Date.now(),
    collection: {},
    recentPull: [],
    recentPullPackLabel: "",
    starterPullsVersion,
  };
}

export function reconcilePackState(state, now) {
  if (state.starterPullsVersion !== starterPullsVersion) {
    return {
      ...state,
      chances: maxPullChances,
      lastUpdatedAt: now,
      collection: state.collection || {},
      recentPull: state.recentPull || [],
      recentPullPackLabel: state.recentPullPackLabel || "",
      starterPullsVersion,
    };
  }

  const lastUpdatedAt = Number(state.lastUpdatedAt || now);
  const currentChances = Math.min(maxPullChances, Math.max(0, Number(state.chances || 0)));
  const earned = Math.floor((now - lastUpdatedAt) / pullIntervalMs);

  if (earned <= 0) {
    return {
      ...state,
      chances: currentChances,
      lastUpdatedAt,
      collection: state.collection || {},
      recentPull: state.recentPull || [],
      recentPullPackLabel: state.recentPullPackLabel || "",
    };
  }

  const chances = Math.min(maxPullChances, currentChances + earned);
  const nextLastUpdatedAt = chances === maxPullChances ? now : lastUpdatedAt + earned * pullIntervalMs;

  return {
    ...state,
    chances,
    lastUpdatedAt: nextLastUpdatedAt,
    collection: state.collection || {},
    recentPull: state.recentPull || [],
    recentPullPackLabel: state.recentPullPackLabel || "",
  };
}

export function loadPackState() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(packStorageKey) || "null");
    return stored ? reconcilePackState(stored, Date.now()) : emptyPackState();
  } catch {
    return emptyPackState();
  }
}

export function savePackState(state) {
  window.localStorage.setItem(packStorageKey, JSON.stringify(state));
}

export function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
