"use client";

/**
 * GovernanceLens — the "Governance" lens of the V4 validator page.
 *
 * Reproduces dash-mockups/validator-v4-C-v2.html: a signal callout, a 5-up
 * plain KPI ribbon, and a single-column stack of pending-proposal cards with
 * an "All validators / Community" toggle that swaps the displayed stake weight.
 *
 * HARD RULES honoured: tokens only (no raw hex in JSX), all bars cyan
 * (chartPalette.accent — gold is reserved for fees), .mono tabular numbers,
 * quorum = success badge, Foundation = neutral tag, loading/error/empty states.
 */

import { useMemo, useState } from "react";
import {
  PageSection,
  KpiRibbon,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  FlowBar,
  chartPalette,
} from "@/components/common";
import type { KpiCell, ModuleColumn } from "@/components/common";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PillTabs } from "@/components/ui/pill-tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { compactHype } from "@/lib/formatters/numberFormatting";
import { useValidatorVotes } from "@/services/explorer/validator/hooks";
import type { ValidatorVote } from "@/services/explorer/validator/types";

/** Number of Foundation validators (fixed set). */
const FOUNDATION_COUNT = 5;

type StakeView = "all" | "community";

/** Humanize a raw action enum; keep the raw value as the title attribute. */
function humanizeAction(action: string): string {
  const map: Record<string, string> = {
    settleOutcome: "Settle outcome",
    registerTokensAndStandaloneOutcome: "Register tokens",
    registerTokensAndQuestion: "Register tokens",
  };
  if (map[action]) return map[action];
  // Fallback: split camelCase and capitalize the first letter.
  return action
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/** Format an epoch-ms expiry into a short "Jun 7" string. */
function formatExpiry(expireTimeMs: number): string {
  return new Date(expireTimeMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const FOOTER_COPY = "Showing pending votes only. Historical votes are not available.";

/** Info icon used by the signal callout. */
function InfoIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

/** Chevron for the expandable voters disclosure. */
function ChevronIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0 transition-transform group-open:rotate-90"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/** Voters disclosure for a single proposal — only rendered when voters exist. */
function VotersDisclosure({ vote }: { vote: ValidatorVote }) {
  const columns: ModuleColumn[] = [
    { header: "Validator", align: "left" },
    { header: "Stake", align: "right" },
    { header: "", align: "right", width: 96 },
  ];

  return (
    <details className="group border-t border-border-subtle">
      <summary className="cursor-pointer list-none flex items-center gap-2 px-4 py-2.5 text-[12px] text-text-tertiary hover:text-text-primary transition-colors">
        <ChevronIcon />
        <span>Voters · {humanizeAction(vote.actionType)}</span>
        <span className="ml-auto mono text-text-tertiary" title="voters / eligible">
          {vote.voterCount}/{vote.totalValidators}
        </span>
      </summary>
      <div className="bg-surface-2 border-t border-border-subtle px-1.5 py-1.5 rounded-b-lg">
        {vote.foundationVoterCount === 0 && (
          <div className="px-2.5 py-2 mb-1 text-[11px] text-text-tertiary">
            Foundation abstained — 0 of {FOUNDATION_COUNT} voted
          </div>
        )}
        <ModuleTable columns={columns} density="compact">
          {vote.voters.map((voter) => (
            <ModuleTableRow
              key={voter.validator}
              cells={[
                <ModuleAsset key="name" tone="neutral" name={voter.name} />,
                <span key="stake" className="mono text-[12px] text-text-secondary">
                  {compactHype(voter.stake)}
                </span>,
                voter.isFoundation ? (
                  <StatusBadge key="fnd" variant="neutral" className="text-[10px] px-1.5 py-0.5">
                    Foundation
                  </StatusBadge>
                ) : (
                  <span key="fnd" />
                ),
              ]}
            />
          ))}
        </ModuleTable>
      </div>
    </details>
  );
}

/** A single pending-proposal card. */
function ProposalCard({ vote, view }: { vote: ValidatorVote; view: StakeView }) {
  const weightPct =
    view === "community" ? vote.stakeWeightExFoundationPct : vote.stakeWeightPct;
  const denomLabel = view === "community" ? "of community stake" : "of total stake";

  return (
    <Card padding="none" interactive={false} className="overflow-hidden">
      {/* card-head: id + humanized action (neutral) + quorum + expires */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
        <span className="mono text-[11px] text-text-tertiary">#{vote.id}</span>
        <StatusBadge
          variant="neutral"
          className="text-[11px] px-2 py-0.5 font-medium"
          title={vote.actionType}
        >
          {humanizeAction(vote.actionType)}
        </StatusBadge>
        <StatusBadge variant={vote.quorumReached ? "success" : "default"} className="text-[11px] px-2 py-0.5 font-medium">
          {vote.quorumReached ? "Quorum reached" : "Pending"}
        </StatusBadge>
        <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">
          Expires <span className="mono text-text-secondary">{formatExpiry(vote.expireTime)}</span>
        </span>
      </div>

      {/* body: summary + metrics */}
      <div className="px-4 py-3.5">
        {vote.summary ? (
          <p className="text-[12.5px] leading-relaxed text-text-secondary mt-0 max-w-[640px]">
            {vote.summary}
          </p>
        ) : (
          <p className="text-[12px] text-text-tertiary mt-0">
            No summary provided for this proposal.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-x-8 gap-y-3 mt-3.5 items-end">
          {/* stake-weight FlowBar — cyan accent in BOTH toggle states */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-text-tertiary">Stake weight {denomLabel}</span>
            </div>
            <FlowBar
              ratio={weightPct / 100}
              color={chartPalette.accent}
              variant="gradient"
              height={8}
              label={`${weightPct.toFixed(1)}%`}
            />
          </div>

          {/* participation + foundation chips */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                Participation
              </span>
              <span className="mono text-[15px] text-text-primary mt-1 leading-none">
                {Math.round(vote.participationPct)}%{" "}
                <span className="text-[11px] text-text-tertiary">
                  {vote.voterCount}/{vote.totalValidators}
                </span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                Foundation
              </span>
              <span className="mono text-[15px] text-text-primary mt-1 leading-none">
                {vote.foundationVoterCount} / {FOUNDATION_COUNT}
              </span>
            </div>
          </div>
        </div>
      </div>

      {vote.voters.length > 0 && <VotersDisclosure vote={vote} />}
    </Card>
  );
}

export function GovernanceLens() {
  const { votes, stats, isLoading, error, refetch } = useValidatorVotes();
  const [view, setView] = useState<StakeView>("all");

  // Derived snapshot figures (memoized — cheap but keeps render stable).
  const derived = useMemo(() => {
    const total = votes.length;
    const quorumReached = votes.filter((v) => v.quorumReached).length;
    const foundationVoted = votes.filter((v) => v.foundationVoterCount > 0).length;
    const avgParticipation =
      total > 0
        ? votes.reduce((acc, v) => acc + v.participationPct, 0) / total
        : 0;
    const foundationStakePct =
      stats.totalStake > 0
        ? Math.round((stats.foundationStake / stats.totalStake) * 100)
        : 0;
    return { total, quorumReached, foundationVoted, avgParticipation, foundationStakePct };
  }, [votes, stats]);

  if (isLoading) {
    return <LoadingState message="Loading…" size="md" withCard={false} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load pending votes"
        message={error.message}
        onRetry={() => void refetch()}
        withCard={false}
      />
    );
  }

  if (votes.length === 0) {
    // Also covers the current state where the votes endpoint is not served
    // by the backend (useValidatorVotes is disabled and returns no data).
    return (
      <EmptyState
        title="Governance data unavailable"
        description="Governance votes are not served by the backend yet. This tab will populate once the endpoint ships."
      />
    );
  }

  const pendingCount = stats.pendingCount || votes.length;
  const eligible = stats.totalValidators;

  const kpiCells: KpiCell[] = [
    { key: "pending", label: "Pending", value: pendingCount, sub: "proposals" },
    {
      key: "participation",
      label: "Avg participation",
      value: `${Math.round(derived.avgParticipation)}%`,
      sub: eligible > 0 ? `of ${eligible} validators` : undefined,
    },
    {
      key: "quorum",
      label: "Quorum reached",
      value: `${derived.quorumReached} / ${derived.total}`,
      sub: derived.quorumReached === derived.total ? "all pending" : undefined,
      tone: derived.quorumReached === derived.total ? "success" : "default",
    },
    {
      key: "foundation",
      label: "Foundation voted",
      value: `${derived.foundationVoted} / ${FOUNDATION_COUNT}`,
      sub: derived.foundationVoted === 0 ? "abstained on all" : undefined,
    },
    { key: "eligible", label: "Eligible", value: eligible, sub: "validators" },
  ];

  const toggle = (
    <PillTabs
      variant="text"
      activeTab={view}
      onTabChange={(value) => setView(value as StakeView)}
      tabs={[
        { value: "all", label: "All validators" },
        { value: "community", label: "Community" },
      ]}
    />
  );

  return (
    <div className="space-y-8">
      {/* §Signal — neutral callout banner (NOT gold) */}
      <div className="bg-surface-2 border-l-2 border-brand/40 border-y border-r border-border-subtle rounded-lg px-5 py-4 flex items-start gap-3">
        <span className="mt-0.5 shrink-0 w-7 h-7 rounded-md bg-surface-3 text-text-secondary grid place-items-center">
          <InfoIcon />
        </span>
        <p className="text-[13.5px] leading-relaxed text-text-secondary">
          <span className="text-text-primary font-medium">
            Foundation controls <span className="mono">{derived.foundationStakePct}%</span> of stake
            and voted on{" "}
            <span className="mono">
              {derived.foundationVoted} of {derived.total}
            </span>{" "}
            pending proposals
          </span>
          {derived.quorumReached === derived.total ? (
            <> — community alone reached quorum on all {derived.quorumReached}.</>
          ) : (
            <> — community reached quorum on {derived.quorumReached} of {derived.total}.</>
          )}
        </p>
      </div>

      {/* §Pending — KPI ribbon + proposal stack */}
      <PageSection actions={toggle}>
        <KpiRibbon variant="plain" cells={kpiCells} />

        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-medium text-text-primary">Pending proposals</h3>
          <span className="text-[11px] text-text-tertiary">
            stake weight · {view === "community" ? "community" : "all validators"}
          </span>
        </div>

        <div className="space-y-3">
          {votes.map((vote) => (
            <ProposalCard key={vote.id} vote={vote} view={view} />
          ))}
        </div>
      </PageSection>

      {/* §Footer — scope caption (once) */}
      <p className="text-[11px] text-text-tertiary">{FOOTER_COPY}</p>
    </div>
  );
}
