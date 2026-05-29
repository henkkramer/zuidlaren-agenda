import { NextResponse, after } from "next/server";
import { recordAnalyticsMetric } from "@/lib/analytics";

type WebVitalsPayload = {
  name?: unknown;
  value?: unknown;
  rating?: unknown;
  path?: unknown;
};

const allowedVitals = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);

function valueBucket(value: number) {
  if (value < 100) return "lt_100";
  if (value < 300) return "lt_300";
  if (value < 1000) return "lt_1000";
  if (value < 2500) return "lt_2500";
  return "gte_2500";
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as WebVitalsPayload | null;
  const name = typeof payload?.name === "string" ? payload.name.toUpperCase() : "";
  const value = typeof payload?.value === "number" && Number.isFinite(payload.value) ? payload.value : undefined;
  const rating = typeof payload?.rating === "string" ? payload.rating.slice(0, 24) : undefined;
  const path = typeof payload?.path === "string" ? payload.path.slice(0, 120) : undefined;

  if (!allowedVitals.has(name) || value === undefined) {
    return NextResponse.json({ error: "Ongeldige web vital" }, { status: 400 });
  }

  after(() =>
    recordAnalyticsMetric({
      metric: "web_vital",
      dimensions: {
        name,
        rating,
        path,
        valueBucket: valueBucket(value),
      },
    }),
  );

  return NextResponse.json({ ok: true });
}
