"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HlNamesLogo } from "@/components/names/HlNamesLogo";
import { REFERRAL_DISCOUNT } from "@/services/names/mint";
import { useOnboardingStore } from "@/store/use-onboarding";
import { useDonateUi } from "@/store/use-donate-ui";

const KEY = "lt-hlnames-prompt";
/** Seconds on the site before it opens, once the welcome tour is done. */
const DELAY_MS = 12_000;
const NAMES_HREF = "/names";
/** Entrance delay of the nth block, after the card itself (see .prompt-item in globals.css). */
const stagger = (n: number) => ({ animationDelay: `${150 + n * 70}ms` });

function alreadyShown(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return true; // storage blocked: never show it, it could not stay "once"
  }
}
function markShown() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Not persisted: nothing else to do.
  }
}

/**
 * One-time invitation to mint a .hl name, for every visitor (signed in or
 * not). Opens once per browser, a few seconds after the welcome tour, never
 * over the donation card, never on the names page and never in a background
 * tab (it waits for the tab to be visible). Marked as shown the moment it
 * opens, so a reload or a second tab never brings it back.
 *
 * Eased in rather than popped: a slow fade and rise, a light backdrop, and no
 * autofocus on the field, so a phone keyboard never jumps up uninvited.
 */
export function HlNamesPrompt() {
  const onboarded = useOnboardingStore((s) => s.hasCompletedOnboarding);
  const donateOpen = useDonateUi((s) => s.open);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (open || !onboarded || donateOpen || !pathname || pathname.startsWith(NAMES_HREF) || alreadyShown()) return;
    const reveal = () => {
      if (document.visibilityState !== "visible" || alreadyShown()) return;
      document.removeEventListener("visibilitychange", reveal);
      markShown();
      setOpen(true);
    };
    const t = setTimeout(() => {
      reveal();
      document.addEventListener("visibilitychange", reveal);
    }, DELAY_MS);
    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", reveal);
    };
  }, [open, onboarded, donateOpen, pathname]);

  const pct = Math.round(REFERRAL_DISCOUNT * 100);
  const clean = label.trim().toLowerCase().replace(/\.hl$/, "").replace(/[\s./?#%]/g, "").slice(0, 30);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push(clean ? `${NAMES_HREF}?name=${encodeURIComponent(clean)}` : NAMES_HREF);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="prompt-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-base/55 p-4 backdrop-blur-[3px]">
          <DialogPrimitive.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="prompt-card relative w-full max-w-md overflow-hidden rounded-2xl border border-border-default bg-surface shadow-2xl shadow-black/40 outline-none"
          >
            <DialogPrimitive.Close
              aria-label="Close"
              className="focus-ring absolute right-3 top-3 z-10 rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
            <div className="relative px-6 pb-5 pt-7 bg-[radial-gradient(120%_90%_at_50%_0%,rgb(56_98_155/0.35),rgb(114_197_149/0.12)_45%,transparent_75%)]">
              <HlNamesLogo className="prompt-item h-12 w-12" />
              <DialogPrimitive.Title style={stagger(1)} className="prompt-item mt-4 text-[22px] font-semibold leading-tight text-text-primary text-balance">
                Your wallet deserves a name
              </DialogPrimitive.Title>
              <DialogPrimitive.Description style={stagger(1)} className="prompt-item mt-2 text-[13.5px] leading-relaxed text-text-secondary">
                Get a <span className="text-text-primary">.hl</span> name and show it instead of 0x… on Liquid Terminal, in
                your Telegram alerts and across Hyperliquid.
              </DialogPrimitive.Description>
              <p style={stagger(2)} className="prompt-item mt-4 inline-flex items-center rounded-full border border-gold/30 bg-gold/[0.08] px-2.5 py-1 text-[12px] text-text-secondary">
                <span className="mr-1 font-semibold text-gold">{pct}% off</span> when you mint on Liquid Terminal
              </p>
              <div style={stagger(3)} className="prompt-item mt-3 flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-2/60 px-3 py-2.5">
                <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-danger text-danger" />
                <p className="text-[12.5px] leading-relaxed text-text-secondary">
                  <span className="font-medium text-text-primary">Every name minted here funds Liquid Terminal.</span> Part
                  of the price goes to keeping the terminal free, open source and ad-free, at no extra cost to you.
                </p>
              </div>
            </div>

            <form onSubmit={submit} style={stagger(4)} className="prompt-item space-y-3 border-t border-border-subtle px-6 pb-4 pt-5">
              <label htmlFor="hlnames-prompt-name" className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Check a name
              </label>
              <div className="flex items-center rounded-lg border border-border-default bg-surface-2 transition-colors focus-within:border-brand/60">
                <input
                  id="hlnames-prompt-name"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="yourname"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={34}
                  className="mono min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[14px] text-text-primary outline-none placeholder:text-text-tertiary"
                />
                <span className="mono pr-3 text-[14px] text-text-tertiary">.hl</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <DialogPrimitive.Close className="focus-ring rounded text-[12.5px] text-text-tertiary transition-colors hover:text-text-primary">
                  No thanks
                </DialogPrimitive.Close>
                <Button type="submit" className="focus-ring gap-1.5 font-semibold">
                  {clean ? "Check availability" : "See names"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="pt-2 text-center text-[11px] text-text-tertiary">You&apos;ll only see this once.</p>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
