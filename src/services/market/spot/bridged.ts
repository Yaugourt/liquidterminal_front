/**
 * Bridged underlyings listed on HL spot: tokens deployed by Unit
 * (0xf036…6155) and Wagyu (0x2077…e06a, "… - Wagyu.xyz"). Their supply fields
 * — including HL's own `tokenDetails.circulatingSupply` — mirror the FULL
 * underlying supply (e.g. 21M for UBTC), so price × supply is an FDV of the
 * underlying asset, not a HyperLiquid market cap. Anywhere a market cap is
 * shown, these render "—" instead of a misleading value.
 *
 * Keyed by the name `/market/spot` displays (the backend shows UBTC as BTC,
 * UETH as ETH, USOL as SOL, UFART as FARTCOIN, UPUMP as PUMP). Built from
 * every listed token's deployer on 2026-10-12; the other U* names are Unit
 * underlyings not listed yet. Bare names (TRUMP, LINK, BONK…) are left out:
 * HIP-1 tokens use them too — TRUMP is a HyperCore meme, not Unit's UTRUMP.
 */
const BRIDGED = new Set([
  // Unit, listed
  "BTC", "ETH", "SOL", "FARTCOIN", "PUMP", "UANSEM", "UAVAX", "UBONK", "UDZ",
  "UENA", "UMEGA", "UMOG", "UMON", "USPYX", "UUUSPX", "UVIRT", "UWLD", "UXPL",
  "UZEC",
  // Wagyu, listed (its TSLA is a tokenized stock, priced by the bridge reserve)
  "TAO1", "TRX1", "XMR1", "ZEC1",
  // Unit raw names, and underlyings not listed yet
  "UBTC", "UETH", "USOL", "UFART", "UPUMP", "UXRP", "UDOGE", "UBNB", "ULTC",
  "UXMR", "UADA", "USUI", "UTRX", "UXLM", "UTON", "UNEAR", "UAPT", "USEI",
  "ULINK", "UDOT", "UBCH", "UPAXG", "USPX", "UTRUMP", "UPENGU",
]);

export const isBridged = (name: string) => BRIDGED.has(name.trim().toUpperCase());
