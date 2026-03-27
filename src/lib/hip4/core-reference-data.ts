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
  /** Optional on-chain proof (e.g. historical settlement tx). */
  evidenceUrl?: string;
}

/** HyperEVM parimutuel deployer — not in the L1 HIP-4 operator cluster. */
export const HIP4_EVM_PARIMUTUEL_DEPLOYER =
  "0xe21c78037329d06fe0d6fefc4221aaa67cb0d135";

/**
 * Eight linked system addresses on testnet (cluster trace).
 * Two roles mapped; six remain TBD — see Core + markdown for narrative.
 */
export const HIP4_SYSTEM_WALLETS: Hip4SystemWalletRow[] = [
  {
    address: "0xe8ea5ea785619f4d20b34b34ca1d5c5f68fe60a3",
    role: "Cluster (unmapped) — testnet only; role TBD (validators, bridge, or other Core ops — hypothesis only).",
  },
  {
    address: "0xe5377a540f412e50e3953374e07ab8677138924f",
    role: "Cluster (unmapped) — testnet only; role TBD (hypothesis only).",
  },
  {
    address: "0xe92d5afedaf9eab98a70b7b0118b7187c1292c5c",
    role: "Oracle — on-chain price feed. Historical settlement from this wallet observed (proof). Recent settlement traffic often attributed to 0xc25c… per testnet trace; also voteAppHash / validation activity observed.",
    evidenceUrl:
      "https://app.hyperliquid-testnet.xyz/explorer/tx/0xe3e78e3d72eabe68e561041f8bbfbe000022a6230deddd3a87b0399031ee9853",
  },
  {
    address: "0xc25c4a1e3872f4d601d70b5db85604f7039ece56",
    role: "HIP-4 operator — creates & settles markets, questions, descriptions, named outcomes/tokens (explorer: RegisterTokensAndStandaloneOutcome, RegisterOutcome, SettleOutcome, RegisterQuestion, ChangeOutcomeDescription, ChangeQuestionDescription). Docs/API often use registerTokensAndStandaloneOutcome / VoteGlobalAction.",
  },
  {
    address: "0x58e1b0e63c905d5982324fcd9108582623b8132e",
    role: "Cluster (unmapped) — testnet only; role TBD (hypothesis only).",
  },
  {
    address: "0x263294039413b96d25e4173a5f7599f8b3801504",
    role: "Cluster (unmapped) — testnet only; role TBD (hypothesis only).",
  },
  {
    address: "0xef2364db5db6f5539aa0bc111771a94ee47637fc",
    role: "Cluster (unmapped) — testnet only; role TBD (hypothesis only).",
  },
  {
    address: "0xda6816df552c3f9e0fb64979fb357800d690d79b",
    role: "Cluster (unmapped) — testnet only; role TBD (hypothesis only).",
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
