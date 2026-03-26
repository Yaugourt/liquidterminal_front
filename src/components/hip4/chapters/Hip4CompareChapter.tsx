import {
  Hip4ChapterShell,
  Hip4DocLead,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4CompareTable } from "@/components/hip4/Hip4CompareTable";

const HEADERS = ["Feature", "HIP-4 (Hyperliquid)", "Polymarket", "Kalshi"];

const ROWS: [string, string, string, string][] = [
  ["Type", "Native L1 CLOB", "Hybrid (off-chain matching, on-chain settlement)", "Centralized"],
  [
    "Settlement",
    "Auto, native L1 (VoteGlobalAction), instant — price-linked outcomes (observed)",
    "UMA oracle, dispute window",
    "Platform confirms",
  ],
  ["Chain", "HyperCore (~0.07s blocks)", "Polygon (ERC1155 CTF)", "N/A"],
  [
    "Trading",
    "Continuous CLOB, enter/exit anytime",
    "Continuous CLOB, enter/exit anytime",
    "Continuous, enter/exit anytime",
  ],
  [
    "Pair minting",
    "Native in matching engine",
    "Conditional Token Framework (smart contract)",
    "Internal",
  ],
  ["Oracle", "On-chain price feed (system wallets)", "UMA Optimistic Oracle", "Internal"],
  [
    "Dispute mechanism",
    "None (trustless for price, trust-based for custom)",
    "UMA dispute (bond + vote)",
    "Platform decision",
  ],
  [
    "Composability",
    "Same engine as perps/spot, unified margin (theory)",
    "Isolated on Polygon",
    "None",
  ],
  ["Cost", "Near zero gas", "Polygon gas", "Platform fees"],
  ["Regulation", "Unregulated", "Unregulated (non-US)", "CFTC-regulated"],
];

export function Hip4CompareChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="Industry comparison"
        subtitle={
          <>
            <p>
              High-level contrast with Polymarket and Kalshi. Rows are simplified; check each
              platform for legal and product nuance.
            </p>
            <p>
              CLOB trading exists on several venues; what stands out for HIP-4 under research is{" "}
              <strong className="text-white">native L1 settlement</strong> for{" "}
              <strong className="text-white">price-linked</strong> outcomes (observed on testnet) and
              tight coupling with the HyperCore engine. Subjective or off-price resolution is still
              an open question — see the research doc.
            </p>
          </>
        }
      />
      <Hip4GlassPanel>
        <Hip4DocLead className="mb-4 text-xs">
          Read down the <strong className="text-white">Feature</strong> column first; each cell is one
          sentence max.
        </Hip4DocLead>
        <Hip4CompareTable
          headers={HEADERS}
          rows={ROWS.map((cells, ri) =>
            cells.map((c, ci) => <span key={`${ri}-${ci}`}>{c}</span>)
          )}
        />
        <p className="mt-4 text-xs text-text-muted leading-relaxed">
          Instant L1 settlement in the HIP-4 column refers to outcomes resolved from the on-chain
          price feed; subjective or non-market-linked markets are not confirmed. Polymarket and Kalshi
          also offer continuous CLOB trading. A “dual system” (CLOB + parimutuel) on Hyperliquid
          remains a testnet observation, not confirmed design — see the research doc.
        </p>
      </Hip4GlassPanel>
      <Hip4GlassPanel>
        <Hip4SectionTitle>Source</Hip4SectionTitle>
        <p className="text-xs text-text-secondary">
          Table adapted from the “Comparison: HIP-4 vs Polymarket vs Kalshi” section in{" "}
          <code className="font-mono text-brand-accent">HIP4-research-complete.md</code>.
        </p>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
