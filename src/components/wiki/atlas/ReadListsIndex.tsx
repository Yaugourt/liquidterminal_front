"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, TypedDataTable, OverviewModule, ModuleRow, type Column } from "@/components/common";
import { SearchBar } from "@/components/common";
import { safeHref } from "@/lib/safeUrl";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { usePublicReadLists } from "@/services/wiki/readList/hooks/usePublicReadLists";
import { usePopularWikiResources } from "@/services/wiki";
import type { PublicReadList } from "@/services/wiki/readList/types";
import { Breadcrumb } from "../primitives";
import { slugify } from "../hub/topics";
import { FaviconTile } from "../library/FaviconTile";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Atlas read lists directory (/wiki/readlists): a searchable, sortable table
 * of every public list (List / Curator / Items / Reads / Updated, no fake
 * per-list Saves column) with a right rail on how lists work + most saved.
 */
export function ReadListsIndex() {
  const router = useRouter();
  const { readLists, pagination, loading, updateParams } = usePublicReadLists({ limit: 24 });
  const popular = usePopularWikiResources(5);

  const detailHref = (list: PublicReadList) => `/wiki/readlists/${slugify(list.name)}-${list.id}`;

  const columns: Column<PublicReadList>[] = useMemo(
    () => [
      {
        key: "name",
        header: "List",
        accessor: (l) => (
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-text-primary">{l.name}</div>
            {l.description && (
              <div className="truncate text-[11.5px] text-text-tertiary">{l.description}</div>
            )}
          </div>
        ),
      },
      {
        key: "curator",
        header: "Curator",
        width: "150px",
        accessor: (l) => (
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 text-[9px] font-semibold uppercase text-text-secondary">
              {l.creator.name?.slice(0, 2)}
            </span>
            <span className="truncate text-[12px] text-text-secondary">{l.creator.name}</span>
          </div>
        ),
      },
      {
        key: "items",
        header: "Items",
        width: "80px",
        align: "right",
        accessor: (l) => <span className="mono text-[12.5px] text-text-primary">{l.itemsCount}</span>,
      },
      {
        key: "reads",
        header: "Reads",
        width: "80px",
        align: "right",
        accessor: (l) => <span className="mono text-[12.5px] text-text-secondary">{l.readCount ?? 0}</span>,
      },
      {
        key: "updated",
        header: "Updated",
        width: "100px",
        align: "right",
        accessor: (l) => <span className="mono text-[11.5px] text-text-secondary">{timeAgo(l.updatedAt)}</span>,
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Wiki", href: "/wiki" }, { label: "Read lists" }]} />

      <PageHeader
        title="Read lists"
        description="Curated reading paths by the community."
        actions={
          <Link
            href="/wiki/readlist"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold text-brand-text-on transition-colors hover:bg-brand/90"
          >
            + Create a read list
          </Link>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-3.5 py-3">
            <span className="text-[13px] font-semibold text-text-primary">All lists</span>
            <SearchBar
              onSearch={(q) => updateParams({ search: q })}
              placeholder="Search lists or curators"
              className="min-w-[160px] flex-1 sm:max-w-[260px]"
            />
            <span className="ml-auto text-[11px] text-text-tertiary">
              <span className="mono">{pagination?.total ?? readLists.length}</span> lists
            </span>
          </div>

          <TypedDataTable
            data={readLists}
            columns={columns}
            getRowKey={(l) => l.id}
            isLoading={loading}
            onRowClick={(l) => router.push(detailHref(l))}
          />

          {readLists.length > 0 && (
            <div className="flex items-center gap-1.5 border-t border-border-subtle bg-surface-2/40 px-4 py-2.5 text-[12px] text-text-tertiary">
              Read lists are new. Curate a path and share its URL.
              <Link href="/wiki/readlist" className="font-medium text-brand transition-colors hover:text-brand-hover">
                Create yours →
              </Link>
            </div>
          )}
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
          <OverviewModule title="How lists work" tagVariant="plain">
            <div className="space-y-2 px-4 py-3 text-[12px] text-text-secondary">
              <p>Save articles as you read.</p>
              <p>Order them into a path.</p>
              <p>Share the URL.</p>
            </div>
          </OverviewModule>

          <OverviewModule title="Most saved" tag="read-list saves" tagVariant="plain">
            {popular.resources.length === 0 ? (
              <p className="px-3.5 py-4 text-[11.5px] text-text-tertiary">No saved resource yet.</p>
            ) : (
              popular.resources.map((r, i) => (
                <a key={r.id} href={safeHref(r.url)} target="_blank" rel="noopener noreferrer" className="block">
                  <ModuleRow
                    rank={i + 1}
                    logo={<FaviconTile favicon={r.linkPreview?.favicon} hostname={hostnameOf(r.url)} size={28} />}
                    name={r.linkPreview?.title || hostnameOf(r.url)}
                    sub={hostnameOf(r.url)}
                    stats={[{ value: `★ ${r.savesCount ?? 0}`, valueClassName: "text-gold", width: 40 }]}
                  />
                </a>
              ))
            )}
          </OverviewModule>
        </aside>
      </div>
    </div>
  );
}
