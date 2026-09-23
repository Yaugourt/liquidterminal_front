"use client";

import { useMemo, useState } from "react";
import { useValidatorVotes } from "@/services/explorer/validator";
import type { ValidatorVote } from "@/services/explorer/validator/types/votes";
import { KpiRibbon, type KpiCell, TypedDataTable, FlowBar, CellValue } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDateFormat } from "@/store/date-format.store";
import { formatDate } from "@/lib/formatters/dateFormatting";

type WeightMode = "all" | "community";

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
  const { format: dateFormat } = useDateFormat();

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
        subtitle="L1 actions awaiting validator ratification"
        headerAction={
          <PillTabs
            variant="text"
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
            type: "rank",
            width: 44,
            accessor: (v: ValidatorVote) => v.id,
          },
          {
            key: "action",
            header: "Action",
            // Badge + wrapping summary: no single primitive covers it yet.
            accessor: (v: ValidatorVote) => (
              <div className="min-w-0 max-w-[340px] space-y-1">
                <StatusBadge variant="info">{v.actionType}</StatusBadge>
                <div className="text-text-secondary">{v.summary ?? "No summary served"}</div>
              </div>
            ),
          },
          {
            key: "expires",
            header: "Expires",
            type: "time",
            align: "right",
            accessor: (v: ValidatorVote) => formatDate(v.expireTime, dateFormat),
          },
          {
            key: "participation",
            header: "Participation",
            align: "right",
            accessor: (v: ValidatorVote) => (
              <CellValue
                value={`${v.participationPct.toFixed(0)}%`}
                sub={`${v.voterCount}/${v.totalValidators}`}
              />
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
                  <CellValue value={`${wt.toFixed(1)}%`} />
                </div>
              );
            },
          },
          {
            key: "quorum",
            header: "Quorum",
            align: "center",
            accessor: (v: ValidatorVote) => (
              <StatusBadge variant={v.quorumReached ? "success" : "warning"}>
                {v.quorumReached ? "Reached" : "Pending"}
              </StatusBadge>
            ),
          },
          {
            key: "foundation",
            header: "Foundation",
            align: "center",
            accessor: (v: ValidatorVote) => (
              <StatusBadge variant="gold">{v.foundationVoterCount}/5</StatusBadge>
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
