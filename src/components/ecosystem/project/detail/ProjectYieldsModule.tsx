"use client";

import { Percent } from "lucide-react";
import { OverviewModule, ModuleTable, ModuleTableRow, SourceBadge } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useProtocolYields } from "@/services/market/yields";
import type { Project } from "@/services/ecosystem/project/types";

interface ProjectYieldsModuleProps {
  project: Project;
}

const RISK_TONE = {
  low: "text-success",
  medium: "text-gold",
  high: "text-danger",
} as const;

/**
 * Best HyperEVM yields of the project's protocol (Hyperfolio), on the project
 * page. Self-gating: nothing renders for projects Hyperfolio does not index,
 * so listing-only projects keep their honest empty page.
 */
export function ProjectYieldsModule({ project }: ProjectYieldsModuleProps) {
  const { protocol, yields, total, isLoading, error } = useProtocolYields(project);

  if (isLoading && !protocol) return null;
  if (error || !protocol || yields.length === 0) return null;

  return (
    <OverviewModule
      title="Yields on HyperEVM"
      icon={<Percent className="w-3.5 h-3.5 text-brand" />}
      tag={`${total} pool${total !== 1 ? "s" : ""}`}
      actions={<SourceBadge source="hyperfolio" status="ok" />}
      viewAllLabel={`All ${protocol.label} yields`}
      href={`/market/yields?protocol=${encodeURIComponent(protocol.value)}`}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <ModuleTable
            columns={[
              { header: "Pool", align: "left" },
              { header: "APY", width: 80 },
              { header: "TVL", width: 100 },
              { header: "Risk", width: 70 },
            ]}
          >
            {yields.map((y) => (
              <ModuleTableRow
                key={y.id}
                cells={[
                  <span key="pool" className="min-w-0 block">
                    <span className="block truncate text-[12.5px] text-text-primary">{y.poolName}</span>
                    <span className="block text-[10.5px] text-text-tertiary uppercase">
                      {y.type}
                      {y.tokens.length > 0 ? ` · ${y.tokens.join(" / ")}` : ""}
                    </span>
                  </span>,
                  <span key="apy" className={`mono text-[12px] font-semibold ${y.type === "borrow" ? "text-danger" : "text-success"}`}>
                    {y.apy.total.toFixed(2)}%
                  </span>,
                  <span key="tvl" className="mono text-[12px] text-text-primary">
                    {y.tvl !== null ? compactUsd(y.tvl) : "—"}
                  </span>,
                  <span key="risk" className={`text-[11px] capitalize ${RISK_TONE[y.risk.level]}`}>
                    {y.risk.level}
                  </span>,
                ]}
              />
            ))}
          </ModuleTable>
        </div>
      </div>
    </OverviewModule>
  );
}
