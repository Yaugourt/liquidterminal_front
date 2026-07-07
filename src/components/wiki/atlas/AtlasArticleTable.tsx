"use client";

import { useMemo } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { safeHref } from "@/lib/safeUrl";
import type { EducationalResource } from "@/services/wiki/types";
import { TypeBadge, SaveToListButton } from "../primitives";

interface AtlasArticleTableProps {
  resources: EducationalResource[];
  isLoading: boolean;
  /** Show the Category column (community/topic tables). */
  showCategory?: boolean;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Atlas article table: Type / Title (+ domain sub) / [Category] / Saves
 * (gold, blank at 0) / Age / Save. Row opens the source in a new tab; the
 * Save column is a discrete hit target, separate from the row link.
 */
export function AtlasArticleTable({ resources, isLoading, showCategory = false }: AtlasArticleTableProps) {
  const columns: Column<EducationalResource>[] = useMemo(() => {
    const cols: Column<EducationalResource>[] = [
      {
        key: "type",
        header: "Type",
        width: "110px",
        accessor: (r) => <TypeBadge url={r.url} />,
      },
      {
        key: "title",
        header: "Resource",
        accessor: (r) => {
          const hostname = hostnameOf(r.url);
          return (
            <div className="min-w-0">
              <div className="max-w-[440px] truncate text-[13px] font-medium text-text-primary">
                {r.linkPreview?.title || hostname}
              </div>
              <div className="mono text-[11px] text-text-tertiary">{r.linkPreview?.siteName || hostname}</div>
            </div>
          );
        },
      },
    ];

    if (showCategory) {
      cols.push({
        key: "category",
        header: "Category",
        width: "160px",
        accessor: (r) => {
          const first = r.categories[0]?.category.name;
          if (!first) return <span className="text-[11px] text-text-tertiary">–</span>;
          return (
            <span className="rounded-md border border-border-subtle bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              {first}
            </span>
          );
        },
      });
    }

    cols.push(
      {
        key: "saves",
        header: "Saves",
        width: "80px",
        align: "right",
        accessor: (r) =>
          r.savesCount && r.savesCount > 0 ? (
            <span className="mono text-[12px] font-medium text-gold">★ {r.savesCount}</span>
          ) : (
            <span className="text-text-tertiary/40">–</span>
          ),
      },
      {
        key: "age",
        header: "Age",
        width: "90px",
        align: "right",
        accessor: (r) => <span className="mono text-[11.5px] text-text-secondary">{timeAgo(r.createdAt)}</span>,
      },
      {
        key: "save",
        header: "",
        width: "48px",
        align: "center",
        accessor: (r) => (
          <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
            <SaveToListButton
              resourceId={r.id}
              resourceTitle={r.linkPreview?.title || hostnameOf(r.url)}
              savesCount={r.savesCount}
            />
          </div>
        ),
      }
    );

    return cols;
  }, [showCategory]);

  return (
    <TypedDataTable
      data={resources}
      columns={columns}
      getRowKey={(r) => r.id}
      isLoading={isLoading}
      onRowClick={(r) => window.open(safeHref(r.url), "_blank", "noopener,noreferrer")}
    />
  );
}
