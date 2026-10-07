"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, Github, Heart, X } from "lucide-react";
import { donation, FUNDING_HREF } from "@/lib/funding-config";
import { useOnboardingStore } from "@/store/use-onboarding";
import { useDonateUi } from "@/store/use-donate-ui";
import { cn } from "@/lib/utils";

const KEY = "lt-donate-prompt";
/** The nudge comes back at most every 21 days; "I already donated" quiets it for 180. */
const SNOOZE_MS = 21 * 24 * 3600_000;
const DONATED_MS = 180 * 24 * 3600_000;
/** Delay after the welcome tour closes (or after load when it was already done). */
const DELAY_MS = 5_000;
const REPO = "https://github.com/Yaugourt/liquidterminal_front";

function quietUntil(): number {
  try {
    return Number(localStorage.getItem(KEY) ?? 0) || 0;
  } catch {
    return Number.POSITIVE_INFINITY; // storage blocked: never nag
  }
}
function quietFor(ms: number) {
  try {
    localStorage.setItem(KEY, String(Date.now() + ms));
  } catch {
    // Not persisted: the card simply won't come back this visit.
  }
}

/**
 * Donation card, bottom-left, never modal. Opens from the header heart, and
 * by itself on the first visit, a few seconds after the welcome tour closes
 * (never on top of it); then it stays quiet for 21 days (180 if they say
 * they donated). Never on the funding page.
 */
export function DonatePrompt() {
  const { open, source, show, hide } = useDonateUi();
  const onboarded = useOnboardingStore((s) => s.hasCompletedOnboarding);
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pathname || open || !onboarded || !donation.address || pathname.startsWith(FUNDING_HREF)) return;
    if (Date.now() < quietUntil()) return;
    const t = setTimeout(() => {
      if (Date.now() >= quietUntil()) {
        quietFor(SNOOZE_MS);
        show("prompt");
      }
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname, onboarded, open, show]);

  if (!open || !donation.address) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(donation.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the address stays selectable.
    }
  };
  const close = () => {
    if (source === "prompt") quietFor(SNOOZE_MS);
    hide();
  };

  return (
    <aside
      role="dialog"
      aria-labelledby="donate-title"
      className="fixed bottom-4 left-4 right-4 z-40 max-w-sm rounded-xl border border-border-default bg-surface p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 sm:right-auto lg:left-[248px]"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute right-2.5 top-2.5 rounded p-1 text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-danger/10">
          <Heart className="h-3.5 w-3.5 fill-danger text-danger" />
        </span>
        <h2 id="donate-title" className="text-sm font-semibold text-text-primary">
          Keep Liquid Terminal free
        </h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">
        No ads, no paywall, open source. If the terminal saves you time, a tip in HYPE or USDC keeps the servers and
        the data running.
      </p>

      <div className="mt-3 rounded-lg border border-border-subtle bg-surface-2 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">{donation.chainLabel}</span>
          <button
            type="button"
            onClick={copy}
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]",
              copied ? "text-success" : "text-brand hover:bg-brand/10"
            )}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mono mt-1 select-all break-all text-[11px] text-text-primary">{donation.address}</p>
        <p className="mt-1 text-[10px] text-text-tertiary">Same address on HyperCore: send from your Hyperliquid account.</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <Link href={FUNDING_HREF} onClick={hide} className="font-medium text-brand hover:underline">
          Sponsor the terminal
        </Link>
        <a href={REPO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-text-tertiary hover:text-text-primary">
          <Github className="h-3 w-3" /> Star on GitHub
        </a>
        <button
          type="button"
          onClick={() => {
            quietFor(DONATED_MS);
            hide();
          }}
          className="ml-auto text-text-tertiary hover:text-text-primary"
        >
          I already donated
        </button>
      </div>
    </aside>
  );
}

/** Header heart: opens the donation card on demand. */
export function DonateButton() {
  const show = useDonateUi((s) => s.show);
  if (!donation.address) return null;
  return (
    <button
      type="button"
      onClick={() => show("button")}
      aria-label="Donate to Liquid Terminal"
      title="Donate"
      className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 text-xs text-text-secondary hover:border-danger/40 hover:text-text-primary"
    >
      <Heart className="h-3.5 w-3.5 text-danger" />
      <span className="hidden sm:inline">Donate</span>
    </button>
  );
}
