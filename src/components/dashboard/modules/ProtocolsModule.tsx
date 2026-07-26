"use client";

import { memo, useMemo } from "react";
import { Boxes } from "lucide-react";
import { OverviewModule, ModuleTable, ModuleTableRow } from "@/components/common";
import { ProjectLogo } from "@/components/ecosystem/project/ProjectLogo";
import { useRankedProjects, useChainStats } from "@/services/ecosystem/project";
import { compactUsd } from "@/lib/formatters/numberFormatting";

const TOP_N = 5;

/** Signed 7d change, or an honest dash when DefiLlama reports none. */
function Change7d({ value }: { value: number | null }) {
  if (value == null) return <span className="mono text-text-tertiary">—</span>;
  return (
    <span className={`mono font-medium ${value >= 0 ? "text-success" : "text-danger"}`}>
      {value >= 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/** ProtocolsModule — ecosystem signal on the Dashboard: top protocols by TVL on HL. */
export const ProtocolsModule = memo(function ProtocolsModule() {
  const { byTvl, isLoading } = useRankedProjects();
  const { stats } = useChainStats();

  const rows = useMemo(() => byTvl.slice(0, TOP_N), [byTvl]);

  return (
    <OverviewModule
      title="Top Protocols"
      icon={<Boxes size={13} className="text-brand" />}
      tag={stats?.tvl != null ? `${compactUsd(stats.tvl)} TVL` : undefined}
      viewAllLabel="All projects"
      href="/ecosystem/project"
    >
      <ModuleTable
        columns={[{ header: "Project" }, { header: "TVL on HL" }, { header: "7d" }]}
      >
        {isLoading && rows.length === 0 && (
          <tr>
            <td colSpan={3} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {rows.map(({ project, metric }) => (
          <ModuleTableRow
            key={project.id}
            href={`/ecosystem/project/${project.id}`}
            cells={[
              <span key="name" className="flex items-center gap-2.5 min-w-0">
                <ProjectLogo logo={project.logo} name={project.title} />
                <span className="font-medium text-text-primary truncate">
                  {project.title}
                </span>
              </span>,
              <span key="tvl" className="mono text-text-primary">
                {compactUsd(metric.hlTvl ?? 0)}
              </span>,
              <Change7d key="change" value={metric.change7d} />,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});
