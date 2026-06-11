"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDeploys } from "@/services/explorer";
import {
  ModuleTable,
  ModuleTableRow,
} from "@/components/common";
import { truncateAddress } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";

/**
 * TokenDeploys — recent token / spot / perp deployments. Compact V4 table fed
 * by `/v2/explorer/recentDeploys` via the existing `useDeploys` hook.
 */

const ROWS = 8;

export const TokenDeploys = memo(function TokenDeploys() {
  const { deploys, isLoading } = useDeploys();

  const rows = useMemo(() => (deploys ?? []).slice(0, ROWS), [deploys]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Rocket size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Token Deploys</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          Last {ROWS}
        </span>
        <Link
          href="/explorer"
          className="ml-auto shrink-0 flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

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
