import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import {
  Hip4PageHeader,
  Hip4SectionCardLink,
} from "@/components/hip4/Hip4PageHeader";
import Link from "next/link";

export function Hip4HomeChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader variant="hub" />

      <div className="flex flex-col gap-3">
        <div className="flex gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-200">
          <span className="shrink-0 text-base" aria-hidden>
            ⚠
          </span>
          <div>
            <strong className="text-white">Unofficial documentation.</strong> Hyperliquid has
            published no HIP-4 spec; this site is reverse-engineered from bytecode, txs, and
            HyperCore API — not official content.
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-4 text-xs text-brand-gold">
          <span className="shrink-0 text-base" aria-hidden>
            ⚙
          </span>
          <div>
            <strong className="text-white">Testnet only.</strong> Chain <strong>998</strong> for
            HyperEVM examples — same addresses on mainnet are not validated here.
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-brand-accent/15 bg-brand-accent/5 p-4 text-xs text-text-secondary">
          <span className="shrink-0 text-base" aria-hidden>
            🔍
          </span>
          <div>
            <strong className="text-white">Two tracks.</strong>{" "}
            <strong className="text-white">HyperCore L1</strong> is the confirmed prediction flow.
            <strong className="text-white"> HyperEVM contracts</strong> (V1/V2) are documented as a
            separate, third-party parimutuel experiment — see nav group labels.
          </div>
        </div>
      </div>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Research & HyperCore</Hip4SectionTitle>
        <p className="mb-4 text-sm text-text-secondary leading-relaxed">
          Start here for the <strong className="text-white">public timeline</strong>,{" "}
          <strong className="text-white">native L1 lifecycle</strong>,{" "}
          <strong className="text-white">API / WS / S3 recap</strong>, and the{" "}
          <strong className="text-white">industry comparison</strong> table.
        </p>
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
            href="/hip4/reference"
            title="API & data"
            description="outcomeMeta, candleSnapshot, WS, L1 actions, S3"
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
        <p className="mb-4 text-xs text-text-secondary">
          How Core and the embedded EVM relate — including EvmRawTx and bridge mechanics.
        </p>
        <Hip4SectionCardLink
          href="/hip4/bridge"
          title="Bridge L1↔EVM"
          description="Architecture, CoreWriter, precompiles, asset indices"
        />
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Third-party EVM (unconfirmed)</Hip4SectionTitle>
        <p className="mb-4 text-sm text-text-secondary leading-relaxed">
          Reverse-engineered <strong className="text-white">V1</strong> (bytecode) and{" "}
          <strong className="text-white">V2</strong> (source-aligned ABI in repo). Treat as
          independent parimutuel contracts — not the official HIP-4 settlement path.
        </p>
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
          className="text-brand-accent underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          HIP4-research-complete.md
        </Link>
      </p>
    </Hip4ChapterShell>
  );
}
