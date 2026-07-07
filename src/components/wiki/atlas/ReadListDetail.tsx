"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { KpiRibbon, type KpiCell } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { safeHref } from "@/lib/safeUrl";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { getPublicReadListWithItems } from "@/services/wiki/readList/api";
import type { PublicReadListWithItems, ReadListItem } from "@/services/wiki/readList/types";
import { Breadcrumb, TypeBadge } from "../primitives";

interface ReadListDetailProps {
  /** "[slug]-[id]" segment; the trailing numeric id is authoritative. */
  slug: string;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Atlas read list detail (/wiki/readlists/[slug]-[id]): header with an
 * Items/Readers/Updated ribbon and a Read/Unread progress bar, then the
 * ordered reading path (rank, TypeBadge, title, read status). Real read
 * state only.
 */
export function ReadListDetail({ slug }: ReadListDetailProps) {
  const id = Number(slug.split("-").pop());
  const [list, setList] = useState<PublicReadListWithItems | null>(null);
  const [items, setItems] = useState<ReadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setNotFoundFlag(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // One public endpoint returns the list summary + its items (no auth).
        const res = await getPublicReadListWithItems(id);
        if (cancelled) return;
        setList(res.data);
        setItems(res.data.items ?? []);
      } catch {
        if (!cancelled) setNotFoundFlag(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const ordered = useMemo(
    () => [...items].sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id)),
    [items]
  );
  const readCount = ordered.filter((i) => i.isRead).length;
  const unreadCount = ordered.length - readCount;
  const firstUnreadId = ordered.find((i) => !i.isRead)?.id;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-64 animate-pulse rounded bg-surface-2" />
        <div className="h-40 animate-pulse rounded-lg bg-surface" />
        <div className="h-96 animate-pulse rounded-lg bg-surface" />
      </div>
    );
  }
  if (notFoundFlag || !list) return notFound();

  const kpiCells: KpiCell[] = [
    { key: "items", label: "Items", value: ordered.length },
    { key: "read", label: "Read", value: readCount },
    { key: "updated", label: "Updated", value: timeAgo(list.updatedAt) },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Wiki", href: "/wiki" },
          { label: "Read lists", href: "/wiki/readlists" },
          { label: list.name },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          {/* Header */}
          <div className="space-y-3 rounded-lg border border-border-subtle bg-surface p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary">Read list</div>
            <h1 className="text-[20px] font-semibold text-text-primary">{list.name}</h1>
            {list.description && <p className="text-[12.5px] text-text-secondary">{list.description}</p>}
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-surface-2 text-[9px] font-semibold uppercase text-text-secondary">
                {list.creator.name?.slice(0, 2)}
              </span>
              <span className="text-[12px] text-text-secondary">by {list.creator.name}</span>
              <StatusBadge variant={list.isPublic ? "success" : "inactive"}>
                {list.isPublic ? "Public" : "Private"}
              </StatusBadge>
            </div>
            <KpiRibbon variant="plain" cells={kpiCells} columns="grid-cols-3" />
            {ordered.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-success">Read {readCount}</span>
                  <span className="text-text-tertiary">Unread {unreadCount}</span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${ordered.length ? (readCount / ordered.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-tertiary">Your progress · real read state</p>
              </div>
            )}
          </div>

          {/* Reading order */}
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
            <div className="flex items-baseline justify-between border-b border-border-subtle px-4 py-3">
              <h2 className="text-[13px] font-medium text-text-primary">Reading order</h2>
              <span className="mono text-[11px] text-text-tertiary">{ordered.length} items</span>
            </div>
            {ordered.length === 0 ? (
              <p className="px-4 py-8 text-center text-[12px] text-text-tertiary">This list has no items yet.</p>
            ) : (
              ordered.map((item, index) => {
                const preview = item.resource.linkPreview;
                const hostname = hostnameOf(item.resource.url);
                const isFirstUnread = item.id === firstUnreadId;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5 transition-colors last:border-b-0 hover:bg-surface-2/60"
                  >
                    <span className="mono w-5 shrink-0 text-[11px] text-text-tertiary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <TypeBadge url={item.resource.url} variant="icon" />
                    <a
                      href={safeHref(item.resource.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1"
                    >
                      <div className="truncate text-[13px] font-medium text-text-primary hover:text-brand">
                        {preview?.title || hostname}
                      </div>
                      <div className="mono text-[11px] text-text-tertiary">
                        {hostname} · {timeAgo(item.resource.createdAt)}
                      </div>
                    </a>
                    {item.isRead ? (
                      <span className="flex shrink-0 items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <StatusBadge variant="success">Read</StatusBadge>
                      </span>
                    ) : isFirstUnread ? (
                      <a
                        href={safeHref(item.resource.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-md bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-text-on transition-colors hover:bg-brand/90"
                      >
                        Continue →
                      </a>
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-text-tertiary/50" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Curator rail */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
          <div className="rounded-lg border border-border-subtle bg-surface p-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              About the curator
            </div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-[11px] font-semibold uppercase text-text-secondary">
                {list.creator.name?.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-text-primary">{list.creator.name}</div>
                <div className="mono text-[10px] text-text-tertiary">{ordered.length} items curated</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
