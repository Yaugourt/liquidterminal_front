import type { ReactNode } from "react";
import Link from "next/link";
import { HIP4_CONFIG } from "@/lib/hip4/config";
import { cn } from "@/lib/utils";

/** Minimal title block for HyperCore-first chapters (no EVM contract stats). */
export function Hip4ChapterHubHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  /** String or multiple lines / lists for clearer hierarchy */
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-6 space-y-2", className)}>
      <h1 className="font-inter text-lg font-semibold text-text-primary sm:text-xl">{title}</h1>
      {subtitle ? (
        <div className="max-w-prose space-y-2 text-xs leading-relaxed text-text-secondary">
          {typeof subtitle === "string" ? <p>{subtitle}</p> : subtitle}
        </div>
      ) : null}
    </header>
  );
}

/** Static facts about the third-party HIP-4 EVM contracts (V1/V2). Values
 * marked `dynamic` are RPC-derived snapshots — surface the snapshot date so
 * readers know they aren't auto-refreshing. Update via HIP4_CONFIG when the
 * on-chain state changes. */
const STATS_SNAPSHOT_DATE = HIP4_CONFIG.snapshotDate;
const STATS = [
  { label: "Balance", value: HIP4_CONFIG.snapshot.balance, sub: "Active deposited balance", accent: "text-brand", dynamic: true },
  { label: "Platform fee", value: "0.9% / implicit", sub: "V1: 90 bps view · V2: from pools", accent: "text-gold" },
  { label: "Active contests", value: HIP4_CONFIG.snapshot.activeContests, sub: HIP4_CONFIG.snapshot.activeContestIds, dynamic: true },
  { label: "Ownership", value: "0xe21c…0d135", sub: "Renounce disabled", small: true },
  { label: "Mainnet", value: "Not deployed", sub: "Testnet only", accent: "text-red-400" },
  { label: "Versions", value: "2", sub: "V1 reverse-engineered · V2 source + bytecode", accent: "text-brand" },
];

export function Hip4PageHeader({
  className,
  variant = "contracts",
}: {
  className?: string;
  /** `hub`: L1-first landing — no EVM addresses or contest stat grid. */
  variant?: "contracts" | "hub";
}) {
  if (variant === "hub") {
    return (
      <header className={cn("mb-8 space-y-4", className)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-inter text-lg font-semibold text-text-primary sm:text-xl">
              HIP-4 research
            </h1>
            <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
              HyperCore L1 · community doc
            </span>
          </div>
          <Link
            href="/hip4/HIP4-research-complete.md"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
          >
            Full markdown reference
          </Link>
        </div>
        <div className="max-w-prose space-y-2 text-xs leading-relaxed text-text-secondary">
          <p>
            Official HIP-4 flow is native HyperCore: market creation, CLOB trading, and{" "}
            <code className="font-mono text-[11px] text-brand">VoteGlobalAction</code>{" "}
            settlement.
          </p>
          <p>
            HyperEVM parimutuel contracts (V1/V2) are documented separately as third-party /
            unconfirmed — use the <strong className="text-text-secondary">Third-party EVM</strong>{" "}
            group in the sidebar.
          </p>
        </div>
      </header>
    );
  }

  return (
    <header className={cn("mb-8 space-y-6", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-inter text-lg font-semibold text-text-primary sm:text-xl">
            HIP-4 Contest Contract
          </h1>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            HyperEVM Mainnet
          </span>
        </div>
        <div className="flex flex-col gap-1 font-mono text-xs text-brand">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-secondary">V1</span>
            <span>{HIP4_CONFIG.contracts.v1.address}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-400/90">V2</span>
            <span>{HIP4_CONFIG.contracts.v2.address}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border-subtle bg-surface/50 p-3"
          >
            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-text-secondary">
              <span>{s.label}</span>
              {s.dynamic ? (
                <span className="rounded bg-surface-2 px-1 text-[9px] text-text-tertiary">
                  snapshot
                </span>
              ) : null}
            </div>
            <div
              className={cn(
                "mt-1 font-semibold text-text-primary",
                s.small && "font-mono text-sm",
                s.accent
              )}
            >
              {s.value}
            </div>
            <div className="mt-0.5 text-[10px] text-text-secondary leading-snug">{s.sub}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-tertiary">
        Dynamic stats (Balance, Active contests) are snapshots as of{" "}
        <span className="font-mono">{STATS_SNAPSHOT_DATE}</span>. Refresh via on-chain RPC scan on
        the V1/V2 contracts page for live values.
      </p>
    </header>
  );
}

export function Hip4SectionCardLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-border-subtle bg-white/[0.02] p-3 transition-colors hover:border-border-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <div className="text-xs font-bold text-brand">{title}</div>
      <div className="mt-1 text-[11px] text-text-secondary">{description}</div>
    </Link>
  );
}
