import { NextRequest, NextResponse } from "next/server";
import { getUnderlyingRef, type UnderlyingClass } from "@/lib/hip3/underlying";

/**
 * Real-world price of the instrument a HIP-3 synthetic tracks.
 *
 * Runs on the server so `FMP_API_KEY` never reaches the browser. It must NOT be
 * renamed to `NEXT_PUBLIC_*`: that prefix inlines the value into the client
 * bundle, where anyone can read it out of the JavaScript.
 *
 * Sourced from the end-of-day series rather than the quote endpoint. Same cost,
 * strictly more data: the head of the series is the latest close, the next row
 * is the previous one, and the tail is history a basis chart can be built on.
 * It is also fresher — during a session the quote endpoint still served the
 * prior close while this one already carried the day's price.
 */
export const revalidate = 21600;

/** Market hours barely move; a day of caching keeps this off the call budget. */
const HOURS_REVALIDATE = 86400;

/** Which FMP exchange calendar governs each market label in the mapping. */
const EXCHANGE_BY_MARKET: Record<string, string> = {
  NASDAQ: "NASDAQ",
  NYSE: "NYSE",
  "NYSE Arca": "AMEX",
};

interface EodRow {
  symbol?: string;
  date?: string;
  price?: number;
  volume?: number;
}

async function fetchMarketOpen(market: string, key: string): Promise<boolean | null> {
  const exchange = EXCHANGE_BY_MARKET[market];
  // Commodities, FX and index calendars are not the cash-equity session; rather
  // than claim a state we cannot verify, report none.
  if (!exchange) return null;
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/stable/exchange-market-hours?exchange=${exchange}&apikey=${key}`,
      { next: { revalidate: HOURS_REVALIDATE } }
    );
    if (!response.ok) return null;
    const body = await response.json();
    const row = Array.isArray(body) ? body[0] : body;
    return typeof row?.isMarketOpen === "boolean" ? row.isMarketOpen : null;
  } catch {
    return null;
  }
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

  const url =
    `https://financialmodelingprep.com/stable/historical-price-eod/light` +
    `?symbol=${encodeURIComponent(ref.symbol)}&apikey=${key}`;

  try {
    const response = await fetch(url, { next: { revalidate } });

    // 402 means the symbol sits outside the current plan — most of the long
    // tail and every non-US listing on the free tier. Reported as a plan limit
    // rather than an error, so the UI can stay silent about it.
    if (response.status === 402 || response.status === 403) {
      return NextResponse.json({ available: false, reason: "plan" as const });
    }
    if (!response.ok) {
      return NextResponse.json({ available: false, reason: "upstream" as const });
    }

    const rows = (await response.json()) as EodRow[];
    // Newest first.
    const latest = Array.isArray(rows) ? rows[0] : undefined;
    const previous = Array.isArray(rows) ? rows[1] : undefined;
    if (!latest || typeof latest.price !== "number") {
      return NextResponse.json({ available: false, reason: "upstream" as const });
    }

    const previousClose = typeof previous?.price === "number" ? previous.price : null;
    const changePercent =
      previousClose && previousClose > 0
        ? ((latest.price - previousClose) / previousClose) * 100
        : null;

    const marketOpen = await fetchMarketOpen(ref.market, key);

    return NextResponse.json({
      available: true as const,
      symbol: ref.symbol,
      assetClass: ref.assetClass satisfies UnderlyingClass,
      market: ref.market,
      basisComparable: ref.basisComparable,
      basisNote: ref.basisNote ?? null,
      price: latest.price,
      previousClose,
      changePercent,
      /** Trading date of `price`, not a wall-clock timestamp. */
      quotedOn: latest.date ?? null,
      /** Null when the instrument has no cash-equity session to check. */
      marketOpen,
    });
  } catch {
    return NextResponse.json({ available: false, reason: "upstream" as const });
  }
}
