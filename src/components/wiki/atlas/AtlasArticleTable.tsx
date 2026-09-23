"use client";

import { useMemo, type ReactNode } from "react";
import { TypedDataTable, ModuleAsset, type Column, type PaginationProps } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { safeHref } from "@/lib/safeUrl";
import type { EducationalResource } from "@/services/wiki/types";
import { CONTENT_TYPE_META, detectContentType, SaveToListButton } from "../primitives";

type ArticlePagination = Pick<
  PaginationProps,
  "total" | "page" | "rowsPerPage" | "onPageChange" | "onRowsPerPageChange"
>;

interface AtlasArticleTableProps {
  resources: EducationalResource[];
  isLoading: boolean;
  /** Show the Category column (community/topic tables). */
  showCategory?: boolean;
  /** Card head — the table owns its card, so the feed chrome is passed through. */
  title?: ReactNode;
  tag?: ReactNode;
  headerAction?: ReactNode;
  /** Search / sort / type filters, under the head. */
  toolbar?: ReactNode;
  /** Server pagination (omit to hide the footer). */
  pagination?: ArticlePagination;
  /** Empty-state line (no match for the query / filter). */
  emptyMessage?: string;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Content-type pill (article, video, thread…) — derived from the URL. */
function TypeCell({ url }: { url: string }) {
  const meta = CONTENT_TYPE_META[detectContentType(url)];
  const Icon = meta.icon;
  return (
    <StatusBadge variant="neutral">
      <Icon className="h-3 w-3" />
      {meta.label}
    </StatusBadge>
  );
}

/**
 * Atlas article table: Type / Title (+ domain sub) / [Category] / Saves
 * (gold, blank at 0) / Age / Save. Row opens the source in a new tab; the
 * Save column is a discrete hit target, separate from the row link.
 */
export function AtlasArticleTable({
  resources,
  isLoading,
  showCategory = false,
  title,
  tag,
  headerAction,
  toolbar,
  pagination,
  emptyMessage,
}: AtlasArticleTableProps) {
  const columns: Column<EducationalResource>[] = useMemo(() => {
    const cols: Column<EducationalResource>[] = [
      {
        key: "type",
        header: "Type",
        width: "110px",
        accessor: (r) => <TypeCell url={r.url} />,
      },
      {
        key: "title",
        header: "Resource",
        className: "max-w-[440px]",
        accessor: (r) => {
          const hostname = hostnameOf(r.url);
          return (
            <ModuleAsset
              name={r.linkPreview?.title || hostname}
              sub={r.linkPreview?.siteName || hostname}
            />
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
          return first ? <StatusBadge variant="neutral">{first}</StatusBadge> : "—";
        },
      });
    }

    cols.push(
      {
        key: "saves",
        header: "Saves",
        width: "80px",
        type: "numeric",
        tone: (r) => (r.savesCount && r.savesCount > 0 ? "gold" : "muted"),
        accessor: (r) => (r.savesCount && r.savesCount > 0 ? `★ ${r.savesCount}` : "—"),
      },
      {
        key: "age",
        header: "Age",
        width: "90px",
        type: "time",
        align: "right",
        accessor: (r) => timeAgo(r.createdAt),
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
      title={title}
      tag={tag}
      headerAction={headerAction}
      toolbar={toolbar}
      data={resources}
      columns={columns}
      getRowKey={(r) => r.id}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      emptyDescription=""
      onRowClick={(r) => window.open(safeHref(r.url), "_blank", "noopener,noreferrer")}
      {...pagination}
      rowsPerPageOptions={pagination ? [pagination.rowsPerPage] : undefined}
      className="min-w-0"
    />
  );
}
