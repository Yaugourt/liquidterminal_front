"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * OverviewModule — la brique du Dashboard « vue d'ensemble ».
 *
 * Une carte = le résumé d'une page de l'app : en-tête (icône + nom + lien),
 * une bande de KPI phares, puis un mini-aperçu (top 3, flux court…).
 * Toutes les pages se résument avec ce même composant — cohérence garantie.
 */

export interface ModuleStat {
  label: string;
  value: ReactNode;
}

interface OverviewModuleProps {
  title: string;
  icon: LucideIcon;
  /** Lien vers la page complète. */
  href: string;
  /** KPI phares de la page (2 à 4). */
  stats: ModuleStat[];
  /** Mini-aperçu (liste top 3, flux…). */
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const OverviewModule = memo(function OverviewModule({
  title,
  icon: Icon,
  href,
  stats,
  children,
  isLoading,
  className,
}: OverviewModuleProps) {
  return (
    <Card className={`flex flex-col ${className ?? ""}`}>
      {/* En-tête — toute la barre est cliquable */}
      <Link
        href={href}
        className="group flex items-center justify-between gap-2 px-4 py-3 border-b border-border-subtle hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-brand" />
          </div>
          <h3 className="text-[13px] font-semibold text-text-primary truncate">{title}</h3>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-medium text-text-tertiary group-hover:text-brand transition-colors shrink-0">
          View
          <ArrowUpRight size={12} />
        </span>
      </Link>

      {/* Bande de KPI */}
      <div
        className="grid bg-surface-2/40 border-b border-border-subtle"
        style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-3.5 py-2.5 ${i > 0 ? "border-l border-border-subtle" : ""}`}
          >
            <div className="text-[9px] uppercase tracking-[0.08em] text-text-tertiary font-medium mb-0.5 truncate">
              {s.label}
            </div>
            <div className="mono text-[15px] leading-tight font-semibold text-text-primary">
              {isLoading ? <span className="text-text-tertiary">…</span> : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Mini-aperçu */}
      {children && <div className="flex-1 flex flex-col">{children}</div>}
    </Card>
  );
});

/**
 * ModuleRow — ligne de mini-liste partagée par tous les modules.
 * `href` la rend cliquable ; sinon ligne statique.
 */
export function ModuleRow({
  left,
  right,
  href,
}: {
  left: ReactNode;
  right: ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-surface-2 transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1">{left}</div>
      <div className="flex items-center gap-3 shrink-0">{right}</div>
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

/** Titre de mini-section dans le corps d'un module. */
export function ModuleSubhead({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pt-2.5 pb-1 text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
      {children}
    </div>
  );
}
