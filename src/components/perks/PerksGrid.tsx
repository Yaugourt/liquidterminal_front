"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { useAuthContext } from "@/contexts/auth.context";
import { usePerks, type Perk } from "@/services/perks";

/** A code the user copies; the button says when it is done. */
function PerkCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="focus-ring inline-flex items-center gap-2 rounded-md border border-dashed border-gold/40 bg-gold/10 px-2.5 py-1.5 mono text-[13px] text-gold hover:border-gold/60"
      aria-label={`Copy code ${code}`}
    >
      {code}
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function PerkAction({ cta }: { cta: NonNullable<Perk["cta"]> }) {
  // Internal routes stay in the app; anything else must be https (the backend lists only those).
  if (cta.href.startsWith("/")) {
    return (
      <Button asChild variant="ghostBrand" size="sm">
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    );
  }
  if (!cta.href.startsWith("https://")) return null;
  return (
    <Button asChild variant="ghostBrand" size="sm">
      <a href={cta.href} target="_blank" rel="noopener noreferrer">
        {cta.label} <ExternalLink />
      </a>
    </Button>
  );
}

function PerkCard({ perk, onUnlock }: { perk: Perk; onUnlock: () => void }) {
  return (
    <Card padding="none" className="flex flex-col">
      <div className="flex-1 space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <a
            href={perk.partnerUrl.startsWith("https://") ? perk.partnerUrl : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary hover:text-brand"
          >
            {perk.partner}
          </a>
          {perk.access === "members" && (
            <span className="text-[10px] uppercase tracking-[0.08em] text-gold">Members</span>
          )}
        </div>
        <h2 className="text-[15px] font-semibold text-text-primary">{perk.title}</h2>
        <p className="text-[12.5px] leading-relaxed text-text-secondary">{perk.description}</p>
        {perk.expires && <p className="text-[11.5px] text-text-tertiary">Until {perk.expires} (UTC)</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle p-4">
        {perk.locked ? (
          <Button variant="ghostBrand" size="sm" onClick={onUnlock}>
            <Lock /> Sign in to unlock
          </Button>
        ) : (
          <>
            {perk.code && <PerkCode code={perk.code} />}
            {perk.cta && <PerkAction cta={perk.cta} />}
          </>
        )}
      </div>
    </Card>
  );
}

/**
 * Partner offers. Everyone sees what each offer is; the code and link of a
 * members offer come from the backend only once the user is signed in.
 */
export function PerksGrid() {
  const { authenticated, login } = useAuthContext();
  const { perks, isLoading, error } = usePerks(authenticated);

  if (isLoading && perks.length === 0) {
    return (
      <p className="inline-flex items-center gap-2 text-[13px] text-text-tertiary">
        <InlineSpinner className="h-3.5 w-3.5" /> Loading offers…
      </p>
    );
  }
  if (error && perks.length === 0) {
    return <p className="text-[13px] text-danger">Offers could not be loaded. Retry in a minute.</p>;
  }
  if (perks.length === 0) {
    return <p className="text-[13px] text-text-tertiary">No offer running right now.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-start">
      {perks.map((perk) => (
        <PerkCard key={perk.id} perk={perk} onUnlock={() => void login()} />
      ))}
    </div>
  );
}
