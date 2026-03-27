/**
 * HyperCore L1 + testnet API reference rows (source: public/hip4/HIP4-research-complete.md).
 */

export const HIP4_TESTNET_INFO_URL = "https://api.hyperliquid-testnet.xyz/info";
export const HIP4_TESTNET_WS_URL = "wss://api.hyperliquid-testnet.xyz/ws";

export interface Hip4WsChannelRow {
  channel: string;
  purpose: string;
}

export const HIP4_WS_CHANNELS: Hip4WsChannelRow[] = [
  {
    channel: "activeSpotAssetCtx",
    purpose: "Real-time ctx per coin (#YES / #NO); markPx ≈ implied probability.",
  },
  {
    channel: "l2Book",
    purpose: "Depth per coin; levels[0] bids, levels[1] asks.",
  },
];

export interface Hip4L1ActionRow {
  type: string;
  role: string;
}

export const HIP4_L1_ACTIONS: Hip4L1ActionRow[] = [
  {
    type: "registerTokensAndStandaloneOutcome",
    role: "Market creation — mints YES/NO pair; strike ≈ markPx at creation.",
  },
  {
    type: "VoteGlobalAction",
    role: "Settlement — settleFraction 0/1; instant L1 payout, no Merkle claim.",
  },
  {
    type: "VoteGlobalAction::SetOutcomeFeeScale",
    role: "Governance — global outcome fee scale (hl-node); cooldown between changes. Not the settle-outcome VoteGlobalAction path.",
  },
  {
    type: "voteAppHash",
    role: "Consensus / block validation (example in full doc).",
  },
  {
    type: "evmRawTx",
    role: "RLP EIP-1559 payload inside Core — relayer vs EVM signer (bridge doc).",
  },
];

export interface Hip4SystemWalletRow {
  address: string;
  role: string;
}

export const HIP4_SYSTEM_WALLETS: Hip4SystemWalletRow[] = [
  {
    address: "0xe92d5afedaf9eab98a70b7b0118b7187c1292c5c",
    role: "Oracle / mark updates, VoteGlobalAction settlement, voteAppHash",
  },
  {
    address: "0xc25c4a1e3872f4d601d70b5db85604f7039ece56",
    role: "Outcome settler (rotating duty on testnet)",
  },
];

export interface Hip4S3DatasetRow {
  path: string;
  notes: string;
}

export const HIP4_S3_DATASETS: Hip4S3DatasetRow[] = [
  {
    path: "s3://hl-mainnet-evm-blocks/",
    notes: "MessagePack + LZ4; requester pays; indexed by EVM block.",
  },
  {
    path: "s3://hl-testnet-evm-blocks/",
    notes: "Same layout as mainnet; example path 0/6000/6123.rmp.lz4",
  },
  {
    path: "node_fills_by_block (HyperCore)",
    notes: "Full trade fills; public recentTrades API = last 10 only, no pagination.",
  },
];

export const HIP4_COIN_ID_NOTE =
  "YES coin = \"#\" + (outcomeId × 10); NO coin = \"#\" + (outcomeId × 10 + 1). Example: outcome 2243 → #22430 / #22431.";
