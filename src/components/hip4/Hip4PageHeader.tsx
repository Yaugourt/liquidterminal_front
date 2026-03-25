import Link from "next/link";
import { HIP4_CONFIG } from "@/lib/hip4/config";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Balance", value: "94.37 HYPE", sub: "Active deposited balance", accent: "text-brand-accent" },
  { label: "Platform fee", value: "0.9% / implicit", sub: "V1: 90 bps view · V2: from pools", accent: "text-brand-gold" },
  { label: "Active contests", value: "4", sub: "IDs: 595, 596, 604, 608" },
  { label: "Ownership", value: "0xe21c…0d135", sub: "Renounce disabled", small: true },
  { label: "Mainnet", value: "Not deployed", sub: "Testnet only", accent: "text-red-400" },
  { label: "Versions", value: "2", sub: "V1 reverse-engineered · V2 source + bytecode", accent: "text-brand-accent" },
];

export function Hip4PageHeader({ className }: { className?: string }) {
  return (
    <header className={cn("mb-8 space-y-6", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-white sm:text-xl">
            HIP-4 Contest Contract
          </h1>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            Prediction markets
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
