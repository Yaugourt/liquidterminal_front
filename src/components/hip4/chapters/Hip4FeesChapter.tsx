import Link from "next/link";
import {
  Hip4ChapterShell,
  Hip4DocLead,
  Hip4GlassPanel,
  Hip4SectionTitle,
  Hip4SubsectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Hip4Callout } from "@/components/hip4/Hip4Callout";
import { Hip4GoldHighlight } from "@/components/hip4/Hip4GoldHighlight";
import {
  HIP4_FEES_BINARY_LIMITS_TEXT,
  HIP4_FEES_CURL_USER_FEES_BASE,
  HIP4_FEES_CURL_USER_FILLS,
  HIP4_FEES_DEPLOYER_SHARE_SAMPLES,
  HIP4_FEES_HL_NODE_STRINGS,
  HIP4_FEES_JSON_SAMPLE_FILL,
  HIP4_FEES_JSON_USER_FEES_BASE,
  HIP4_FEES_JSON_USER_FEES_TRADER,
  HIP4_FEES_NORMALIZATION_TEXT,
  HIP4_FEES_OUTCOME_DEPLOY_STRINGS,
  HIP4_FEES_OUTCOME_STATE_STRINGS,
  HIP4_FEES_RATE_MATCH_TEXT,
  HIP4_FEES_SPOT_META_SAMPLE,
} from "@/lib/hip4/fees-research-data";

export function Hip4FeesChapter() {
  return (
    <Hip4ChapterShell id="hip4-fees-top">
      <Hip4ChapterHubHeader
        title="Trading fees (L1)"
        subtitle={
          <>
            <p>
              Evidence from <code className="font-mono text-[11px] text-brand-accent">hl-node</code>{" "}
              strings, <Hip4GoldHighlight>spotMetaAndAssetCtxs</Hip4GoldHighlight>,{" "}
              <Hip4GoldHighlight>userFees</Hip4GoldHighlight>, and a real outcome fill on testnet:
              outcome CLOB fees behave like <strong className="text-text-primary">ordinary spot</strong>{" "}
              fees today, while a native governance hook (
              <code className="font-mono text-[11px] text-brand-accent">
                VoteGlobalAction::SetOutcomeFeeScale
              </code>
              ) exists for future global rescaling.
            </p>
            <p>
              This page is <strong className="text-text-primary">HyperCore L1</strong> only. Third-party
              HyperEVM parimutuel contracts document a separate{" "}
              <strong className="text-text-primary">platform fee</strong> (e.g. 90 bps) — see{" "}
              <Link href="/hip4/overview" className="text-brand-accent hover:underline">
                EVM overview
              </Link>
              .
            </p>
            <p>
              Full markdown:{" "}
              <Link
                href="/hip4/HIP4-fees.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-gold underline decoration-brand-gold/40 underline-offset-2 hover:decoration-brand-gold"
              >
                HIP4-fees.md
              </Link>
              . Structured <code className="font-mono text-[11px]">POST /info</code> entries:{" "}
              <Link href="/hip4/info-api" className="text-brand-accent hover:underline">
                Info endpoint
              </Link>
              .
            </p>
          </>
        }
      />

      <Hip4GlassPanel id="fees-claim-1">
        <Hip4SectionTitle>Claim 1 — Native fee governance hook</Hip4SectionTitle>
        <Hip4SubsectionTitle>Proof (hl-node strings)</Hip4SubsectionTitle>
        <Hip4CodeBlock>{HIP4_FEES_HL_NODE_STRINGS}</Hip4CodeBlock>
        <Hip4SubsectionTitle>What this proves</Hip4SubsectionTitle>
        <ul className="list-disc space-y-1 pl-4 text-xs text-text-secondary marker:text-brand-gold/70">
          <li>HyperCore exposes <Hip4GoldHighlight>SetOutcomeFeeScale</Hip4GoldHighlight> as a real variant.</li>
          <li>The action has one field; binary text references a cooldown between changes.</li>
        </ul>
        <Hip4SubsectionTitle>What this does not prove</Hip4SubsectionTitle>
        <p className="text-xs text-text-muted">
          Exact post-change formula, live stored scale on testnet, or whether state lives in{" "}
          <code className="font-mono text-[11px]">OutcomeTracker</code> vs elsewhere.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel id="fees-claim-2">
        <Hip4SectionTitle>Claim 2 — Outcome assets on spot rails</Hip4SectionTitle>
        <Hip4SubsectionTitle>Proof (binary + public metadata)</Hip4SubsectionTitle>
        <p className="mb-2 text-xs text-text-secondary">Deploy / user-outcome actions:</p>
        <Hip4CodeBlock className="mb-4">{HIP4_FEES_OUTCOME_DEPLOY_STRINGS}</Hip4CodeBlock>
        <p className="mb-2 text-xs text-text-secondary">Core state structs:</p>
        <Hip4CodeBlock className="mb-4">{HIP4_FEES_OUTCOME_STATE_STRINGS}</Hip4CodeBlock>
        <p className="mb-2 text-xs text-text-secondary">
          Example <Hip4GoldHighlight>@</Hip4GoldHighlight> pairs from{" "}
          <code className="font-mono text-[11px]">spotMetaAndAssetCtxs</code>:
        </p>
        <Hip4CodeBlock>{HIP4_FEES_SPOT_META_SAMPLE}</Hip4CodeBlock>
        <p className="mt-3 text-xs text-text-muted">
          Compare fee behavior to spot first — not a separate prediction-only fee engine.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel id="fees-claim-3">
        <Hip4SectionTitle>Claim 3 — No extra deployer trading fee share (observed)</Hip4SectionTitle>
        <Hip4DocLead className="mb-2 text-xs">
          Live Hypurr outcome base tokens report{" "}
          <code className="font-mono text-[11px]">deployerTradingFeeShare: &quot;0.0&quot;</code>.
        </Hip4DocLead>
        <Hip4CodeBlock>{HIP4_FEES_DEPLOYER_SHARE_SAMPLES}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel id="fees-claim-4">
        <Hip4SectionTitle>Claim 4 — Base spot schedule on testnet</Hip4SectionTitle>
        <Hip4DocLead className="mb-2 text-xs">
          <code className="font-mono text-[11px]">userFees</code> with a sentinel user returns the
          default schedule: spot taker <Hip4GoldHighlight>7 bps</Hip4GoldHighlight>, maker{" "}
          <Hip4GoldHighlight>4 bps</Hip4GoldHighlight>.
        </Hip4DocLead>
        <Hip4SubsectionTitle>Example request</Hip4SubsectionTitle>
        <Hip4CodeBlock className="mb-3">{HIP4_FEES_CURL_USER_FEES_BASE}</Hip4CodeBlock>
        <Hip4SubsectionTitle>Observed response (excerpt)</Hip4SubsectionTitle>
        <Hip4CodeBlock>{HIP4_FEES_JSON_USER_FEES_BASE}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel id="fees-claim-5">
        <Hip4SectionTitle>Claim 5 — Real fill matches spot fee math</Hip4SectionTitle>
        <Hip4DocLead className="mb-2 text-xs">
          Taker fill on <code className="font-mono text-[11px]">@10</code>: fee is denominated in the{" "}
          <strong className="text-text-primary">base outcome token</strong> (
          <code className="font-mono text-[11px]">feeToken</code>), not USDC — normalize before
          comparing to notional.
        </Hip4DocLead>
        <Hip4SubsectionTitle>userFillsByTime</Hip4SubsectionTitle>
        <Hip4CodeBlock className="mb-3">{HIP4_FEES_CURL_USER_FILLS}</Hip4CodeBlock>
        <Hip4SubsectionTitle>Representative fill</Hip4SubsectionTitle>
        <Hip4CodeBlock className="mb-3">{HIP4_FEES_JSON_SAMPLE_FILL}</Hip4CodeBlock>
        <Hip4SubsectionTitle>Normalization</Hip4SubsectionTitle>
        <Hip4CodeBlock className="mb-3">{HIP4_FEES_NORMALIZATION_TEXT}</Hip4CodeBlock>
        <Hip4SubsectionTitle>Same user — userFees</Hip4SubsectionTitle>
        <Hip4CodeBlock className="mb-3">{HIP4_FEES_JSON_USER_FEES_TRADER}</Hip4CodeBlock>
        <Hip4SubsectionTitle>Match</Hip4SubsectionTitle>
        <Hip4CodeBlock>{HIP4_FEES_RATE_MATCH_TEXT}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel id="fees-claim-6">
        <Hip4SectionTitle>Claim 6 — Active scale not named in stripped binary</Hip4SectionTitle>
        <Hip4DocLead className="mb-2 text-xs">
          HIP-3 exposes obvious <code className="font-mono text-[11px]">deployer_fee_scale</code>{" "}
          style names; no parallel <code className="font-mono text-[11px]">outcome_fee_scale</code>{" "}
          string was found in the same pass.
        </Hip4DocLead>
        <Hip4CodeBlock>{HIP4_FEES_BINARY_LIMITS_TEXT}</Hip4CodeBlock>
        <p className="mt-3 text-xs text-text-muted">
          Safest statement: behavioral neutrality on testnet, not &quot;scale = X from strings&quot;.
        </p>
      </Hip4GlassPanel>

      <Hip4Callout variant="emphasis" title="Conclusion (testnet evidence)">
        <ol className="list-decimal space-y-2 pl-4 marker:text-brand-gold">
          <li>
            <code className="font-mono text-[11px]">hl-node</code> proves{" "}
            <Hip4GoldHighlight>SetOutcomeFeeScale</Hip4GoldHighlight> exists.
          </li>
          <li>Outcomes trade on spot-style books; metadata aligns.</li>
          <li>
            Observed tokens show <code className="font-mono text-[11px]">deployerTradingFeeShare = 0</code>.
          </li>
          <li>
            Normalized fills match <code className="font-mono text-[11px]">userSpotCrossRate</code>.
          </li>
        </ol>
        <p className="mt-3 text-text-secondary">
          HIP-4 trading fees on testnet currently behave like normal spot trading fees, while
          HyperCore retains a governance path that could rescale outcome fees globally.
        </p>
      </Hip4Callout>
    </Hip4ChapterShell>
  );
}
