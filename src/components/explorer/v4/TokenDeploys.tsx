"use client";

import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useDeploys } from "@/services/explorer";
import {
  CardHead,
  ModuleTable,
  ModuleTableRow,
  SourceBadge,
  sourceStatus,
} from "@/components/common";
import { truncateAddress } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";

/**
 * TokenDeploys — recent token / spot / perp deployments. Compact V4 table fed
 * by Hypurrscan `/deploys` via the existing `useDeploys` hook.
 */

const ROWS = 8;

export const TokenDeploys = memo(function TokenDeploys() {
  const { deploys, isLoading, error } = useDeploys();

  const rows = useMemo(() => (deploys ?? []).slice(0, ROWS), [deploys]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Token Deploys"
        tag={`Last ${ROWS}`}
        actions={<SourceBadge source="hypurrscan" status={sourceStatus(error, isLoading)} />}
      />

      {isLoading && rows.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          No recent deploys
        </div>
      ) : (
        <ModuleTable
          density="compact"
          columns={[
            { header: "Age", align: "left", width: 70 },
            { header: "Action", align: "left" },
            { header: "Deployer", align: "left", width: 140 },
            { header: "Hash", align: "left" },
            { header: "Status", align: "right", width: 70 },
          ]}
        >
          {rows.map((d) => (
            <ModuleTableRow
              key={d.hash}
              cells={[
                <span key="age" className="mono text-text-tertiary">
                  {timeAgo(d.timestamp)}
                </span>,
                <span
                  key="action"
                  className="text-text-primary text-[12px] font-medium"
                >
                  {d.action}
                </span>,
                <span key="deployer" className="mono text-text-secondary">
                  {truncateAddress(d.user)}
                </span>,
                <span key="hash" className="mono text-brand">
                  {truncateAddress(d.hash)}
                </span>,
                <span
                  key="status"
                  className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${
                    d.status === "error"
                      ? "bg-danger/10 text-danger"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {d.status === "error" ? "fail" : "ok"}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      )}
    </Card>
  );
});
