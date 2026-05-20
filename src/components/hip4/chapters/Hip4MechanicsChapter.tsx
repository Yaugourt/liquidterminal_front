import type { ReactNode } from "react";
import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";

function FlowStep({ n, children, warn }: { n: string | number; children: ReactNode; warn?: boolean }) {
  return (
    <li className="flex gap-3">
      <div
        className={
          warn
            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-300"
            : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand"
        }
      >
        {n}
      </div>
      <div className="text-sm text-text-secondary leading-relaxed [&_code]:text-xs">{children}</div>
    </li>
  );
}

export function Hip4MechanicsChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle>Contest lifecycle — V1</Hip4SectionTitle>
        <ul className="space-y-4">
          <FlowStep n={1}>
            <strong className="text-text-primary">OWNER</strong>{" "}
            <code className="text-gold">createContest(contestId, entryFee)</code>
          </FlowStep>
          <FlowStep n={2}>
            Users <code className="text-brand">deposit(contestId, sideId)</code> payable — one
            deposit per address per side.
          </FlowStep>
          <FlowStep n={3}>Deadline enforced on-chain.</FlowStep>
          <FlowStep n={4}>
            <strong className="text-text-primary">OWNER</strong>{" "}
            <code className="text-gold">publishMerkleRoot</code> after finalize flow.
          </FlowStep>
          <FlowStep n={5}>
            Winners <code className="text-brand">claim</code> with Merkle proof.
          </FlowStep>
          <FlowStep n="!" warn>
            Refund: <code className="text-gold">refund(contestId, sideId, user)</code>
          </FlowStep>
        </ul>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Contest lifecycle — V2</Hip4SectionTitle>
        <ul className="space-y-4">
          <FlowStep n={1}>
            <code className="text-gold">finalizeContest</code>,{" "}
            <code className="text-gold">publishMerkleRoot</code>,{" "}
            <code>Pausable</code>, <code>Ownable2Step</code>.
          </FlowStep>
          <FlowStep n={2}>
            <code className="text-brand">deposit(contestId, sideId, deadline)</code> payable.
          </FlowStep>
          <FlowStep n={3}>
            Leaves: <code>keccak256(abi.encodePacked(index, recipient, amount))</code>; bitmap by{" "}
            <code>index</code>.
          </FlowStep>
          <FlowStep n={4}>
            <code className="text-brand">claim(contestId, index, recipient, amount, proof[])</code>
          </FlowStep>
          <FlowStep n={5}>
            Fee via <code className="text-gold">withdrawPlatformFee</code> + accounting fields.
          </FlowStep>
        </ul>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Market types (HyperCore)</Hip4SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-brand/20 bg-brand/5 p-3 text-xs text-text-secondary">
            <div className="mb-1 text-[10px] font-bold uppercase text-brand">Custom</div>
            Open questions, N outcomes.
          </div>
          <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-xs text-text-secondary">
            <div className="mb-1 text-[10px] font-bold uppercase text-gold">priceBinary</div>
            Yes/No threshold markets.
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-text-secondary">
            <div className="mb-1 text-[10px] font-bold uppercase text-emerald-400">Recurring</div>
            15m / 1h / 1d periods.
          </div>
        </div>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
