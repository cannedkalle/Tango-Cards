CREATE TABLE IF NOT EXISTS wg_questions (
  id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK(version > 0),
  slot INTEGER NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  content TEXT NOT NULL,
  PRIMARY KEY (id, version)
);
CREATE INDEX IF NOT EXISTS wg_questions_active_slot ON wg_questions(active, slot);
CREATE TABLE IF NOT EXISTS wg_sessions (
  id TEXT PRIMARY KEY,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS wg_sessions_expiry ON wg_sessions(expires_at);
CREATE TABLE IF NOT EXISTS wg_rounds (
  session_id TEXT NOT NULL REFERENCES wg_sessions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK(position >= 0),
  question_id TEXT NOT NULL,
  question_version INTEGER NOT NULL,
  magnitude INTEGER CHECK(magnitude BETWEEN 0 AND 9),
  score INTEGER CHECK(score BETWEEN 0 AND 100),
  answered_at BIGINT,
  PRIMARY KEY (session_id, position),
  FOREIGN KEY (question_id, question_version) REFERENCES wg_questions(id, version),
  CHECK ((magnitude IS NULL AND score IS NULL AND answered_at IS NULL) OR (magnitude IS NOT NULL AND score IS NOT NULL AND answered_at IS NOT NULL))
);
