import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";

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
        subtitle="Official HIP-4 flow is native to HyperCore: creation, CLOB trading, and VoteGlobalAction settlement — no EVM in the documented path."
      />

      <Hip4GlassPanel>
        <Hip4SectionTitle>Architecture (conceptual)</Hip4SectionTitle>
        <Hip4CodeBlock>{ARCH_ASCII}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Lifecycle</Hip4SectionTitle>
        <Hip4CodeBlock>{LIFECYCLE_ASCII}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Pair minting</Hip4SectionTitle>
        <p className="mb-3 text-xs text-text-secondary leading-relaxed">
          A BUY on YES is mirrored on the NO book so YES + NO always prices to 1.00. Collateral
          locks on both sides until settlement.
        </p>
        <Hip4SectionTitle className="!mb-2 !text-[10px]">Observed book mirror</Hip4SectionTitle>
        <Hip4CodeBlock>{PAIR_EXAMPLE}</Hip4CodeBlock>
        <p className="mt-3 text-xs text-text-muted">
          Minimum notional (community formula):{" "}
          <code className="font-mono text-brand-accent">size × min(markPx, 1 − markPx) ≥ $10</code>{" "}
          USDH — see API &amp; data for feeds.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Open questions</Hip4SectionTitle>
        <ul className="list-disc space-y-2 pl-4 text-xs text-text-secondary">
          <li>Collateral redistribution across multiple outcomes at settlement</li>
          <li>Whether HyperEVM parimutuel deployer is team-adjacent or third-party (funding trace)</li>
          <li>Mainnet: validator settlement, permissionless creation</li>
          <li>HIP-3-style feeds for subjective resolution (food, races)</li>
        </ul>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
