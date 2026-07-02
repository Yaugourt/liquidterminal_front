"use client";

import { useMemo, useState } from "react";
import { useValidatorVotes } from "@/services/explorer/validator";
import type { ValidatorVote } from "@/services/explorer/validator/types/votes";
import { KpiRibbon, type KpiCell, TypedDataTable, FlowBar } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StatusBadge } from "@/components/ui/status-badge";

type WeightMode = "all" | "community";

/** Short month/day from an epoch-ms expiry. */
function formatExpiry(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Governance lens body — pending L1 votes (validatorL1Votes joined to validators
 * on the server). Shows participation, quorum and stake weight with an
 * ex-Foundation toggle (the Foundation flag + community weight are stamped
 * server-side, so the toggle just swaps two served fields). Standalone: the
 * proposals table runs in card mode (its own header + toggle action).
 */
export function ValidatorVotesSection() {
  const { votes, stats, isLoading, error, refetch } = useValidatorVotes();
  const [weightMode, setWeightMode] = useState<WeightMode>("all");

  const kpis: KpiCell[] = useMemo(() => {
    const pending = votes.length;
    const avgPart = pending ? votes.reduce((s, v) => s + v.participationPct, 0) / pending : 0;
    const quorum = votes.filter((v) => v.quorumReached).length;
    const fndVotes = votes.reduce((s, v) => s + v.foundationVoterCount, 0);
    return [
      { label: "Pending", value: `${pending}`, sub: "proposals" },
      { label: "Avg Participation", value: `${avgPart.toFixed(0)}%`, sub: `of ${stats.totalValidators} validators` },
      {
        label: "Quorum Reached",
        value: `${quorum} / ${pending}`,
        tone: pending > 0 && quorum === pending ? "success" : "default",
        sub: "pending",
      },
      { label: "Foundation Votes", value: `${fndVotes}`, tone: "gold", sub: "across all proposals" },
      { label: "Eligible", value: `${stats.totalValidators}`, sub: "validators" },
    ];
  }, [votes, stats]);

  return (
    <div className="space-y-4">
      <KpiRibbon cells={kpis} variant="plain" />

      <TypedDataTable
        title="Pending L1 Votes"
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3 8-8" />
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
          </svg>
        }
        subtitle="L1 actions awaiting validator ratification"
        headerAction={
          <PillTabs
            variant="pill"
            tabs={[
              { value: "all", label: "Stake weight" },
              { value: "community", label: "Ex-Foundation" },
            ]}
            activeTab={weightMode}
            onTabChange={(v) => setWeightMode(v as WeightMode)}
          />
        }
        data={votes}
        getRowKey={(v) => v.id}
        isLoading={isLoading}
        error={error}
        onErrorRetry={refetch}
        density="comfortable"
        paginationVariant="none"
        emptyMessage="No pending votes"
        emptyDescription="No L1 actions are awaiting validator ratification right now."
        columns={[
          {
            key: "id",
            header: "#",
            width: 44,
            accessor: (v: ValidatorVote) => <span className="mono text-text-tertiary">{v.id}</span>,
          },
          {
            key: "action",
            header: "Action",
            accessor: (v: ValidatorVote) => (
              <div className="min-w-0">
                <StatusBadge variant="info" className="font-mono text-[10.5px] py-0.5">
                  {v.actionType}
                </StatusBadge>
                {v.summary ? (
                  <div className="text-[11.5px] text-text-secondary mt-1 max-w-[340px]">{v.summary}</div>
                ) : (
                  <div className="text-[11px] text-text-tertiary mt-1 italic">no summary served</div>
                )}
              </div>
            ),
          },
          {
            key: "expires",
            header: "Expires",
            align: "right",
            accessor: (v: ValidatorVote) => (
              <span className="mono text-text-secondary whitespace-nowrap">{formatExpiry(v.expireTime)}</span>
            ),
          },
          {
            key: "participation",
            header: "Participation",
            align: "right",
            accessor: (v: ValidatorVote) => (
              <div className="text-right">
                <span className="mono text-text-primary">{v.participationPct.toFixed(0)}%</span>
                <div className="mono text-[10px] text-text-tertiary">
                  {v.voterCount}/{v.totalValidators}
                </div>
              </div>
            ),
          },
          {
            key: "weight",
            header: "Stake weight",
            width: 190,
            accessor: (v: ValidatorVote) => {
              const wt = weightMode === "all" ? v.stakeWeightPct : v.stakeWeightExFoundationPct;
              return (
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-[70px]">
                    <FlowBar ratio={wt / 100} height={14} />
                  </div>
                  <span className="mono text-xs w-12 text-right text-text-primary">{wt.toFixed(1)}%</span>
                </div>
              );
            },
          },
          {
            key: "quorum",
            header: "Quorum",
            align: "center",
            accessor: (v: ValidatorVote) => (
              <StatusBadge variant={v.quorumReached ? "success" : "warning"} className="text-[10.5px] py-0.5">
                {v.quorumReached ? "Reached" : "Pending"}
              </StatusBadge>
            ),
          },
          {
            key: "foundation",
            header: "Foundation",
            align: "center",
            accessor: (v: ValidatorVote) => (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-mono font-medium bg-gold/10 text-gold ring-1 ring-inset ring-gold/25">
                {v.foundationVoterCount}/5
              </span>
            ),
          },
        ]}
      />

      <p className="text-[11px] text-text-tertiary">
        Snapshot of pending votes only — no historical record is served upstream.
      </p>
    </div>
  );
}
