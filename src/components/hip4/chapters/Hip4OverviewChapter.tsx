import type { PropsWithChildren } from "react";
import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";
import { HIP4_CONFIG } from "@/lib/hip4/config";
import { Badge } from "@/components/ui/badge";

function InfoRow({ k, children }: PropsWithChildren<{ k: string }>) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border-subtle py-2.5 sm:grid-cols-[160px_1fr] sm:gap-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
        {k}
      </div>
      <div className="text-sm text-white">{children}</div>
    </div>
  );
}

const V1_OWNER_FUNCS = [
  ["0x6dab6b23", "createContest(uint256,uint256)"],
  ["0xf295f6e4", "publishMerkleRoot(uint256,bytes32,uint256)"],
  ["0x3a8ef03b", "finalizeContest(uint256)"],
  ["0xa3d07f67", "refund(uint256,uint256,address)"],
  ["0xe50e64d5", "sweepUnclaimed(uint256)"],
  ["0xb2447e34", "withdrawPlatformFee(uint256,uint256) — V2"],
  ["0xf2fde38b", "transferOwnership(address)"],
];

const V1_PUBLIC = [
  ["0x00aeef8a", "deposit(uint256,uint256) payable"],
  ["0x2a658bdf", "getContestPool(uint256) view"],
  ["0x71c5ecb1", "merkleRoots(uint256) view → bytes32"],
  ["0x91d3b00c", "platformFeeBps() → 90"],
  ["0x8da5cb5b", "owner() → address"],
];

export function Hip4OverviewChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle>V1 — Contract information</Hip4SectionTitle>
        <InfoRow k="Address">
          <span className="font-mono text-brand-accent">{HIP4_CONFIG.contracts.v1.address}</span>
        </InfoRow>
        <InfoRow k="Network">
          HyperEVM Testnet <Badge variant="outline" className="ml-1 text-[10px]">Chain 998</Badge>
        </InfoRow>
        <InfoRow k="Owner">
          <span className="font-mono text-brand-gold">{HIP4_CONFIG.sameOwner}</span>
        </InfoRow>
        <InfoRow k="Platform fee">
          <span className="font-bold text-brand-gold">90 bps (0.9%)</span> — from reward pool
        </InfoRow>
        <InfoRow k="Renounce">
          <Badge variant="destructive" className="text-[10px]">ALWAYS REVERT</Badge> “Renounce disabled”
        </InfoRow>
        <InfoRow k="Source">Unavailable — V1 from bytecode only</InfoRow>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>V2 — Contract information</Hip4SectionTitle>
        <InfoRow k="Address">
          <span className="font-mono text-brand-accent">{HIP4_CONFIG.contracts.v2.address}</span>
        </InfoRow>
        <InfoRow k="Network">
          HyperEVM Testnet <Badge variant="outline" className="ml-1 text-[10px]">Chain 998</Badge>
        </InfoRow>
        <InfoRow k="Owner">
          <span className="font-mono text-brand-gold">{HIP4_CONFIG.sameOwner}</span>
          <span className="mt-1 block text-[11px] text-text-secondary">Same owner as V1</span>
        </InfoRow>
        <InfoRow k="Reference">
          <code className="text-xs">/public/hip4/HIP4Contest.sol</code>, selectors matched to bytecode
        </InfoRow>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>V1 — Access surface (bytecode)</Hip4SectionTitle>
        <div className="access-grid grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-bold text-brand-gold">Owner-only</div>
            <ul className="space-y-2 text-xs">
              {V1_OWNER_FUNCS.map(([sel, sig]) => (
                <li key={sel} className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-brand-tertiary/40 px-1.5 py-0.5 font-mono text-[10px]">
                    {sel}
                  </code>
                  <span className="font-mono text-text-secondary">{sig}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold text-emerald-400/90">Public</div>
            <ul className="space-y-2 text-xs">
              {V1_PUBLIC.map(([sel, sig]) => (
                <li key={sel} className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-brand-tertiary/40 px-1.5 py-0.5 font-mono text-[10px]">
                    {sel}
                  </code>
                  <span className="font-mono text-text-secondary">{sig}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 rounded-lg border border-border-subtle bg-white/[0.02] p-3 text-[11px] text-text-secondary">
          <strong className="text-text-secondary">Bytecode evidence:</strong> CALLER checks against slot 0
          (owner) on protected paths.
        </p>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
