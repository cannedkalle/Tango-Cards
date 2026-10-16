CREATE TABLE IF NOT EXISTS wg_comparisons (
  id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK(version > 0),
  slot INTEGER NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK(category IN ('count','duration','weight','frequency')),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  content TEXT NOT NULL,
  PRIMARY KEY (id, version)
);
CREATE INDEX IF NOT EXISTS wg_comparisons_active_category_slot ON wg_comparisons(active, category, slot);

CREATE TABLE IF NOT EXISTS wg_comparison_rounds (
  session_id TEXT NOT NULL REFERENCES wg_sessions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK(position >= 0),
  comparison_id TEXT NOT NULL,
  comparison_version INTEGER NOT NULL,
  flipped INTEGER NOT NULL CHECK(flipped IN (0,1)),
  choice INTEGER CHECK(choice IN (0,1)),
  correct INTEGER CHECK(correct IN (0,1)),
  answered_at BIGINT,
  PRIMARY KEY (session_id, position),
  FOREIGN KEY (comparison_id, comparison_version) REFERENCES wg_comparisons(id, version),
  CHECK ((choice IS NULL AND correct IS NULL AND answered_at IS NULL) OR (choice IS NOT NULL AND correct IS NOT NULL AND answered_at IS NOT NULL))
);
