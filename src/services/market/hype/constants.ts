/**
 * HYPE token constants and genesis reference data.
 *
 * The live supply / price / Assistance-Fund figures are always read from the
 * on-chain Hyperliquid `info` API (the authoritative source the rest of the app
 * already consumes). Only the *static* genesis facts — distribution buckets and
 * vesting schedule, which never change — live here as reference data.
 */

/** HYPE token id for the `tokenDetails` info request (supply data). */
export const HYPE_TOKEN_ID = "0x0d01dc56dcaaca66ad901c959b4011ec";

/** HYPE spot pair coin id (HYPE/USDC) for trades / candle subscriptions. */
export const HYPE_SPOT_COIN = "@107";

/** L1 system address that buys back HYPE with protocol fees. Has no private
 *  key — HYPE sent here cannot be withdrawn (functions like a burn sink). */
export const ASSISTANCE_FUND_ADDRESS =
  "0xfefefefefefefefefefefefefefefefefefefefe";

/**
 * Share of net protocol trading fees (perp + spot) routed to the Assistance
 * Fund for HYPE buybacks. Per the Hyperliquid docs / DefiLlama, ~99% of fees
 * flow to the AF (only ~1% to HLP suppliers, cut from 3% on 2025-08-30). Used
 * to translate observed protocol revenue into an approximate buyback rate.
 */
export const AF_FEE_SHARE = 0.99;

/** Genesis token-generation event. */
export const HYPE_GENESIS_DATE = "2024-11-29";

/** Genesis max supply (HYPE), fixed at the TGE. */
export const HYPE_MAX_SUPPLY = 1_000_000_000;

export interface GenesisAllocation {
  key: string;
  label: string;
  /** Percentage of genesis max supply. */
  pct: number;
  /** Token amount (HYPE). */
  amount: number;
  /** Short note on purpose / vesting. */
  note: string;
  /** True when the bucket is locked / not yet freely circulating. */
  locked?: boolean;
}

/**
 * Genesis distribution of the 1,000,000,000 HYPE — no VC, private, CEX or
 * market-maker allocation. Percentages sum to 100%, amounts to 1B.
 * Source: Hyperliquid docs (tokenomics).
 */
export const HYPE_GENESIS_DISTRIBUTION: readonly GenesisAllocation[] = [
  {
    key: "airdrop",
    label: "Genesis airdrop",
    pct: 31,
    amount: 310_000_000,
    note: "Airdropped 2024-11-29 to Season 1–2 points earners — one of the largest in crypto. Fully community-directed.",
  },
  {
    key: "emissions",
    label: "Future emissions & rewards",
    pct: 38.888,
    amount: 388_880_000,
    note: "Reserve for ongoing emissions, future seasons, liquidity and builder incentives. Largely undistributed.",
    locked: true,
  },
  {
    key: "core",
    label: "Core contributors",
    pct: 23.8,
    amount: 238_000_000,
    note: "1-year cliff post-genesis, then linear vesting to ~2027–2028. Monthly unlocks on the 6th.",
    locked: true,
  },
  {
    key: "foundation",
    label: "Hyper Foundation",
    pct: 6,
    amount: 60_000_000,
    note: "Foundation operating budget for ecosystem development.",
    locked: true,
  },
  {
    key: "grants",
    label: "Community grants",
    pct: 0.3,
    amount: 3_000_000,
    note: "Ecosystem and community grant programs.",
  },
  {
    key: "hip2",
    label: "HIP-2 (Hyperliquidity)",
    pct: 0.012,
    amount: 120_000,
    note: "On-chain automated liquidity provisioning seeded at genesis.",
  },
] as const;
