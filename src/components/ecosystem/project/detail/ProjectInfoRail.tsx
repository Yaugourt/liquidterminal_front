"use client";

import { Project, ProjectDataSourceType } from "@/services/ecosystem/project/types";
import { groupCategories } from "@/lib/categoryLabels";

const SOURCE_META: Record<ProjectDataSourceType, { label: string; className: string; detail: string }> = {
  DEFILLAMA: { label: "DeFiLlama", className: "bg-brand/10 border-brand/25 text-brand", detail: "TVL · fees · vol" },
  HL_SPOT_TOKEN: { label: "HL Spot", className: "bg-success/10 border-success/25 text-success", detail: "price · mcap" },
  HL_BUILDER: { label: "HL Builder", className: "bg-surface-2 border-border-subtle text-text-secondary", detail: "" },
  HL_VAULT: { label: "HL Vault", className: "bg-surface-2 border-border-subtle text-text-secondary", detail: "" },
  MANUAL: { label: "Manual", className: "bg-surface-2 border-border-subtle text-text-secondary", detail: "" },
};

interface ProjectInfoRailProps {
  project: Project;
  sources?: ProjectDataSourceType[];
  updatedAt?: number;
}

export function ProjectInfoRail({ project, sources, updatedAt }: ProjectInfoRailProps) {
  const launched = new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const links = [
    { url: project.website, label: "Website" },
    { url: project.twitter, label: "X / Twitter" },
    { url: project.discord, label: "Discord" },
    { url: project.telegram, label: "Telegram" },
  ].filter((l) => l.url);

  return (
    <aside className="xl:sticky xl:top-6 space-y-4">
      {/* About */}
      <div className="bg-surface border border-border-subtle rounded-lg">
        <div className="px-4 py-3 border-b border-border-subtle">
          <h3 className="text-[13px] font-medium text-text-primary">About</h3>
        </div>
        <div className="px-4 py-3 space-y-3">
          <p className="text-[12.5px] leading-relaxed text-text-secondary">{project.desc}</p>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-text-tertiary">Added</span>
            <span className="mono text-text-secondary">{launched}</span>
          </div>
          {project.categories && project.categories.length > 0 && (
            <div className="flex items-start justify-between gap-2 text-[12px]">
              <span className="text-text-tertiary shrink-0">Categories</span>
              <span className="flex flex-wrap gap-1 justify-end">
                {/* Normalized labels: dirty backend variants collapse to one chip. */}
                {groupCategories(project.categories).map((group) => (
                  <span key={group.label} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle text-text-secondary">
                    {group.label}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Data sources */}
      {sources && sources.length > 0 && (
        <div className="bg-surface border border-border-subtle rounded-lg">
          <div className="px-4 py-3 border-b border-border-subtle">
            <h3 className="text-[13px] font-medium text-text-primary">Data sources</h3>
          </div>
          <div className="px-4 py-3 space-y-2">
            {sources.map((src) => {
              const meta = SOURCE_META[src];
              return (
                <div key={src} className="flex items-center justify-between">
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${meta.className}`}>
                    {meta.label}
                  </span>
                  {meta.detail && <span className="mono text-[10.5px] text-text-tertiary">{meta.detail}</span>}
                </div>
              );
            })}
            {updatedAt != null && (
              <p className="text-[10.5px] text-text-tertiary pt-1">
                updated{" "}
                <span className="mono">
                  {new Date(updatedAt).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="bg-surface border border-border-subtle rounded-lg">
          <div className="px-4 py-3 border-b border-border-subtle">
            <h3 className="text-[13px] font-medium text-text-primary">Links</h3>
          </div>
          <div className="px-2 py-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
              >
                {link.label}
                <span className="ml-auto text-text-tertiary">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
