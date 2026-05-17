import {
  Hip4ChapterShell,
  Hip4DocLead,
  Hip4GlassPanel,
  Hip4SectionTitle,
  Hip4SubsectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Hip4GoldHighlight } from "@/components/hip4/Hip4GoldHighlight";
import { HIP4_EVM_PARIMUTUEL_DEPLOYER } from "@/lib/hip4/core-reference-data";
import Link from "next/link";

const ARCH_ASCII = `┌─────────────────────────────────────────────┐
│              HyperBFT Consensus             │
│           (L1 blocks every ~0.07s)          │
├─────────────────────────────────────────────┤
│                 HYPERCORE                    │
│   Order book · Perps · Settlement · State   │
│                                             │
│   HIP-4 prediction markets (native L1):     │
│   - registerTokensAndStandaloneOutcome      │
│   - CLOB pair minting (YES+NO = 1.00)       │
│   - VoteGlobalAction (auto-settlement)      │
│                                             │
│   ┌───────────────────────────────────┐     │
│   │           HYPEREVM                │     │
│   │   (not used by official HIP-4)   │     │
│   │   Third-party parimutuel only     │     │
│   └───────────────────────────────────┘     │
└─────────────────────────────────────────────┘`;

const LIFECYCLE_ASCII = `[1] CREATE
    registerTokensAndStandaloneOutcome
    → mints YES/NO token pair
    → strike ≈ markPx at creation
    → markets open ~50/50

[2] TRADE
    Standard CLOB in USDH
    → pair minting: BUY YES @ 0.40 = mirror ASK NO @ 0.60
    → trade until expiry

[3] SETTLE
    VoteGlobalAction
    → system wallet reads price at expiry
    → all positions in one block
    → winner 1.00/token, loser 0 — instant balance credit`;

const PAIR_EXAMPLE = `#22430 (Yes):  ASK 0.5 × 835  (1 order)
#22431 (No):   BID 0.5 × 835  (1 order)`;

export function Hip4CoreChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="HyperCore (L1)"
        subtitle={
          <>
            <p>
              Official HIP-4 flow lives entirely on HyperCore: creation, CLOB trading, settlement —
              no EVM in the documented path.
            </p>
            <p>
              For API field names and examples, pair this page with{" "}
              <Link href="/hip4/info-api" className="text-brand-accent hover:underline">
                Info endpoint
              </Link>{" "}
              and{" "}
              <Link href="/hip4/reference" className="text-brand-accent hover:underline">
                API & data overview
              </Link>
              .
            </p>
          </>
        }
      />

      <Hip4GlassPanel>
        <Hip4SectionTitle>Architecture (conceptual)</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Single consensus stack: HyperCore owns the book; HyperEVM sits inside the same universe
          but is not part of official HIP-4 settlement.
        </Hip4DocLead>
        <Hip4CodeBlock>{ARCH_ASCII}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Lifecycle</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Three phases from creation to payout — all on L1.
        </Hip4DocLead>
        <Hip4CodeBlock>{LIFECYCLE_ASCII}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Pair minting</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          A BUY on YES is mirrored on the NO book so YES + NO always prices to 1.00. Collateral locks
          on both sides until settlement.
        </Hip4DocLead>
        <Hip4SubsectionTitle>Observed book mirror</Hip4SubsectionTitle>
        <Hip4CodeBlock>{PAIR_EXAMPLE}</Hip4CodeBlock>
        <p className="mt-4 text-xs text-text-muted">
          Minimum notional (community formula):{" "}
          <code className="font-mono text-brand-accent">size × min(markPx, 1 − markPx) ≥ $10</code>{" "}
          USDH — feeds in{" "}
          <Link href="/hip4/info-api" className="text-brand-accent hover:underline">
            Info endpoint
          </Link>
          .
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>L1 operator cluster</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          We traced <strong className="text-text-primary">eight linked system addresses</strong> on HyperCore
          testnet that appear to operate the prediction-market admin surface together.{" "}
          <strong className="text-text-primary">Two roles</strong> are mapped from on-chain activity; the other
          six remain <Hip4GoldHighlight>unmapped</Hip4GoldHighlight> (validators, bridge, fee routing,
          or other Core roles — hypotheses only).
        </Hip4DocLead>
        <Hip4SubsectionTitle>0xc25c… — HIP-4 operator</Hip4SubsectionTitle>
        <p className="mb-3 text-xs text-text-secondary">
          Observed actions (explorer labels — JSON payloads in docs often use lowercase variants such as{" "}
          <code className="font-mono text-[11px] text-brand-accent">registerTokensAndStandaloneOutcome</code>{" "}
          and <code className="font-mono text-[11px] text-brand-accent">VoteGlobalAction</code>):
        </p>
        <ul className="mb-4 list-disc space-y-1.5 pl-4 text-xs text-text-secondary marker:text-brand-gold/70">
          <li>Create markets — RegisterTokensAndStandaloneOutcome, RegisterOutcome</li>
          <li>Settle markets — SettleOutcome (settlement in API research as VoteGlobalAction)</li>
          <li>Create questions — RegisterQuestion</li>
          <li>Change copy — ChangeOutcomeDescription, ChangeQuestionDescription</li>
          <li>Register named outcomes and related tokens</li>
        </ul>
        <Hip4SubsectionTitle>0xe92d… — Oracle</Hip4SubsectionTitle>
        <p className="mb-3 text-xs text-text-secondary">
          Holds oracle / on-chain price-feed duties. A historical settlement from this wallet was
          observed (same tx often cited for VoteGlobalAction discovery); more recent settlement traffic
          has been attributed to <code className="font-mono text-[11px] text-brand-accent">0xc25c…</code>{" "}
          in our trace — roles may shift on testnet.
        </p>
        <Hip4SubsectionTitle>Separation from HyperEVM parimutuel</Hip4SubsectionTitle>
        <p className="mb-3 text-xs text-text-secondary">
          None of the eight L1 cluster addresses overlap the third-party parimutuel deployer{" "}
          <code className="font-mono text-[11px] text-text-muted">{HIP4_EVM_PARIMUTUEL_DEPLOYER}</code>.
          Official HIP-4 CLOB flow and the EVM contest contracts are operated or owned by distinct
          entities on testnet.
        </p>
        <p className="text-xs text-text-muted">
          Full table + proof link:{" "}
          <Link href="/hip4/reference#system-wallets" className="text-brand-accent hover:underline">
            API & data — system wallets
          </Link>
          . On mainnet, duties would likely be distributed across validators — not guaranteed here.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Open questions</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Research gaps — not failures of the doc, just unknowns as of the last research pass.
        </Hip4DocLead>
        <ul className="list-disc space-y-2 pl-4 text-xs text-text-secondary marker:text-brand-gold/70">
          <li>Collateral redistribution across multiple outcomes at settlement</li>
          <li>Whether HyperEVM parimutuel deployer is team-adjacent or third-party (funding trace)</li>
          <li>Mainnet: validator settlement, permissionless creation</li>
          <li>HIP-3-style feeds for subjective resolution (food, races)</li>
        </ul>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
