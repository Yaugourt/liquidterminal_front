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
  subtitle?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-6 space-y-2", className)}>
      <h1 className="font-outfit text-lg font-semibold text-white sm:text-xl">{title}</h1>
      {subtitle ? (
        <p className="max-w-3xl text-xs text-text-secondary leading-relaxed">{subtitle}</p>
      ) : null}
    </header>
  );
}

const STATS = [
  { label: "Balance", value: "94.37 HYPE", sub: "Active deposited balance", accent: "text-brand-accent" },
  { label: "Platform fee", value: "0.9% / implicit", sub: "V1: 90 bps view · V2: from pools", accent: "text-brand-gold" },
  { label: "Active contests", value: "4", sub: "IDs: 595, 596, 604, 608" },
  { label: "Ownership", value: "0xe21c…0d135", sub: "Renounce disabled", small: true },
  { label: "Mainnet", value: "Not deployed", sub: "Testnet only", accent: "text-red-400" },
  { label: "Versions", value: "2", sub: "V1 reverse-engineered · V2 source + bytecode", accent: "text-brand-accent" },
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
            <h1 className="font-outfit text-lg font-semibold text-white sm:text-xl">
              HIP-4 research
            </h1>
            <span className="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-0.5 text-[11px] font-medium text-brand-accent">
              HyperCore L1 · community doc
            </span>
          </div>
          <Link
            href="/hip4/HIP4-research-complete.md"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-medium text-brand-gold underline decoration-brand-gold/40 underline-offset-2 hover:decoration-brand-gold"
          >
            Full markdown reference
          </Link>
        </div>
        <p className="max-w-3xl text-xs text-text-secondary leading-relaxed">
          Official HIP-4 flow is native HyperCore (creation, CLOB, VoteGlobalAction). The HyperEVM
          parimutuel contracts are documented separately as third-party / unconfirmed — see the EVM
          section in the nav.
        </p>
      </header>
    );
  }

  return (
    <header className={cn("mb-8 space-y-6", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-outfit text-lg font-semibold text-white sm:text-xl">
            HIP-4 Contest Contract
          </h1>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            Third-party EVM (testnet)
          </span>
        </div>
        <div className="flex flex-col gap-1 font-mono text-xs text-brand-accent">
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
            className="rounded-xl border border-border-subtle bg-brand-secondary/50 p-3"
          >
            <div className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
              {s.label}
            </div>
            <div
              className={cn(
                "mt-1 font-semibold text-white",
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
      className="block rounded-lg border border-border-subtle bg-white/[0.02] p-3 transition-colors hover:border-border-hover"
    >
      <div className="text-xs font-bold text-brand-accent">{title}</div>
      <div className="mt-1 text-[11px] text-text-secondary">{description}</div>
    </Link>
  );
}
