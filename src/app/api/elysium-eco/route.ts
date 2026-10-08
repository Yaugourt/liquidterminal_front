import { NextResponse } from "next/server";
import { getEcoSnapshot } from "@/lib/elysium-eco";

/**
 * `GET /api/elysium-eco` → the Elysium project directory and launchpad token
 * market from elysiumeco.xyz. Their figures refresh every 5 minutes, so the
 * CDN keeps ours for the same span.
 */
export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const data = await getEcoSnapshot();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ecosystem data unavailable" },
      { status: 503 },
    );
  }
}
