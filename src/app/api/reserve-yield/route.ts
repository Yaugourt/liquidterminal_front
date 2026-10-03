import { NextResponse } from "next/server";
import { getReserveYieldSnapshot } from "@/lib/reserve-yield";

/**
 * `GET /api/reserve-yield` → the USDC reserve yield (AQAv2) snapshot, read
 * from HyperEVM and the info API. Balances move once a day and payments once
 * a month, so ten minutes of CDN cache costs nothing in freshness.
 */
export const runtime = "nodejs";
export const revalidate = 600;
export const maxDuration = 120;

export async function GET() {
  try {
    const data = await getReserveYieldSnapshot();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "reserve yield unavailable" },
      { status: 503 },
    );
  }
}
