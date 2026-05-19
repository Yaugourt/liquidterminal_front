"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  /** Pill `tag` de la maquette (ex. "$1.91B TVL"). */
  tag?: ReactNode;
  /** Libellé du lien « View all → » (ex. "All vaults"). */
  viewAllLabel?: string;
  /** Lien vers la page complète. */
  href: string;
  /** Corps de la carte : table ou liste de leaderboard. */
  children?: ReactNode;
  className?: string;
}

export const OverviewModule = memo(function OverviewModule({
  title,
  tag,
  viewAllLabel,
  href,
  children,
  className,
}: OverviewModuleProps) {
  return (
    <Card className={`flex flex-col ${className ?? ""}`}>
      {/* card-head — titre + pill tag + lien "View all →" */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
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

      {/* Corps */}
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
 * Table (.tbl de la maquette) — Vaults / Validators
 * ========================================================== */

export interface ModuleColumn {
  /** En-tête de colonne. */
  header: ReactNode;
  /** Alignement — la 1re colonne est à gauche, les autres à droite. */
  align?: "left" | "right";
}

/**
 * ModuleTable — table compacte calquée sur la `.tbl` de la maquette :
 * thead en `bg-surface-2`, en-têtes uppercase tertiaires, lignes au hover.
 */
export function ModuleTable({
  columns,
  children,
}: {
  columns: ModuleColumn[];
  children: ReactNode;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th
              key={i}
              className={`bg-surface-2 px-4 py-2 text-[10px] uppercase tracking-[0.05em] font-semibold text-text-tertiary border-b border-border-subtle ${
                (c.align ?? (i === 0 ? "left" : "right")) === "left"
                  ? "text-left"
                  : "text-right"
              }`}
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

/** Ligne de `ModuleTable` — cliquable si `href` fourni. */
export function ModuleTableRow({
  cells,
  href,
}: {
  /** Contenu de chaque cellule (alignement géré par `ModuleCell`). */
  cells: ReactNode[];
  href?: string;
}) {
  return (
    <tr className="border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors">
      {cells.map((cell, i) => (
        <ModuleCell key={i} href={href} first={i === 0}>
          {cell}
        </ModuleCell>
      ))}
    </tr>
  );
}

/** Cellule de table — la 1re colonne est alignée à gauche, les autres à droite. */
function ModuleCell({
  children,
  href,
  first,
}: {
  children: ReactNode;
  href?: string;
  first: boolean;
}) {
  const content = href ? (
    <Link href={href} className="block">
      {children}
    </Link>
  ) : (
    children
  );
  return (
    <td
      className={`px-4 py-2.5 text-[12.5px] ${
        first ? "text-left" : "text-right"
      }`}
    >
      {content}
    </td>
  );
}

/**
 * ModuleAsset — cellule « nom » d'une table : logo `rounded-md` + nom + sous-titre.
 * Calque le `.asset` de la maquette.
 */
export function ModuleAsset({
  logo,
  name,
  sub,
}: {
  logo: ReactNode;
  name: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[9px] font-semibold bg-brand/10 text-brand overflow-hidden">
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
    </div>
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
