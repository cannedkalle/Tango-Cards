import { feedbackStoreConfigured, getSeriesPopularity } from "../../../lib/feedback-store";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(Number(searchParams.get("days") || 30), 1), 365);

  if (!feedbackStoreConfigured()) {
    return Response.json({ configured: false, days, counts: {} });
  }

  try {
    const counts = await getSeriesPopularity(days);
    return Response.json({ configured: true, days, counts });
  } catch (error) {
    console.error("Failed to read series popularity", error);
    return Response.json({ configured: false, days, counts: {} }, { status: 200 });
  }
}
