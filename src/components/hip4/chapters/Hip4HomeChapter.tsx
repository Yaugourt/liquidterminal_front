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
      <Hip4PageHeader />

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
            <strong className="text-white">Testnet only.</strong> Chain <strong>998</strong> —
            same addresses on mainnet have no code here.
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-brand-accent/15 bg-brand-accent/5 p-4 text-xs text-zinc-300">
          <span className="shrink-0 text-base" aria-hidden>
            🔍
          </span>
          <div>
            <strong className="text-white">V1 reconstructed · V2 from shipped source.</strong>{" "}
            See{" "}
            <Link href="/hip4/abi" className="text-brand-accent underline">
              Full ABI
            </Link>{" "}
            for V1 vs V2 comparison.
          </div>
        </div>
      </div>

      <Hip4GlassPanel>
        <Hip4SectionTitle>What is this?</Hip4SectionTitle>
        <p className="mb-4 text-sm text-text-secondary leading-relaxed">
          Documentation for <strong className="text-white">HIP-4 on HyperEVM</strong> — contest
          logic in EVM contracts (create, deposit, Merkle settlement, claims). We track{" "}
          <strong className="text-white">V1</strong> (bytecode) and{" "}
          <strong className="text-white">V2</strong> (Solidity + ABI in this repo).
        </p>
        <Hip4SectionTitle className="!mb-2">What each section covers</Hip4SectionTitle>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Hip4SectionCardLink
            href="/hip4/overview"
            title="Overview"
            description="V1 + V2 addresses, owner, fees, access control"
          />
          <Hip4SectionCardLink
            href="/hip4/abi"
            title="Full ABI"
            description="V1 vs V2 table, tabs, JSON"
          />
          <Hip4SectionCardLink
            href="/hip4/events"
            title="Events"
            description="topic0, DepositReceived vs Deposit, FeesWithdrawn"
          />
          <Hip4SectionCardLink
            href="/hip4/reverts"
            title="Revert strings"
            description="Messages from bytecode / source"
          />
          <Hip4SectionCardLink
            href="/hip4/markets"
            title="Active markets"
            description="RPC scan V1 + V2, HyperCore mids"
          />
          <Hip4SectionCardLink
            href="/hip4/mechanics"
            title="Mechanics"
            description="Contest lifecycle, deposit flow"
          />
          <Hip4SectionCardLink
            href="/hip4/bridge"
            title="Bridge L1↔EVM"
            description="Architecture, asset index, precompiles"
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
    </Hip4ChapterShell>
  );
}
