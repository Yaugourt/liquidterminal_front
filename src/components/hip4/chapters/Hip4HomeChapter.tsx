import {
  Hip4ChapterShell,
  Hip4DocLead,
  Hip4DocList,
  Hip4GlassPanel,
  Hip4SectionTitle,
  Hip4SubsectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import {
  Hip4PageHeader,
  Hip4SectionCardLink,
} from "@/components/hip4/Hip4PageHeader";
import { Hip4Callout } from "@/components/hip4/Hip4Callout";
import Link from "next/link";

export function Hip4HomeChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader variant="hub" />

      <div className="flex flex-col gap-3">
        <Hip4Callout variant="danger" title="Unofficial documentation">
          <p>
            Hyperliquid has published no HIP-4 spec; this site is reverse-engineered from bytecode,
            txs, and HyperCore API — not official content.
          </p>
        </Hip4Callout>
        <Hip4Callout variant="emphasis" title="Testnet & two tracks">
          <ul className="list-none space-y-2 pl-0">
            <li className="flex gap-2">
              <span className="text-brand-gold" aria-hidden>
                ·
              </span>
              <span>
                <strong className="text-white">Testnet only.</strong> Chain <strong>998</strong> for
                HyperEVM examples — mainnet addresses are not validated here.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-gold" aria-hidden>
                ·
              </span>
              <span>
                <strong className="text-white">HyperCore L1</strong> = confirmed prediction flow.{" "}
                <strong className="text-white">HyperEVM</strong> (V1/V2) = separate third-party
                parimutuel docs — see sidebar labels.
              </span>
            </li>
          </ul>
        </Hip4Callout>
      </div>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Research & HyperCore</Hip4SectionTitle>
        <Hip4DocLead className="mb-3">
          Narrative, native lifecycle, API shapes, and market context — start with any item below.
        </Hip4DocLead>
        <Hip4SubsectionTitle>What to open first</Hip4SubsectionTitle>
        <Hip4DocList className="mb-4">
          <li>
            <strong className="text-white">Timeline</strong> — how the research unfolded (X
            archive).
          </li>
          <li>
            <strong className="text-white">HyperCore (L1)</strong> — architecture, lifecycle, pair
            minting.
          </li>
          <li>
            <strong className="text-white">Trading fees (L1)</strong> — spot-like fees,{" "}
            <code className="font-mono text-[11px]">SetOutcomeFeeScale</code>, fill normalization.
          </li>
          <li>
            <strong className="text-brand-gold">Info endpoint</strong> — full{" "}
            <code className="font-mono text-[11px]">POST /info</code> + WS blocks (GitBook-style).
          </li>
          <li>
            <strong className="text-white">API & data</strong> — one-page tables (URLs, wallets,
            S3).
          </li>
          <li>
            <strong className="text-white">Industry compare</strong> — HIP-4 vs Polymarket vs
            Kalshi.
          </li>
        </Hip4DocList>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Hip4SectionCardLink
            href="/hip4/research"
            title="Timeline"
            description="3-day sprint + X archive (10 posts)"
          />
          <Hip4SectionCardLink
            href="/hip4/core"
            title="HyperCore (L1)"
            description="Architecture, lifecycle, pair minting, open questions"
          />
          <Hip4SectionCardLink
            href="/hip4/fees"
            title="Trading fees (L1)"
            description="Spot-like testnet evidence, userFees, feeToken normalization"
          />
          <Hip4SectionCardLink
            href="/hip4/info-api"
            title="Info endpoint"
            description="POST /info + WS — same layout as official Spot docs"
          />
          <Hip4SectionCardLink
            href="/hip4/reference"
            title="API & data (overview)"
            description="URLs, channels, L1 actions, wallets, S3 — quick tables"
          />
          <Hip4SectionCardLink
            href="/hip4/compare"
            title="Industry compare"
            description="HIP-4 vs Polymarket vs Kalshi"
          />
        </div>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>L1 ↔ HyperEVM</Hip4SectionTitle>
        <Hip4DocLead className="mb-4 text-xs">
          How HyperCore and the embedded EVM relate:{" "}
          <code className="font-mono text-[11px] text-brand-accent">EvmRawTx</code>, bridge
          mechanics, precompiles.
        </Hip4DocLead>
        <Hip4SectionCardLink
          href="/hip4/bridge"
          title="Bridge L1↔EVM"
          description="Architecture, CoreWriter, precompiles, asset indices"
        />
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Third-party EVM (unconfirmed)</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          <strong className="text-white">V1</strong> from bytecode · <strong className="text-white">V2</strong>{" "}
          aligned with Solidity in repo. Not the official L1 settlement path.
        </Hip4DocLead>
        <Hip4SubsectionTitle>Contract & mechanics</Hip4SubsectionTitle>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Hip4SectionCardLink
            href="/hip4/overview"
            title="EVM overview"
            description="Addresses, owner, fees, access control"
          />
          <Hip4SectionCardLink
            href="/hip4/abi"
            title="Full ABI"
            description="V1 vs V2 table, tabs, JSON"
          />
          <Hip4SectionCardLink
            href="/hip4/events"
            title="Events"
            description="topic0, DepositReceived vs Deposit"
          />
          <Hip4SectionCardLink
            href="/hip4/reverts"
            title="Revert strings"
            description="Messages from bytecode / source"
          />
          <Hip4SectionCardLink
            href="/hip4/markets"
            title="Active markets"
            description="HyperCore samples + on-chain EVM scan"
          />
          <Hip4SectionCardLink
            href="/hip4/mechanics"
            title="Mechanics"
            description="Contest lifecycle, deposit flow"
          />
          <Hip4SectionCardLink
            href="/hip4/txexamples"
            title="Real txs"
            description="Decoded calldata examples"
          />
          <Hip4SectionCardLink
            href="/hip4/storage"
            title="Storage"
            description="Slots and struct layout"
          />
          <Hip4SectionCardLink
            href="/hip4/docs"
            title="Docs & code"
            description="JS/Python examples, file paths"
          />
        </div>
      </Hip4GlassPanel>

      <p className="text-center text-[11px] text-text-muted">
        Full narrative:{" "}
        <Link
          href="/hip4/HIP4-research-complete.md"
          className="text-brand-accent underline hover:text-brand-gold"
          target="_blank"
          rel="noopener noreferrer"
        >
          HIP4-research-complete.md
        </Link>
      </p>
    </Hip4ChapterShell>
  );
}
