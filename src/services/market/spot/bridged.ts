/**
 * Unit-bridged underlyings listed on HL spot. Their supply fields — including
 * HL's own `tokenDetails.circulatingSupply` — mirror the FULL underlying
 * supply (e.g. 21M for UBTC), so price × supply is an FDV of the underlying
 * asset, not a HyperLiquid market cap. Anywhere a market cap is shown, these
 * render "—" instead of a misleading value. Name-based heuristic until the
 * backend exposes on-HL circulating supply.
 */
const BRIDGED = new Set([
  "BTC", "UBTC", "ETH", "UETH", "SOL", "USOL", "XRP", "UXRP", "DOGE", "UDOGE",
  "BNB", "UBNB", "LTC", "ULTC", "XMR1", "UXMR", "ZEC", "UZEC", "ADA", "UADA",
  "SUI", "USUI", "TRX", "UTRX", "XLM", "UXLM", "TON", "UTON", "NEAR", "UNEAR",
  "APT", "UAPT", "SEI", "USEI", "AVAX", "UAVAX", "LINK", "ULINK", "DOT", "UDOT",
  "BCH", "UBCH", "PAXG", "UPAXG", "PUMP", "UPUMP", "FART", "UFART",
  "SPX", "USPX", "TRUMP", "UTRUMP", "BONK", "UBONK", "PENGU", "UPENGU",
]);

export const isBridged = (name: string) => BRIDGED.has(name.trim().toUpperCase());
