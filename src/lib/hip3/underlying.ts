/**
 * HIP-3 synthetic market → real-world underlying, as addressed by Financial
 * Modeling Prep.
 *
 * A HIP-3 market like `xyz:NVDA` is a synthetic perp whose oracle is run by the
 * venue operator. Pairing it with the real instrument gives the one thing no
 * on-chain source can: an independent check on that oracle, from a party with
 * no stake in the venue.
 *
 * Nothing is guessed here. A ticker with no certain counterpart is simply
 * absent from the table, and the UI then shows no underlying at all — roughly a
 * fifth of the xyz universe is private, pre-IPO or a house basket (SpaceX,
 * Zhipu, MiniMax, CXMT, the XYZ100 index) and has no listed equivalent.
 */

export type UnderlyingClass = "equity" | "etf" | "commodity" | "forex" | "index";

export interface UnderlyingRef {
  /** Symbol as FMP addresses it. */
  symbol: string;
  assetClass: UnderlyingClass;
  /** Human label for the venue/exchange, shown next to the price. */
  market: string;
  /**
   * False when the synthetic is known NOT to track the instrument this symbol
   * resolves to — a different futures expiry, or spot versus front-month. The
   * price still renders; the basis figure is suppressed, because publishing a
   * 255 bps "mispricing" that is really a contract mismatch would be a lie.
   */
  basisComparable: boolean;
  /** Why the basis is suppressed. Surfaced in the UI. */
  basisNote?: string;
}

const EQUITY = (symbol: string, market = "NASDAQ"): UnderlyingRef => ({
  symbol,
  assetClass: "equity",
  market,
  basisComparable: true,
});

export const HIP3_UNDERLYING: Record<string, UnderlyingRef> = {
  // ── US equities & US-listed ADRs ──────────────────────────────────
  "xyz:AAPL": EQUITY("AAPL"),
  "xyz:AMAT": EQUITY("AMAT"),
  "xyz:AMD": {
    ...EQUITY("AMD"),
    basisComparable: false,
    basisNote: "Measured gap exceeds weekend drift — mapping not yet confirmed",
  },
  "xyz:AMZN": EQUITY("AMZN"),
  "xyz:AVGO": EQUITY("AVGO"),
  "xyz:BX": EQUITY("BX", "NYSE"),
  "xyz:COIN": EQUITY("COIN"),
  "xyz:COST": EQUITY("COST"),
  "xyz:CRCL": EQUITY("CRCL", "NYSE"),
  "xyz:CRWV": EQUITY("CRWV"),
  "xyz:DELL": EQUITY("DELL", "NYSE"),
  "xyz:DKNG": EQUITY("DKNG"),
  "xyz:EBAY": EQUITY("EBAY"),
  "xyz:GME": EQUITY("GME", "NYSE"),
  "xyz:GOOGL": EQUITY("GOOGL"),
  "xyz:HIMS": EQUITY("HIMS", "NYSE"),
  "xyz:HOOD": EQUITY("HOOD"),
  "xyz:IBM": EQUITY("IBM", "NYSE"),
  "xyz:INTC": {
    ...EQUITY("INTC"),
    basisComparable: false,
    basisNote: "Measured gap exceeds weekend drift — mapping not yet confirmed",
  },
  "xyz:LLY": EQUITY("LLY", "NYSE"),
  "xyz:META": EQUITY("META"),
  "xyz:MRVL": EQUITY("MRVL"),
  "xyz:MSFT": EQUITY("MSFT"),
  "xyz:MSTR": EQUITY("MSTR"),
  "xyz:MU": EQUITY("MU"),
  "xyz:NBIS": EQUITY("NBIS"),
  "xyz:NFLX": EQUITY("NFLX"),
  "xyz:NOK": EQUITY("NOK", "NYSE"),
  "xyz:NOW": EQUITY("NOW", "NYSE"),
  "xyz:NVDA": EQUITY("NVDA"),
  "xyz:ORCL": EQUITY("ORCL", "NYSE"),
  "xyz:PLTR": EQUITY("PLTR"),
  "xyz:QCOM": EQUITY("QCOM"),
  "xyz:RIVN": EQUITY("RIVN"),
  "xyz:RKLB": EQUITY("RKLB"),
  "xyz:SNDK": EQUITY("SNDK"),
  "xyz:STRC": EQUITY("STRC"),
  "xyz:TSLA": EQUITY("TSLA"),
  "xyz:WDC": EQUITY("WDC", "NYSE"),
  "xyz:ZM": EQUITY("ZM"),
  "xyz:BE": EQUITY("BE", "NYSE"),
  "xyz:BB": EQUITY("BB", "NYSE"),
  "xyz:LITE": EQUITY("LITE"),
  "xyz:USAR": EQUITY("USAR"),
  "xyz:BABA": {
    ...EQUITY("BABA", "NYSE"),
    basisComparable: false,
    basisNote: "ADR versus Hong Kong listing — ratio not yet confirmed",
  },
  "xyz:TSM": EQUITY("TSM", "NYSE"),
  "xyz:ASML": EQUITY("ASML"),
  "xyz:ARM": EQUITY("ARM"),

  // ── US-listed ETFs ────────────────────────────────────────────────
  "xyz:SMH": { symbol: "SMH", assetClass: "etf", market: "NASDAQ", basisComparable: true },
  "xyz:XLE": { symbol: "XLE", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "xyz:EWJ": { symbol: "EWJ", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "xyz:EWT": { symbol: "EWT", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "xyz:EWY": { symbol: "EWY", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "xyz:EWZ": { symbol: "EWZ", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "xyz:URNM": { symbol: "URNM", assetClass: "etf", market: "NYSE Arca", basisComparable: true },

  // ── Non-US listings (paid tiers only, kept so an upgrade just works) ──
  "xyz:SOFTBANK": EQUITY("9984.T", "Tokyo"),
  "xyz:IBIDEN": EQUITY("4062.T", "Tokyo"),
  "xyz:KIOXIA": EQUITY("285A.T", "Tokyo"),
  "xyz:HYUNDAI": EQUITY("005380.KS", "Seoul"),
  "xyz:SKHX": EQUITY("000660.KS", "Seoul"),
  "xyz:SMSN": EQUITY("005930.KS", "Seoul"),

  // ── Commodities ───────────────────────────────────────────────────
  "xyz:GOLD": { symbol: "GCUSD", assetClass: "commodity", market: "COMEX", basisComparable: true },
  "xyz:SILVER": { symbol: "SIUSD", assetClass: "commodity", market: "COMEX", basisComparable: true },
  "xyz:BRENTOIL": { symbol: "BZUSD", assetClass: "commodity", market: "ICE", basisComparable: true },
  "xyz:COPPER": { symbol: "HGUSD", assetClass: "commodity", market: "COMEX", basisComparable: true },
  "xyz:PLATINUM": { symbol: "PLUSD", assetClass: "commodity", market: "NYMEX", basisComparable: true },
  "xyz:PALLADIUM": { symbol: "PAUSD", assetClass: "commodity", market: "NYMEX", basisComparable: true },
  "xyz:NATGAS": { symbol: "NGUSD", assetClass: "commodity", market: "NYMEX", basisComparable: true },
  "xyz:CORN": { symbol: "ZCUSD", assetClass: "commodity", market: "CBOT", basisComparable: true },
  "xyz:WHEAT": { symbol: "ZWUSD", assetClass: "commodity", market: "CBOT", basisComparable: true },
  "xyz:CL": {
    symbol: "CLUSD",
    assetClass: "commodity",
    market: "NYMEX",
    basisComparable: false,
    basisNote: "Synthetic does not track the front-month WTI contract",
  },

  // ── Forex ─────────────────────────────────────────────────────────
  "xyz:EUR": { symbol: "EURUSD", assetClass: "forex", market: "FX", basisComparable: true },
  "xyz:GBP": { symbol: "GBPUSD", assetClass: "forex", market: "FX", basisComparable: true },
  "xyz:JPY": { symbol: "USDJPY", assetClass: "forex", market: "FX", basisComparable: true },
  "xyz:KRW": { symbol: "USDKRW", assetClass: "forex", market: "FX", basisComparable: true },

  // ── Indices ───────────────────────────────────────────────────────
  "xyz:SP500": { symbol: "^GSPC", assetClass: "index", market: "S&P", basisComparable: true },
  "xyz:NIFTY": { symbol: "^NSEI", assetClass: "index", market: "NSE", basisComparable: true },
  "xyz:IBOV": { symbol: "^BVSP", assetClass: "index", market: "B3", basisComparable: true },
  "xyz:DXY": { symbol: "^DXY", assetClass: "index", market: "ICE", basisComparable: true },
  "xyz:JP225": {
    symbol: "^N225",
    assetClass: "index",
    market: "Nikkei",
    basisComparable: false,
    basisNote: "Futures versus cash index — mapping not yet confirmed",
  },
  "xyz:VIX": {
    symbol: "^VIX",
    assetClass: "index",
    market: "CBOE",
    basisComparable: false,
    basisNote: "Synthetic tracks VIX futures, structurally above spot",
  },
};

/**
 * Resolve a HIP-3 coin to its real-world instrument.
 *
 * Normalises casing the same way the route does (`xyz:CL`), so `/XYZ/cl` and
 * `/xyz/CL` resolve to the same entry.
 */
export function getUnderlyingRef(coin: string): UnderlyingRef | null {
  const [dex, ticker] = coin.split(":");
  if (!dex || !ticker) return null;
  return HIP3_UNDERLYING[`${dex.toLowerCase()}:${ticker.toUpperCase()}`] ?? null;
}
