/**
 * Research timeline + tweet archive (source: public/hip4/HIP4-research-complete.md).
 */

export interface Hip4ResearchDay {
  id: string;
  label: string;
  bullets: string[];
}

export interface Hip4TweetArchiveEntry {
  id: string;
  title: string;
  url: string | null;
  excerpt: string;
  /** Continuation of same X thread as this id */
  threadOf?: string;
}

export const HIP4_RESEARCH_DAYS: Hip4ResearchDay[] = [
  {
    id: "day1",
    label: "Day 1 — March 24",
    bullets: [
      "HyperCore / HyperEVM architecture: EVM inside Core, EvmRawTx in MessagePack",
      "“2 worlds, 1 universe” — decoded V1 txs: deposit, createContest, finalizeContest",
      "V2 found via heimdall-rs; 24/24 selectors; full V1 vs V2 comparison",
      "HIP-4 as two layers: CLOB (HyperCore) + parimutuel (HyperEVM) — “two jars” theory",
    ],
  },
  {
    id: "day2",
    label: "Day 2 — March 25",
    bullets: [
      "V1 + V2 research published on Liquid Terminal + X",
      "Live testnet: YES on HYPE 15m market",
      "VoteGlobalAction discovered — native L1 settlement (no Merkle claim)",
      "registerTokensAndStandaloneOutcome — full L1 lifecycle mapped",
      "Early settlement signers 0xe92d… / 0xc25c… — later refined to 8-wallet cluster (Day 4)",
      "First winning prediction (BTC > 70,836); article draft + diagrams",
    ],
  },
  {
    id: "day3",
    label: "Day 3 — March 26",
    bullets: [
      "V2 contests 865–867; EvmRawTx dual-identity (relayer vs EVM signer)",
      "Deployer funding → Block Theory Cap theory; EVM likely not HL team",
      "Multi-outcome = independent YES/NO pairs; pair minting confirmed live",
      "EnigmaValidator joins; outcomeMeta, coin mapping, WebSocket research",
    ],
  },
  {
    id: "day4",
    label: "Day 4 — March 27",
    bullets: [
      "Eight linked L1 addresses traced as one cluster (@quertyeth, @valtitudexyz)",
      "Mapped: 0xc25c… HIP-4 operator (create / settle / questions / descriptions / named outcomes)",
      "Mapped: 0xe92d… oracle (price feed); historical settlement tx proof; recent settle often 0xc25c…",
      "Six cluster members unmapped (role TBD — hypotheses only)",
      "No overlap with EVM parimutuel deployer 0xe21c…",
    ],
  },
];

export const HIP4_TWEET_ARCHIVE: Hip4TweetArchiveEntry[] = [
  {
    id: "t1",
    title: "Tweet 1 — HIP-4 uses HyperEVM (later corrected)",
    url: "https://x.com/Yaugourt/status/2036072526565024209",
    excerpt:
      "First take: HIP-4 contest logic on EVM; trading on Core # markets. Later corrected — official flow is L1-native.",
  },
  {
    id: "t2",
    title: "Tweet 2 — V1 full research",
    url: "https://x.com/Yaugourt/status/2036438290576916632",
    excerpt:
      "Reverse-engineered ABI, events, reverts, storage, lifecycle, bridge — links liquidterminal.xyz/hip4.",
  },
  {
    id: "t3",
    title: "Tweet 3 — V2 contract found",
    url: "https://x.com/Yaugourt/status/2036539291195605367",
    excerpt:
      "Second genesis contract, OZ hardening vs V1; live Core markets still tied to V1 narrative at the time.",
  },
  {
    id: "t4",
    title: "Tweet 4 — First live test",
    url: "https://x.com/Yaugourt/status/2036925934947725798",
    excerpt: "15m HYPE market: YES at 0.50 for 15 USDH — link to testnet trade UI.",
  },
  {
    id: "t5",
    title: "Tweet 5 — VoteGlobalAction discovery",
    url: "https://x.com/Yaugourt/status/2036925934947725798",
    threadOf: "t4",
    excerpt:
      "Settlement on L1 VoteGlobalAction; no Merkle claim; example settlement tx in thread.",
  },
  {
    id: "t6",
    title: "Tweet 6 — First winning prediction",
    url: "https://x.com/Yaugourt/status/2037010387959247090",
    excerpt:
      "BTC above threshold YES won; instant payout; settler wallet rotation vs Polymarket/Kalshi.",
  },
  {
    id: "t7",
    title: "Tweet 7 — Creation tx found",
    url: "https://x.com/Yaugourt/status/2037010387959247090",
    threadOf: "t6",
    excerpt:
      "registerTokensAndStandaloneOutcome for recurring priceBinary BTC; full L1 create → trade → settle.",
  },
  {
    id: "t8",
    title: "Tweet 8 — Pair minting mechanics",
    url: "https://x.com/Yaugourt/status/2037029899249004683",
    excerpt:
      "BUY YES mirrors NO; YES+NO=1.00; native Core matching vs Polymarket CTF.",
  },
  {
    id: "t9",
    title: "Tweet 9 — Minimum order (EnigmaValidator)",
    url: "https://x.com/EnigmaValidator",
    excerpt:
      "size × min(markPx, 1−markPx) ≥ $10; API vs UI; Liquidiction — author profile (post URL may vary).",
  },
  {
    id: "t10",
    title: "Tweet 10 — Correction + new findings",
    url: "https://x.com/Yaugourt/status/2037193257210331467",
    excerpt:
      "EVM contracts likely third-party; official HIP-4 = L1 only; multi-outcome + HIP-3 feed angle.",
  },
];
