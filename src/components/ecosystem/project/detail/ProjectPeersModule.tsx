"use client";

import Image from "next/image";
import { useState } from "react";
import { Users } from "lucide-react";
import { OverviewModule, ModuleTable, ModuleTableRow } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { ProjectPeer } from "@/services/ecosystem/project/types";

/** Peer logo with initials fallback (peer logos come from mixed sources). */
function PeerLogo({ logo, name }: { logo: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed) {
    return (
      <span className="w-5 h-5 rounded bg-surface-2 border border-border-subtle grid place-items-center text-[9px] font-semibold text-text-secondary shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={logo}
      alt={name}
      width={20}
      height={20}
      className="rounded object-cover shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

function changeCell(change7d: number | null): React.ReactNode {
  if (change7d == null) return <span className="text-text-tertiary">&nbsp;</span>;
  const sign = change7d >= 0 ? "+" : "";
  return (
    <span className={`mono text-[11.5px] ${change7d >= 0 ? "text-success" : "text-danger"}`}>
      {sign}
      {change7d.toFixed(1)}%
    </span>
  );
}

interface ProjectPeersModuleProps {
  title: string;
  /** Right-side tag, e.g. "19 protocols · $724M". */
  tag?: string;
  peers: ProjectPeer[];
  /** Show the category-share column (DefiLlama category scope only). */
  showShare: boolean;
}

/**
 * Peer group of the context-first project page. Linked projects get their
 * DefiLlama category ranked by TVL on HL (current project highlighted at its
 * rank); unlinked projects get the linked projects of their DB category —
 * every page becomes a gateway to pages that have data.
 */
export function ProjectPeersModule({ title, tag, peers, showShare }: ProjectPeersModuleProps) {
  if (peers.length === 0) return null;

  const columns = [
    { header: "#", width: 36, align: "left" as const },
    { header: showShare ? "Protocol" : "Project", align: "left" as const },
    ...(showShare ? [{ header: "Share", width: 90 }] : []),
    { header: "7d", width: 80 },
    { header: "TVL on HL", width: 110 },
  ];

  return (
    <OverviewModule
      title={title}
      icon={<Users className="w-3.5 h-3.5 text-brand" />}
      tag={tag}
      tagVariant="plain"
      viewAllLabel="All projects"
      href="/ecosystem/project"
    >
      <ModuleTable columns={columns}>
        {peers.map((peer) => {
          const nameCell = (
            <span className="flex items-center gap-2 min-w-0">
              <PeerLogo logo={peer.logo} name={peer.name} />
              <span
                className={`truncate text-[12.5px] ${peer.isCurrent ? "font-semibold text-text-primary" : "text-text-secondary"}`}
              >
                {peer.name}
              </span>
              {peer.isCurrent && (
                <span className="text-[10px] text-brand shrink-0">this project</span>
              )}
            </span>
          );
          const cells: React.ReactNode[] = [
            <span key="rank" className="mono text-[11px] text-text-tertiary">
              {peer.rank}
            </span>,
            nameCell,
            ...(showShare
              ? [
                  <span key="share" className="mono text-[11.5px] text-text-secondary">
                    {peer.shareOfCategoryPct != null ? `${peer.shareOfCategoryPct.toFixed(1)}%` : ""}
                  </span>,
                ]
              : []),
            changeCell(peer.change7d),
            <span key="tvl" className="mono text-[12px] text-text-primary">
              {compactUsd(peer.hlTvl)}
            </span>,
          ];
          return (
            <ModuleTableRow
              key={peer.slug}
              cells={cells}
              href={peer.projectId != null && !peer.isCurrent ? `/ecosystem/project/${peer.projectId}` : undefined}
              className={peer.isCurrent ? "bg-brand/5" : undefined}
            />
          );
        })}
      </ModuleTable>
    </OverviewModule>
  );
}
