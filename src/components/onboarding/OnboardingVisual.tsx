"use client";

import Image from "next/image";
import { Search, Wallet } from "lucide-react";
import type { OnboardingStep } from "./onboardingSteps";

/**
 * Abstract, token-only illustrations for each tour step.
 * Everything is built in CSS (gradients, orbs, mini mock-tiles) — no binary
 * assets besides the existing `/logo.svg`.
 */

/** Blurred brand/gold orbs shared by every step — the subtle V4 halo. */
function Halo() {
  return (
    <>
      <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-6 h-28 w-40 rounded-full bg-gold/[0.06] blur-3xl" />
    </>
  );
}

/** Brand moment: logo inside a glowing tile. */
function WelcomeVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <Halo />
      <div className="relative">
        <div className="absolute inset-0 -m-6 rounded-full bg-brand/20 blur-2xl" />
        <div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-brand/25 bg-surface-2/80 shadow-lg shadow-black/30">
          <Image src="/logo.svg" alt="Liquid Terminal" width={44} height={44} className="h-11 w-11" />
        </div>
      </div>
    </div>
  );
}

/** Mini KPI tiles + a tiny histogram — echoes the dashboard PulseBar. */
function DashboardVisual() {
  const bars = [34, 58, 42, 72, 50, 88, 64, 46];
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 px-10">
      <Halo />
      <div className="relative grid w-full max-w-[300px] grid-cols-3 gap-1.5">
        {["brand", "gold", "brand"].map((tone, i) => (
          <div key={i} className="rounded-md border border-border-subtle bg-surface-2/70 p-2">
            <div className="h-1 w-8 rounded bg-surface-3" />
            <div className={`mt-1.5 h-2 w-12 rounded ${tone === "gold" ? "bg-gold/50" : "bg-brand/50"}`} />
          </div>
        ))}
      </div>
      <div className="relative flex h-10 w-full max-w-[300px] items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${i === 5 ? "bg-brand/70" : "bg-brand/25"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Mock directory rows with signed change chips. */
function MarketVisual() {
  const rows: { up: boolean; w: string }[] = [
    { up: true, w: "w-20" },
    { up: false, w: "w-14" },
    { up: true, w: "w-24" },
  ];
  return (
    <div className="relative flex h-full items-center justify-center px-10">
      <Halo />
      <div className="relative w-full max-w-[300px] space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2/70 px-2.5 py-2">
            <div className="h-5 w-5 shrink-0 rounded-md bg-brand/20" />
            <div className={`h-2 ${r.w} rounded bg-surface-3`} />
            <div className={`ml-auto h-2 w-9 rounded ${r.up ? "bg-success/50" : "bg-danger/50"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Chain of linked blocks, latest one pulsing — the live feed feel. */
function ExplorerVisual() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4">
      <Halo />
      <div className="relative flex items-center">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            {i > 0 && <div className="h-px w-5 bg-border-default" />}
            <div
              className={`grid h-9 w-9 place-items-center rounded-md border ${
                i === 3
                  ? "border-brand/40 bg-brand/15"
                  : "border-border-subtle bg-surface-2/70"
              }`}
            >
              <div className={`h-2.5 w-2.5 rounded-sm ${i === 3 ? "animate-pulse bg-brand/80" : "bg-surface-3"}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex items-center gap-1.5 rounded-md border border-success/25 bg-success/10 px-2 py-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-success">Live</span>
      </div>
    </div>
  );
}

/** Fanned stack of article cards. */
function WikiVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <Halo />
      <div className="relative h-[92px] w-[190px]">
        <div className="absolute inset-x-4 top-0 h-full -rotate-3 rounded-lg border border-border-subtle bg-surface-2/50" />
        <div className="absolute inset-x-2 top-1 h-full rotate-2 rounded-lg border border-border-subtle bg-surface-2/70" />
        <div className="absolute inset-0 top-2 rounded-lg border border-border-default bg-surface p-3">
          <div className="h-2 w-20 rounded bg-brand/40" />
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-full rounded bg-surface-3" />
            <div className="h-1.5 w-4/5 rounded bg-surface-3" />
            <div className="h-1.5 w-3/5 rounded bg-surface-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mock command palette with the ⌘K hint. */
function SearchVisual() {
  return (
    <div className="relative flex h-full items-center justify-center px-10">
      <Halo />
      <div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border border-brand/30 bg-surface shadow-lg shadow-black/30">
        <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2.5">
          <Search size={13} className="shrink-0 text-text-tertiary" />
          <div className="h-2 w-24 rounded bg-surface-3" />
          <kbd className="mono ml-auto shrink-0 rounded-md border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-brand">
            ⌘K
          </kbd>
        </div>
        <div className="space-y-1 p-2">
          <div className="flex items-center gap-2 rounded-md bg-brand/10 px-2 py-1.5">
            <div className="h-4 w-4 rounded bg-brand/25" />
            <div className="h-1.5 w-20 rounded bg-surface-3" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-4 w-4 rounded bg-surface-3" />
            <div className="h-1.5 w-14 rounded bg-surface-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mini sidebar mock + wallet chip — "make it yours". */
function SetupVisual() {
  return (
    <div className="relative flex h-full items-center justify-center gap-5">
      <Halo />
      <div className="relative w-[72px] rounded-lg border border-border-default bg-surface p-2">
        <div className="mb-2 flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-brand/40" />
          <div className="h-1.5 w-7 rounded bg-surface-3" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded bg-brand/30" />
          <div className="h-1.5 w-4/5 rounded bg-surface-3" />
          <div className="h-1.5 w-full rounded bg-surface-3" />
          <div className="h-1.5 w-3/5 rounded bg-surface-3" />
        </div>
      </div>
      <div className="relative flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2">
        <Wallet size={14} className="text-brand" />
        <div className="h-2 w-14 rounded bg-brand/30" />
      </div>
    </div>
  );
}

interface OnboardingVisualProps {
  stepId: OnboardingStep["id"];
}

/** Resolves a step id to its abstract illustration. */
export function OnboardingVisual({ stepId }: OnboardingVisualProps) {
  switch (stepId) {
    case "welcome":
      return <WelcomeVisual />;
    case "dashboard":
      return <DashboardVisual />;
    case "market":
      return <MarketVisual />;
    case "explorer":
      return <ExplorerVisual />;
    case "wiki":
      return <WikiVisual />;
    case "search":
      return <SearchVisual />;
    case "setup":
      return <SetupVisual />;
  }
}
