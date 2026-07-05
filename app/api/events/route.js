import { feedbackStoreConfigured, recordFeedbackEvent } from "../../../lib/feedback-store";

const allowedEvents = new Set(["added_to_binder", "removed_from_binder", "card_previewed", "prompt_shared"]);

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body || !allowedEvents.has(body.eventType) || !body.visitorId) {
    return Response.json({ ok: false, error: "Invalid event" }, { status: 400 });
  }

  if (!feedbackStoreConfigured()) {
    return Response.json({ ok: true, recorded: false, reason: "Feedback store is not configured" }, { status: 202 });
  }

  try {
    await recordFeedbackEvent(body);
    return Response.json({ ok: true, recorded: true });
  } catch (error) {
    console.error("Failed to record feedback event", error);
    return Response.json({ ok: false, error: "Failed to record event" }, { status: 500 });
  }
}
