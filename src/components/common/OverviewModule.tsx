"use client";

import {
  createContext,
  memo,
  useContext,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CardHead } from "./CardHead";
import type { TokenKind } from "@/lib/tokenIconUrl";
import { TokenAvatar } from "./TokenAvatar";

/**
 * OverviewModule — la brique du Dashboard « vue d'ensemble ».
 *
 * Une carte = le résumé d'une page de l'app. En-tête = `<CardHead>` (minimal :
 * titre + tag discret + actions + lien « View all → » optionnel à droite).
 * Le corps accueille soit une table (`ModuleTable`), soit une liste de
 * leaderboard (`ModuleRow`). Toutes les pages se résument avec ce même
 * composant — cohérence garantie.
 */

interface OverviewModuleProps {
  title: string;
  /** Plain figure pinned right of the head (e.g. "$1.91B TVL"). */
  tag?: ReactNode;
  /** One-line helper next to the title. */
  subtitle?: ReactNode;
  /** Label of the "View all →" link (e.g. "All vaults"). */
  viewAllLabel?: string;
  /** Link to the full page. Omit to hide the "View all" link — e.g. when the
   * module is already rendered on that destination page. */
  href?: string;
  /**
   * Slot pinned to the right of the head, before the "View all" link — the home
   * of card-level actions such as the CSV export button. Lives on the primitive
   * so an action reaches every module without editing a single page.
   */
  actions?: ReactNode;
  /** Card body: a table or a leaderboard list. */
  children?: ReactNode;
  className?: string;
}

export const OverviewModule = memo(function OverviewModule({
  title,
  tag,
  subtitle,
  viewAllLabel,
  href,
  actions,
  children,
  className,
}: OverviewModuleProps) {
  return (
    <Card className={`flex flex-col ${className ?? ""}`}>
      <CardHead
        title={title}
        subtitle={subtitle}
        tag={tag}
        actions={actions}
        href={href}
        viewAllLabel={viewAllLabel}
      />
      {children && <div className="flex-1 flex flex-col">{children}</div>}
    </Card>
  );
});

/* ============================================================
 * Leaderboard list (builder-row / perpdex-row de la maquette)
 * ========================================================== */

/** Une statistique value-au-dessus-du-label dans le bloc `b-stats`. */
export interface ModuleRowStat {
  /** Caption under the value. Omit for a value-only stat (dense sidebar rows). */
  label?: string;
  value: ReactNode;
  /** Couleur de la valeur — défaut `text-text-primary`. */
  valueClassName?: string;
  /** Largeur fixe de la colonne, pour aligner les lignes entre elles. */
  width?: number;
}

/**
 * ModuleRow — ligne de leaderboard (rank + logo + nom/sous-titre + stats).
 * Calque la `.builder-row` / `.perpdex-row` de la maquette.
 */
export function ModuleRow({
  rank,
  logo,
  name,
  sub,
  stats,
  href,
}: {
  /** Rang affiché en mono (ex. 1 → "01"). */
  rank: number;
  /** Pastille logo `rounded-md`. */
  logo: ReactNode;
  name: ReactNode;
  sub?: ReactNode;
  stats: ModuleRowStat[];
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle last:border-b-0 hover:bg-surface-2/60 transition-colors">
      <span className="mono w-5 shrink-0 text-[11px] text-text-tertiary">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[9px] font-semibold bg-surface-2 text-text-secondary overflow-hidden">
        {logo}
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium text-text-primary truncate">
          {name}
        </div>
        {sub != null && (
          <div className="mono text-[10px] text-text-tertiary truncate">{sub}</div>
        )}
      </div>
      <div className="ml-auto flex shrink-0 gap-5">
        {stats.map((s, i) => (
          <div
            key={i}
            className="text-right"
            style={s.width ? { width: s.width } : undefined}
          >
            <div
              className={`mono text-[12.5px] font-medium ${
                s.valueClassName ?? "text-text-primary"
              }`}
            >
              {s.value}
            </div>
            {s.label && (
              <div className="text-[9px] uppercase tracking-[0.04em] text-text-tertiary">
                {s.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/* ============================================================
 * Compact table — leaderboards · live feeds · recent activity
 * ==========================================================
 * `ModuleTable` is THE primitive for any compact table rendered inside a
 * card. It owns three things so consumers never have to redefine them:
 *  - column widths (`columns[].width`)         — header + rows stay aligned
 *  - row density (`density`)                   — comfortable (default) / compact
 *  - per-column alignment (`columns[].align`)  — first col left, others right
 *
 * Use cases on top of this primitive: leaderboards (top N), live feeds
 * (blocks / transactions / fills), recent activity tables, anywhere you'd
 * otherwise write `<div className="grid grid-cols-[...]">` by hand.
 */

export interface ModuleColumn {
  /** Column header label. */
  header: ReactNode;
  /** Alignment — first column defaults left, the rest default right. */
  align?: "left" | "right";
  /**
   * Fixed column width. Pass a number for px (`60`) or a string for any CSS
   * value (`"1fr"`, `"auto"`, `"30%"`). Omit to let the column flex with the
   * remaining space.
   */
  width?: number | string;
}

export type ModuleTableDensity = "comfortable" | "compact";

interface ModuleTableCtx {
  density: ModuleTableDensity;
  /** Per-column alignment, looked up by cell index. */
  alignments: Array<"left" | "right">;
}

const ModuleTableContext = createContext<ModuleTableCtx>({
  density: "comfortable",
  alignments: [],
});

/** Resolve `width` into the inline style for a `<col>` element. */
function colStyle(width: number | string | undefined): React.CSSProperties | undefined {
  if (width == null) return undefined;
  return { width: typeof width === "number" ? `${width}px` : width };
}

/**
 * ModuleTable — compact table card body (alias `.tbl` in the mockup).
 *
 * `<colgroup>` propagates width to header + rows so column edges stay aligned
 * pixel-perfect even when rows render in different React subtrees. Use the
 * `density="compact"` variant for dense feeds (blocks/tx live streams).
 */
export function ModuleTable({
  columns,
  children,
  density = "comfortable",
}: {
  columns: ModuleColumn[];
  children: ReactNode;
  density?: ModuleTableDensity;
}) {
  // `table-fixed` only kicks in when at least one column declares a `width`;
  // otherwise we keep the legacy `table-auto` behaviour so existing
  // consumers (top-N leaderboards without widths) render unchanged.
  const hasWidths = columns.some((c) => c.width != null);
  // Resolve per-column alignment once so header and rows stay in sync.
  // Default: first column left, others right (legacy behaviour).
  const alignments = columns.map(
    (c, i) => c.align ?? (i === 0 ? "left" : "right"),
  );
  return (
    <ModuleTableContext.Provider value={{ density, alignments }}>
      <div className="overflow-x-auto scrollbar-brand">
      <table
        className={`w-full border-collapse ${hasWidths ? "table-fixed" : "table-auto"}`}
      >
        {hasWidths && (
          <colgroup>
            {columns.map((c, i) => (
              <col key={i} style={colStyle(c.width)} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={`${
                  density === "compact" ? "px-3 py-1.5" : "px-3 py-2"
                } text-[10px] uppercase tracking-[0.08em] font-medium text-text-tertiary border-b border-border-subtle ${
                  alignments[i] === "left" ? "text-left" : "text-right"
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      </div>
    </ModuleTableContext.Provider>
  );
}

/** A row of `ModuleTable`. Clickable when `href` is set. */
export function ModuleTableRow({
  cells,
  href,
  className,
}: {
  /** Cell content — alignment is owned by `columns[].align` on the parent table. */
  cells: ReactNode[];
  href?: string;
  /** Extra row classes (e.g. `bg-brand/5` to highlight the current entity). */
  className?: string;
}) {
  return (
    <tr
      className={`border-b border-border-subtle last:border-b-0 hover:bg-surface-2/60 transition-colors ${className ?? ""}`}
    >
      {cells.map((cell, i) => (
        <ModuleCell key={i} href={href} index={i}>
          {cell}
        </ModuleCell>
      ))}
    </tr>
  );
}

/** Single cell of a `ModuleTable` row. */
function ModuleCell({
  children,
  href,
  index,
}: {
  children: ReactNode;
  href?: string;
  index: number;
}) {
  const { density, alignments } = useContext(ModuleTableContext);
  // Fallback: first cell left, the rest right (legacy ModuleTable behaviour).
  const align = alignments[index] ?? (index === 0 ? "left" : "right");
  const content = href ? (
    <Link href={href} className="block">
      {children}
    </Link>
  ) : (
    children
  );
  return (
    <td
      className={`${
        density === "compact" ? "px-3 py-1.5" : "px-3 py-2"
      } text-[12.5px] overflow-hidden ${
        align === "left" ? "text-left" : "text-right"
      }`}
    >
      {content}
    </td>
  );
}

/**
 * ModuleAsset — the "name" cell of any table row (ModuleTable or
 * TypedDataTable): neutral rounded-md avatar + name + optional mono sub-line.
 * Mirrors the kit's `.asset` block.
 *
 * Avatar sources (first match wins):
 *  - `logo` — arbitrary node (initials, identicon, custom image).
 *  - `assetName` (+ optional `src`) — delegated to {@link TokenAvatar}: HL CDN
 *    icon (or the explicit `src` URL) with a 2-initials fallback. Pass the full
 *    asset name incl. any `xyz:` prefix for HIP-3.
 */
export function ModuleAsset({
  assetName,
  src,
  kind = "auto",
  logo,
  name,
  sub,
}: {
  /** Asset name resolved against the HL CDN (preferred). */
  assetName?: string;
  /** Explicit image URL (backend logo) — overrides the CDN convention. */
  src?: string | null;
  /** Override the URL convention — only useful for bare tickers (`spot`/`hip3`). */
  kind?: TokenKind;
  /** Escape hatch — override the avatar with arbitrary content. */
  logo?: ReactNode;
  name: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {logo != null ? (
        <div className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[9px] font-semibold overflow-hidden bg-surface-2 text-text-secondary">
          {logo}
        </div>
      ) : assetName ? (
        <TokenAvatar assetName={assetName} src={src} kind={kind} size="lg" />
      ) : null}
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium text-text-primary truncate">{name}</div>
        {sub != null && (
          <div className="mono text-[10px] text-text-tertiary truncate">{sub}</div>
        )}
      </div>
    </div>
  );
}

/** Titre de mini-section dans le corps d'un module (ex. "HIP-3 Perp DEXs"). */
export function ModuleSubhead({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 pt-2.5 pb-1.5 text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
      {children}
    </div>
  );
}
