import { NextRequest, NextResponse } from "next/server";
import { getUnderlyingRef } from "@/lib/hip3/underlying";

/**
 * Real-world price of the instrument a HIP-3 synthetic tracks.
 *
 * This runs on the server so `FMP_API_KEY` never reaches the browser. It must
 * NOT be renamed to `NEXT_PUBLIC_*`: that prefix inlines the value into the
 * client bundle, where anyone can read it out of the JavaScript.
 *
 * Cached hard on purpose. The free FMP plan allows 250 calls a day and serves
 * end-of-day data, so a price is only worth re-fetching a few times a day —
 * and only for markets somebody actually opens. Six hours keeps a full day of
 * browsing well inside the quota even if every mapped market gets viewed.
 */
export const revalidate = 21600;

interface FmpQuote {
  symbol?: string;
  price?: number;
  previousClose?: number;
  changePercentage?: number;
  timestamp?: number;
  exchange?: string;
}

export async function GET(request: NextRequest) {
  const coin = request.nextUrl.searchParams.get("coin");
  if (!coin) {
    return NextResponse.json({ error: "coin is required" }, { status: 400 });
  }

  const ref = getUnderlyingRef(coin);
  // Not every HIP-3 market has a listed counterpart — private companies,
  // pre-IPO names and house baskets have none. That is a normal answer.
  if (!ref) {
    return NextResponse.json({ available: false, reason: "unmapped" as const });
  }

  const key = process.env.FMP_API_KEY;
  if (!key) {
    return NextResponse.json({ available: false, reason: "unconfigured" as const });
  }

  const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(
    ref.symbol
  )}&apikey=${key}`;

  try {
    const response = await fetch(url, { next: { revalidate } });

    // 402 means the symbol sits outside the current plan — most of the
    // long tail and every non-US listing on the free tier. Reported as a
    // plan limit rather than an error, so the UI can stay silent about it.
    if (response.status === 402 || response.status === 403) {
      return NextResponse.json({ available: false, reason: "plan" as const });
    }
    if (!response.ok) {
      return NextResponse.json({ available: false, reason: "upstream" as const });
    }

    const body = (await response.json()) as FmpQuote[] | FmpQuote;
    const quote = Array.isArray(body) ? body[0] : body;
    if (!quote || typeof quote.price !== "number") {
      return NextResponse.json({ available: false, reason: "upstream" as const });
    }

    return NextResponse.json({
      available: true as const,
      symbol: ref.symbol,
      assetClass: ref.assetClass,
      market: ref.market,
      basisComparable: ref.basisComparable,
      basisNote: ref.basisNote ?? null,
      price: quote.price,
      previousClose: quote.previousClose ?? null,
      changePercent: quote.changePercentage ?? null,
      quotedAt: quote.timestamp ? quote.timestamp * 1000 : null,
    });
  } catch {
    return NextResponse.json({ available: false, reason: "upstream" as const });
  }
}
