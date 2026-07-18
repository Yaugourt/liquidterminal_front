import type { FaqItem } from "@/components/common";

/**
 * Per-page FAQ copy, rendered by `<PageFaq>` (visible text + FAQPage JSON-LD).
 *
 * Two rules for anything added here:
 * - facts come from the Hyperliquid docs, not from memory;
 * - no live figures (prices, counts, volumes). They belong to the tables above
 *   the block, which update on their own; a number frozen in a string goes
 *   stale silently and the schema markup would then publish it as fact.
 */

export const MARKET_FAQ: FaqItem[] = [
  {
    q: "What can you trade on Hyperliquid?",
    a: "Four venues share one exchange. Spot trades HIP-1 tokens issued on the Hyperliquid L1, perpetuals cover crypto majors and long-tail assets, HIP-3 lets builders deploy their own perp DEXs on the same matching engine, and HIP-4 outcome markets price binary events between 0 and 1.",
  },
  {
    q: "What is the difference between spot and perpetuals?",
    a: "Spot is ownership: you hold the token itself and settlement is final. A perpetual is a derivative with no expiry that tracks an oracle price, uses margin, and exchanges a funding payment every hour between longs and shorts to stay anchored to spot.",
  },
  {
    q: "Is Hyperliquid an on-chain exchange?",
    a: "Yes. Order placement, matching, funding, liquidations and settlement all execute on the Hyperliquid L1 through HyperCore, its native order book, rather than on an off-chain matching engine or an AMM.",
  },
];

export const SPOT_FAQ: FaqItem[] = [
  {
    q: "What is the Hyperliquid spot market?",
    a: "It is HyperCore's native order book for HIP-1 tokens, the token standard of the Hyperliquid L1. Orders rest in a central limit order book and match on-chain, so spot trading behaves like a centralised exchange while settling on the chain itself.",
  },
  {
    q: "How does a token get listed on Hyperliquid spot?",
    a: "Through the HIP-1 ticker auction. A deployer wins a ticker in a Dutch auction that runs 31 hours, where the deployment gas decays linearly down to a floor of 500 HYPE. Each auction opens at twice the price the previous auction settled at.",
  },
  {
    q: "Which figures does this page track?",
    a: "Every spot market with its price, 24h volume, marketcap and change, plus stablecoin liquidity on the venue and the state of the live ticker auction. Sort any column to rank the market by what you care about.",
  },
];

export const PERP_FAQ: FaqItem[] = [
  {
    q: "How does funding work on Hyperliquid perpetuals?",
    a: "Funding is paid every hour, computed as one eighth of an eight-hour rate. It combines a fixed interest component of 0.01% per 8 hours, which is 11.6% APR paid to shorts, with a premium tracking the gap to the oracle price. The total is capped at 4% per hour.",
  },
  {
    q: "What does open interest tell you?",
    a: "Open interest is the total notional value of perpetual positions currently open. Read it next to volume: rising open interest alongside a rising price means new positions are funding the move, while a drop points to positions closing or being liquidated.",
  },
  {
    q: "Which perpetual markets exist on Hyperliquid?",
    a: "Crypto majors and long-tail assets trade on the core venue. Builder-deployed markets under HIP-3 extend the range to equities, foreign exchange and commodities, each run by its own deployer on the same matching engine.",
  },
];

export const PERPDEX_FAQ: FaqItem[] = [
  {
    q: "What is HIP-3?",
    a: "HIP-3 makes perpetual listing permissionless. A builder stakes HYPE, deploys its own perp DEX on Hyperliquid, defines the oracle and takes a configurable share of the fees, while orders still match on the shared Hyperliquid engine.",
  },
  {
    q: "What does deploying a HIP-3 perp DEX require?",
    a: "500k HYPE staked on mainnet, held for at least 183 days after deployment. The first three assets of a DEX launch without an auction; further assets go through a Dutch auction shared by every HIP-3 deployer.",
  },
  {
    q: "Who sets prices on a builder-deployed DEX?",
    a: "The deployer does. It is responsible for publishing oracle prices, setting leverage limits and settling the market if needed, with protocol-level slashing if it operates maliciously.",
  },
];

export const BUILDERS_FAQ: FaqItem[] = [
  {
    q: "What is a builder code on Hyperliquid?",
    a: "A builder code lets an interface that routes an order to Hyperliquid collect a fee on the fills it sends. It is how wallets, terminals and trading bots earn on the order flow they bring to the exchange.",
  },
  {
    q: "How much can a builder charge?",
    a: "Up to 0.1% on perpetuals and up to 1% on spot. The user approves a maximum fee for each builder and can revoke it at any time, and a single account can authorise up to ten builders simultaneously.",
  },
  {
    q: "What does this leaderboard rank?",
    a: "Every builder by the volume routed through its code and the fees that volume generated, over 24 hours, 7 days, 30 days or all time. Open a builder to see its top users and its share of total order flow.",
  },
];

export const HIP4_FAQ: FaqItem[] = [
  {
    q: "What is HIP-4?",
    a: "HIP-4 brings outcome markets to Hyperliquid: fully collateralised contracts that settle inside a fixed range. They give prediction-market and bounded-option exposure without leverage and without liquidations.",
  },
  {
    q: "How are the odds priced?",
    a: "Outcome tokens trade between 0 and 1, so the price reads directly as an implied probability. The two sides share a single order book: buying Yes at price p is the same order as selling No at 1 minus p.",
  },
  {
    q: "How does a market settle?",
    a: "At settlement each Yes token converts to settleFraction quote tokens and each No token to one minus that fraction, so a fully resolved yes pays out one and a resolved no pays out zero.",
  },
];

export const TRACKER_FAQ: FaqItem[] = [
  {
    q: "What can you track with a Hyperliquid wallet tracker?",
    a: "Any address on Hyperliquid: its open positions, realised and unrealised PnL, balances and recent activity. Group addresses into lists to follow a desk, a strategy or a set of traders as one portfolio.",
  },
  {
    q: "Do you need an account?",
    a: "No account is needed to look up a wallet or browse the public lists. Signing in only matters if you want to save your own lists, import addresses from a CSV file or keep a personal watchlist.",
  },
];

export const VAULTS_FAQ: FaqItem[] = [
  {
    q: "What is a Hyperliquid vault?",
    a: "A vault is a shared trading account. Depositors put in USDC, the vault leader trades the pooled capital, and profits and losses are distributed to depositors in proportion to their share of the vault.",
  },
  {
    q: "What is HLP?",
    a: "HLP, the Hyperliquidity Provider, is the protocol's own vault. It runs market-making strategies, performs liquidations, supplies USDC in Earn and accrues a portion of trading fees. It is community-owned, and deposits carry a 4-day lock-up.",
  },
  {
    q: "What does the APR on this page mean?",
    a: "It is the performance the vault actually realised over the selected window, not a promised or guaranteed yield. Vault returns come from trading, so they can be negative and past windows do not predict future ones.",
  },
];

export const VALIDATORS_FAQ: FaqItem[] = [
  {
    q: "How does HYPE staking work?",
    a: "You delegate HYPE to one or more validators on HyperCore and rewards compound automatically by redelegating to the same validator. A delegation is locked for one day, and moving stake back to your spot account goes through a 7-day unstaking queue.",
  },
  {
    q: "What does it take to run a Hyperliquid validator?",
    a: "A validator needs 10k HYPE of self-delegation to become active. The network runs HyperBFT consensus, where the validator set evolves in epochs of 100k rounds, roughly 90 minutes on mainnet, and safety requires more than two thirds of stake to be honest.",
  },
];

export const LIQUIDATIONS_FAQ: FaqItem[] = [
  {
    q: "What is a liquidation on Hyperliquid?",
    a: "When the margin backing a position falls under the maintenance requirement, the protocol force-closes it to keep the account solvent. Liquidations are handled on-chain, and HLP absorbs part of the resulting flow.",
  },
  {
    q: "Why watch the liquidation feed?",
    a: "Clusters of liquidations mark where leverage was concentrated and often coincide with the sharpest moves. The feed shows each forced closure with its size and notional value, so you can see which markets carried the risk.",
  },
];

export const SPOT_AUCTION_FAQ: FaqItem[] = [
  {
    q: "How does the Hyperliquid ticker auction work?",
    a: "It is a Dutch auction over 31 hours. The deployment gas starts high and decays linearly to a floor of 500 HYPE, and the first deployer to accept the current price wins the ticker. The next auction opens at twice the price the last one settled at.",
  },
  {
    q: "What do you actually buy?",
    a: "The right to deploy a HIP-1 token under that ticker on the Hyperliquid spot order book. The auction sells the name and the deployment slot, not any supply of the token itself.",
  },
];

export const PERP_AUCTION_FAQ: FaqItem[] = [
  {
    q: "What is the Hyperliquid perp deploy auction?",
    a: "It is the Dutch auction that gates new HIP-3 assets. Every builder-deployed perp DEX draws from the same auction, priced in HYPE and using the same parameters as the HIP-1 ticker auction.",
  },
  {
    q: "Does every market need to go through it?",
    a: "No. The first three assets of a perp DEX deploy without an auction, and each deployer also gets seven reserve deployments usable at the current auction price without waiting for the timer.",
  },
];

export const HYPE_FAQ: FaqItem[] = [
  {
    q: "What is HYPE used for?",
    a: "HYPE is the native asset of Hyperliquid. It pays the deployment gas in HIP-1 ticker auctions and HIP-3 deploy auctions, it is the asset staked with validators to secure the chain, and it is what the Assistance Fund buys back with protocol revenue.",
  },
  {
    q: "How does staking HYPE work?",
    a: "Stake is delegated to validators on HyperCore and rewards compound automatically. Each delegation is locked for one day, and returning stake to your spot account passes through a 7-day unstaking queue.",
  },
];

export const ECOSYSTEM_FAQ: FaqItem[] = [
  {
    q: "What is in the Hyperliquid ecosystem directory?",
    a: "Every project building on Hyperliquid, on HyperCore or on HyperEVM: DeFi protocols, wallets, terminals, infrastructure and tooling. Projects tracked by DefiLlama carry their live TVL, fees and category ranking.",
  },
  {
    q: "Why do some projects show no metrics?",
    a: "A project only shows TVL and fees when it is tracked as a protocol on DefiLlama. Wallets, tooling and interfaces often hold no capital of their own, so they are listed with their links and category but without financial metrics.",
  },
];
