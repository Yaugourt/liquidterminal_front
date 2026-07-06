"use client";

import { useMemo } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { safeHref } from "@/lib/safeUrl";
import type { EducationalResource } from "@/services/wiki/types";
import { FaviconTile } from "./FaviconTile";

interface LibraryTableProps {
  resources: EducationalResource[];
  isLoading: boolean;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Table view of the library card-shell: one dense row per resource
 * (source tile + title + domain, category chip, added, saves). Rows open
 * the resource in a new tab. Pagination stays outside (server-driven).
 */
export function LibraryTable({ resources, isLoading }: LibraryTableProps) {
  const columns: Column<EducationalResource>[] = useMemo(
    () => [
      {
        key: "resource",
        header: "Resource",
        accessor: (resource) => {
          const preview = resource.linkPreview;
          const hostname = hostnameOf(resource.url);
          return (
            <div className="flex min-w-0 items-center gap-3">
              <FaviconTile favicon={preview?.favicon} hostname={hostname} size={28} />
              <div className="min-w-0">
                <div className="max-w-[420px] truncate text-[13px] font-medium text-text-primary">
                  {preview?.title || hostname}
                </div>
                <div className="text-[11px] text-text-tertiary">{preview?.siteName || hostname}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: "category",
        header: "Category",
        width: "180px",
        accessor: (resource) => {
          const first = resource.categories[0]?.category.name;
          if (!first) return <span className="text-[11px] text-text-tertiary">–</span>;
          return (
            <span className="inline-flex items-center gap-1.5">
              <span className="rounded-md border border-border-subtle bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                {first}
              </span>
              {resource.categories.length > 1 && (
                <span className="text-[11px] text-text-tertiary">+{resource.categories.length - 1}</span>
              )}
            </span>
          );
        },
      },
      {
        key: "added",
        header: "Added",
        width: "110px",
        align: "right",
        accessor: (resource) => (
          <span className="mono text-[11.5px] text-text-secondary">{timeAgo(resource.createdAt)}</span>
        ),
      },
      {
        key: "saves",
        header: "Saved",
        width: "90px",
        align: "right",
        accessor: (resource) => (
          <span className="mono text-[12.5px] text-text-primary">{resource.savesCount ?? 0}</span>
        ),
      },
    ],
    []
  );

  return (
    <TypedDataTable
      data={resources}
      columns={columns}
      getRowKey={(resource) => resource.id}
      isLoading={isLoading}
      onRowClick={(resource) => {
        window.open(safeHref(resource.url), "_blank", "noopener,noreferrer");
      }}
    />
  );
}
