import { NextResponse } from "next/server";
import { getReserveYieldSnapshot } from "@/lib/reserve-yield";

/**
 * `GET /api/reserve-yield` → the USDC reserve yield (AQAv2) snapshot, read
 * from HyperEVM and the info API. Two minutes of CDN cache: a payment or a
 * transfer to the fund shows up within that, and past daily readings are
 * memoized so a refresh costs a handful of RPC calls.
 */
export const runtime = "nodejs";
export const revalidate = 120;
export const maxDuration = 120;

export async function GET() {
  try {
    const data = await getReserveYieldSnapshot();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "reserve yield unavailable" },
      { status: 503 },
    );
  }
}
