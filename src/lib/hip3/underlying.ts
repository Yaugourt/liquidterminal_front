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

/**
 * Keyed by TICKER, not by `dex:TICKER`.
 *
 * The instrument a synthetic tracks is a property of the ticker: `cash:NVDA`
 * and `xyz:NVDA` are both Nvidia. Keying by venue meant a second HIP-3 venue
 * listing the same eight companies got no card at all.
 */
export const HIP3_UNDERLYING: Record<string, UnderlyingRef> = {
  // ── US equities & US-listed ADRs ──────────────────────────────────
  "AAPL": EQUITY("AAPL"),
  "AMAT": EQUITY("AMAT"),
  "AMD": {
    ...EQUITY("AMD"),
    basisComparable: false,
    basisNote: "Measured gap exceeds weekend drift — mapping not yet confirmed",
  },
  "AMZN": EQUITY("AMZN"),
  "AVGO": EQUITY("AVGO"),
  "BX": EQUITY("BX", "NYSE"),
  "COIN": EQUITY("COIN"),
  "COST": EQUITY("COST"),
  "CRCL": EQUITY("CRCL", "NYSE"),
  "CRWV": EQUITY("CRWV"),
  "DELL": EQUITY("DELL", "NYSE"),
  "DKNG": EQUITY("DKNG"),
  "EBAY": EQUITY("EBAY"),
  "GME": EQUITY("GME", "NYSE"),
  "GOOGL": EQUITY("GOOGL"),
  "HIMS": EQUITY("HIMS", "NYSE"),
  "HOOD": EQUITY("HOOD"),
  "IBM": EQUITY("IBM", "NYSE"),
  "INTC": {
    ...EQUITY("INTC"),
    basisComparable: false,
    basisNote: "Measured gap exceeds weekend drift — mapping not yet confirmed",
  },
  "LLY": EQUITY("LLY", "NYSE"),
  "META": EQUITY("META"),
  "MRVL": EQUITY("MRVL"),
  "MSFT": EQUITY("MSFT"),
  "MSTR": EQUITY("MSTR"),
  "MU": EQUITY("MU"),
  "NBIS": EQUITY("NBIS"),
  "NFLX": EQUITY("NFLX"),
  "NOK": EQUITY("NOK", "NYSE"),
  "NOW": EQUITY("NOW", "NYSE"),
  "NVDA": EQUITY("NVDA"),
  "ORCL": EQUITY("ORCL", "NYSE"),
  "PLTR": EQUITY("PLTR"),
  "QCOM": EQUITY("QCOM"),
  "RIVN": EQUITY("RIVN"),
  "RKLB": EQUITY("RKLB"),
  "SNDK": EQUITY("SNDK"),
  "STRC": EQUITY("STRC"),
  "TSLA": EQUITY("TSLA"),
  "WDC": EQUITY("WDC", "NYSE"),
  "ZM": EQUITY("ZM"),
  "BE": EQUITY("BE", "NYSE"),
  "BB": EQUITY("BB", "NYSE"),
  "LITE": EQUITY("LITE"),
  "USAR": EQUITY("USAR"),
  "BABA": {
    ...EQUITY("BABA", "NYSE"),
    basisComparable: false,
    basisNote: "ADR versus Hong Kong listing — ratio not yet confirmed",
  },
  "TSM": EQUITY("TSM", "NYSE"),
  "ASML": EQUITY("ASML"),
  "ARM": EQUITY("ARM"),

  // ── US-listed ETFs ────────────────────────────────────────────────
  "SMH": { symbol: "SMH", assetClass: "etf", market: "NASDAQ", basisComparable: true },
  "XLE": { symbol: "XLE", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "EWJ": { symbol: "EWJ", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "EWT": { symbol: "EWT", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "EWY": { symbol: "EWY", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "EWZ": { symbol: "EWZ", assetClass: "etf", market: "NYSE Arca", basisComparable: true },
  "URNM": { symbol: "URNM", assetClass: "etf", market: "NYSE Arca", basisComparable: true },

  // ── Non-US listings (paid tiers only, kept so an upgrade just works) ──
  "SOFTBANK": EQUITY("9984.T", "Tokyo"),
  "IBIDEN": EQUITY("4062.T", "Tokyo"),
  "KIOXIA": EQUITY("285A.T", "Tokyo"),
  "HYUNDAI": EQUITY("005380.KS", "Seoul"),
  "SKHX": EQUITY("000660.KS", "Seoul"),
  "SMSN": EQUITY("005930.KS", "Seoul"),

  // ── Commodities ───────────────────────────────────────────────────
  "GOLD": { symbol: "GCUSD", assetClass: "commodity", market: "COMEX", basisComparable: true },
  "SILVER": { symbol: "SIUSD", assetClass: "commodity", market: "COMEX", basisComparable: true },
  "BRENTOIL": { symbol: "BZUSD", assetClass: "commodity", market: "ICE", basisComparable: true },
  "COPPER": { symbol: "HGUSD", assetClass: "commodity", market: "COMEX", basisComparable: true },
  "PLATINUM": { symbol: "PLUSD", assetClass: "commodity", market: "NYMEX", basisComparable: true },
  "PALLADIUM": { symbol: "PAUSD", assetClass: "commodity", market: "NYMEX", basisComparable: true },
  "NATGAS": { symbol: "NGUSD", assetClass: "commodity", market: "NYMEX", basisComparable: true },
  "CORN": { symbol: "ZCUSD", assetClass: "commodity", market: "CBOT", basisComparable: true },
  "WHEAT": { symbol: "ZWUSD", assetClass: "commodity", market: "CBOT", basisComparable: true },
  "CL": {
    symbol: "CLUSD",
    assetClass: "commodity",
    market: "NYMEX",
    basisComparable: false,
    basisNote: "Synthetic does not track the front-month WTI contract",
  },

  // ── Forex ─────────────────────────────────────────────────────────
  "EUR": { symbol: "EURUSD", assetClass: "forex", market: "FX", basisComparable: true },
  "GBP": { symbol: "GBPUSD", assetClass: "forex", market: "FX", basisComparable: true },
  "JPY": { symbol: "USDJPY", assetClass: "forex", market: "FX", basisComparable: true },
  "KRW": { symbol: "USDKRW", assetClass: "forex", market: "FX", basisComparable: true },

  // ── Indices ───────────────────────────────────────────────────────
  "SP500": { symbol: "^GSPC", assetClass: "index", market: "S&P", basisComparable: true },
  "NIFTY": { symbol: "^NSEI", assetClass: "index", market: "NSE", basisComparable: true },
  "IBOV": { symbol: "^BVSP", assetClass: "index", market: "B3", basisComparable: true },
  "DXY": { symbol: "^DXY", assetClass: "index", market: "ICE", basisComparable: true },
  "JP225": {
    symbol: "^N225",
    assetClass: "index",
    market: "Nikkei",
    basisComparable: false,
    basisNote: "Futures versus cash index — mapping not yet confirmed",
  },
  "VIX": {
    symbol: "^VIX",
    assetClass: "index",
    market: "CBOE",
    basisComparable: false,
    basisNote: "Synthetic tracks VIX futures, structurally above spot",
  },
};

/**
 * Resolve a HIP-3 coin to its real-world instrument, from any venue.
 *
 * Casing is normalised so `/XYZ/cl` and `/xyz/CL` land on the same entry.
 */
export function getUnderlyingRef(coin: string): UnderlyingRef | null {
  const ticker = coin.split(":")[1];
  if (!ticker) return null;
  return HIP3_UNDERLYING[ticker.toUpperCase()] ?? null;
}
