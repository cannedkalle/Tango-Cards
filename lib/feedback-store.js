import { sql } from "@vercel/postgres";

export function feedbackStoreConfigured() {
  return Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING);
}

export async function ensureFeedbackTable() {
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

export async function getSeriesPopularity(days = 30) {
  await ensureFeedbackTable();
  const result = await sql`
    SELECT series_key, COUNT(*)::int AS add_count
    FROM card_feedback_events
    WHERE event_type = 'added_to_binder'
      AND created_at >= NOW() - (${days}::int * INTERVAL '1 day')
      AND series_key IS NOT NULL
    GROUP BY series_key
  `;

  return Object.fromEntries(result.rows.map((row) => [row.series_key, row.add_count]));
}
