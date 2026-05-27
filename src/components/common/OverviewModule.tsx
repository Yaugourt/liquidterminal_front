"use client";

import {
  createContext,
  memo,
  useContext,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  getTokenIconUrl,
  getTokenInitials,
  type TokenKind,
} from "@/lib/tokenIconUrl";

/**
 * OverviewModule — la brique du Dashboard « vue d'ensemble ».
 *
 * Une carte = le résumé d'une page de l'app. En-tête « card-head » de la
 * maquette : titre + pill `tag` + lien « View all → » optionnel à droite.
 * Le corps accueille soit une table (`ModuleTable`), soit une liste de
 * leaderboard (`ModuleRow`). Toutes les pages se résument avec ce même
 * composant — cohérence garantie.
 */

interface OverviewModuleProps {
  title: string;
  /** Brand icon left of the title (V4 card-head). */
  icon?: ReactNode;
  /** `tag` pill from the mockup (e.g. "$1.91B TVL"). */
  tag?: ReactNode;
  /** Label of the "View all →" link (e.g. "All vaults"). */
  viewAllLabel?: string;
  /** Link to the full page. */
  href: string;
  /** Card body: a table or a leaderboard list. */
  children?: ReactNode;
  className?: string;
}

export const OverviewModule = memo(function OverviewModule({
  title,
  icon,
  tag,
  viewAllLabel,
  href,
  children,
  className,
}: OverviewModuleProps) {
  return (
    <Card className={`flex flex-col ${className ?? ""}`}>
      {/* V4 card-head — brand icon + title + tag pill + "View all →" link */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        {icon && (
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            {icon}
          </span>
        )}
        <h3 className="text-[13px] font-semibold text-text-primary truncate">
          {title}
        </h3>
        {tag != null && (
          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
            {tag}
          </span>
        )}
        <Link
          href={href}
          className="ml-auto shrink-0 flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          {viewAllLabel ?? "View all"}
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Body */}
      {children && <div className="flex-1 flex flex-col">{children}</div>}
    </Card>
  );
});

/* ============================================================
 * Leaderboard list (builder-row / perpdex-row de la maquette)
 * ========================================================== */

/** Une statistique value-au-dessus-du-label dans le bloc `b-stats`. */
export interface ModuleRowStat {
  label: string;
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
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors">
      <span className="mono w-5 shrink-0 text-[11px] font-semibold text-text-tertiary">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-[10px] font-semibold bg-brand/10 text-brand overflow-hidden">
        {logo}
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-text-primary truncate">
          {name}
        </div>
        {sub != null && (
          <div className="text-[10px] text-text-tertiary truncate">{sub}</div>
        )}
      </div>
      <div className="ml-auto flex shrink-0 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="text-right"
            style={s.width ? { width: s.width } : undefined}
          >
            <div
              className={`mono text-[12.5px] font-semibold ${
                s.valueClassName ?? "text-text-primary"
              }`}
            >
              {s.value}
            </div>
            <div className="text-[9px] uppercase tracking-[0.04em] text-text-tertiary">
              {s.label}
            </div>
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
                className={`bg-surface-2 ${
                  density === "compact" ? "px-3 py-1.5" : "px-4 py-2"
                } text-[10px] uppercase tracking-[0.05em] font-semibold text-text-tertiary border-b border-border-subtle ${
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
    </ModuleTableContext.Provider>
  );
}

/** A row of `ModuleTable`. Clickable when `href` is set. */
export function ModuleTableRow({
  cells,
  href,
}: {
  /** Cell content — alignment is owned by `columns[].align` on the parent table. */
  cells: ReactNode[];
  href?: string;
}) {
  return (
    <tr className="border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors">
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
        density === "compact" ? "px-3 py-1.5" : "px-4 py-2.5"
      } text-[12.5px] overflow-hidden ${
        align === "left" ? "text-left" : "text-right"
      }`}
    >
      {content}
    </td>
  );
}

/**
 * ModuleAsset — "name" cell of a leaderboard / asset row: rounded-md logo
 * square + name + optional sub-line. Mirrors the mockup's `.asset` block.
 *
 * Two ways to pass the avatar (mutually exclusive):
 *  - `assetName` — recommended. The component fetches the Hyperliquid icon
 *    from the official CDN via {@link getTokenIconUrl} and falls back to
 *    2-letter initials on error. Pass the full asset name including any
 *    `xyz:` prefix for HIP-3.
 *  - `logo` — escape hatch. Pass an arbitrary `ReactNode` (a custom string,
 *    a pre-rendered `<Image>`, etc.). Use only when `assetName` doesn't fit.
 */
export function ModuleAsset({
  assetName,
  kind = "auto",
  logo,
  name,
  sub,
}: {
  /** Asset name resolved against the HL CDN (preferred). */
  assetName?: string;
  /** Override the URL convention — only useful for bare tickers (`spot`/`hip3`). */
  kind?: TokenKind;
  /** Escape hatch — override the avatar with arbitrary content. */
  logo?: ReactNode;
  name: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[9px] font-semibold bg-brand/10 text-brand overflow-hidden">
        {assetName ? (
          <AssetAvatarImage assetName={assetName} kind={kind} />
        ) : (
          logo
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-text-primary truncate">
          {name}
        </div>
        {sub != null && (
          <div className="text-[10px] text-text-tertiary truncate">{sub}</div>
        )}
      </div>
    </div>
  );
}

/** HL CDN icon with 2-initials fallback on error. */
function AssetAvatarImage({
  assetName,
  kind,
}: {
  assetName: string;
  kind: TokenKind;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <>{getTokenInitials(assetName)}</>;
  }
  return (
    <Image
      src={getTokenIconUrl(assetName, kind)}
      alt={assetName}
      width={24}
      height={24}
      className="w-full h-full object-cover"
      onError={() => setErrored(true)}
      unoptimized
    />
  );
}

/** Titre de mini-section dans le corps d'un module (ex. "HIP-3 Perp DEXs"). */
export function ModuleSubhead({ children }: { children: ReactNode }) {
  return (
    <div className="px-3.5 pt-2.5 pb-1.5 text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
      {children}
    </div>
  );
}
