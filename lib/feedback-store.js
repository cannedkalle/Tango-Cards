import { neon } from "@neondatabase/serverless";

let cachedSql;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
}

function getSql() {
  if (!cachedSql) {
    cachedSql = neon(getDatabaseUrl());
  }

  return cachedSql;
}

export function feedbackStoreConfigured() {
  return Boolean(getDatabaseUrl());
}

export async function ensureFeedbackTable() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS card_feedback_events (
      id BIGSERIAL PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      card_key TEXT,
      card_id TEXT,
      series_key TEXT,
      series_label TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS card_feedback_events_created_at_idx ON card_feedback_events (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS card_feedback_events_event_type_idx ON card_feedback_events (event_type)`;
  await sql`CREATE INDEX IF NOT EXISTS card_feedback_events_series_key_idx ON card_feedback_events (series_key)`;
}

export async function recordFeedbackEvent(event) {
  const sql = getSql();

  await ensureFeedbackTable();
  await sql`
    INSERT INTO card_feedback_events (
      visitor_id,
      event_type,
      card_key,
      card_id,
      series_key,
      series_label
    ) VALUES (
      ${event.visitorId},
      ${event.eventType},
      ${event.cardKey || null},
      ${event.cardId || null},
      ${event.seriesKey || null},
      ${event.seriesLabel || null}
    )
  `;
}

export async function getSeriesEventCounts(eventType, days = 30) {
  const sql = getSql();

  await ensureFeedbackTable();
  const rows = await sql`
    SELECT series_key, COUNT(*)::int AS event_count
    FROM card_feedback_events
    WHERE event_type = ${eventType}
      AND created_at >= NOW() - (${days}::int * INTERVAL '1 day')
      AND series_key IS NOT NULL
    GROUP BY series_key
  `;

  return Object.fromEntries(rows.map((row) => [row.series_key, row.event_count]));
}

export async function getSeriesPopularity(days = 30) {
  return getSeriesEventCounts("added_to_binder", days);
}

export async function getSeriesPackOpens(days = 30) {
  return getSeriesEventCounts("pack_opened", days);
}
