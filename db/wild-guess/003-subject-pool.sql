CREATE TABLE IF NOT EXISTS wg_subjects (
  id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK(version > 0),
  slot INTEGER NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK(category IN ('count','duration','weight','frequency','length','area','volume','speed')),
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  magnitude INTEGER NOT NULL,
  low_magnitude INTEGER NOT NULL,
  high_magnitude INTEGER NOT NULL,
  scale_label TEXT,
  note TEXT NOT NULL,
  sources_json TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  PRIMARY KEY (id, version),
  CHECK(low_magnitude <= magnitude AND magnitude <= high_magnitude)
);
CREATE INDEX IF NOT EXISTS wg_subjects_pairing ON wg_subjects(active, category, low_magnitude, high_magnitude, id);

CREATE TABLE IF NOT EXISTS wg_matchup_rounds (
  session_id TEXT NOT NULL REFERENCES wg_sessions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK(position >= 0),
  left_subject_id TEXT NOT NULL,
  left_subject_version INTEGER NOT NULL,
  right_subject_id TEXT NOT NULL,
  right_subject_version INTEGER NOT NULL,
  choice INTEGER CHECK(choice IN (0,1)),
  correct INTEGER CHECK(correct IN (0,1)),
  answered_at BIGINT,
  PRIMARY KEY (session_id, position),
  FOREIGN KEY (left_subject_id, left_subject_version) REFERENCES wg_subjects(id, version),
  FOREIGN KEY (right_subject_id, right_subject_version) REFERENCES wg_subjects(id, version),
  CHECK(left_subject_id <> right_subject_id),
  CHECK ((choice IS NULL AND correct IS NULL AND answered_at IS NULL) OR (choice IS NOT NULL AND correct IS NOT NULL AND answered_at IS NOT NULL))
);
