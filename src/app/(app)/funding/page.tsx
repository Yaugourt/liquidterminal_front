import Image from "next/image";
import { Heart, Check, ArrowUpRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  sponsors,
  partners,
  sponsorTiers,
  fundingStats,
  donation,
  fundingContact,
  type FundingAccent,
} from "@/lib/funding-config";

/** Monogram tile accent, shared with the sidebar SponsorCard. */
const accentTile = (accent: FundingAccent = "brand"): string => {
  if (accent === "gold") return "border-gold/30 bg-gold/10 text-gold";
  if (accent === "neutral") return "border-border-default bg-surface-2 text-text-secondary";
  return "border-brand/30 bg-brand/10 text-brand";
};

export default function FundingPage() {
  const activeSponsors = sponsors;
  const contactHref = fundingContact.twitter || "#";

  return (
    <div className="space-y-10">
      <PageHeader
        title="Support Liquid Terminal"
        titleQualifier="sponsors and donors"
        description="Liquid Terminal is an independent, community-built data terminal for Hyperliquid. Sponsoring keeps it free, fast and free of ads. Here is how you can back it."
        actions={
          <Button asChild className="bg-brand text-brand-text-on hover:bg-brand/90">
            <a href={contactHref} target="_blank" rel="noopener noreferrer">
              <Heart className="w-4 h-4 mr-2" />
              Become a sponsor
            </a>
          </Button>
        }
      />

      {/* Traction */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {fundingStats.map((stat) => (
          <Card key={stat.label} padding="lg" interactive={false}>
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-text-tertiary">
              {stat.label}
            </div>
            <div className="mono text-3xl font-semibold text-text-primary mt-2">{stat.value}</div>
            {stat.sub && <div className="text-xs text-text-secondary mt-1">{stat.sub}</div>}
          </Card>
        ))}
      </section>

      {/* Pitch */}
      <section className="max-w-2xl space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Why sponsor us</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Everything above was reached organically, with next to no paid marketing. V2 is coming
          with a real comms push alongside our partners across the Hyperliquid ecosystem. A
          sponsorship is not equity and not a token: it is a straight deal for visibility, seen on
          every page of the terminal by an audience that trades on Hyperliquid every day.
        </p>
      </section>

      {/* Tiers */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Sponsorship tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sponsorTiers.map((tier) => (
            <Card
              key={tier.id}
              padding="lg"
              interactive={false}
              className={cn(
                "flex flex-col",
                tier.highlighted && "border-brand/40 bg-brand/[0.04]"
              )}
            >
              {tier.highlighted && (
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold text-brand mb-3">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </div>
              )}
              <div className="text-sm font-semibold text-text-primary">{tier.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="mono text-2xl font-semibold text-text-primary">{tier.price}</span>
              </div>
              {tier.priceAlt && (
                <div className="text-xs text-text-tertiary mt-0.5">{tier.priceAlt}</div>
              )}
              <p className="text-xs text-text-secondary mt-3">{tier.blurb}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-[13px] text-text-secondary">
                    <Check
                      className={cn(
                        "w-3.5 h-3.5 mt-0.5 shrink-0",
                        tier.highlighted ? "text-brand" : "text-text-tertiary"
                      )}
                    />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={tier.highlighted ? "default" : "outline"}
                className={cn("mt-5 w-full", tier.highlighted && "bg-brand text-brand-text-on hover:bg-brand/90")}
              >
                <a href={contactHref} target="_blank" rel="noopener noreferrer">
                  Sponsor this tier
                </a>
              </Button>
            </Card>
          ))}
        </div>
        <p className="text-xs text-text-tertiary">
          Prices are a starting point. Custom deals and one-time checks are welcome, reach out and we
          will figure out what fits.
        </p>
      </section>

      {/* Current sponsors */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Our sponsors</h2>
        {activeSponsors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSponsors.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3 hover:border-border-default transition-colors"
              >
                <span className="w-11 h-11 rounded-lg bg-surface-2 border border-brand/25 grid place-items-center shrink-0 overflow-hidden">
                  {s.logo ? (
                    <Image src={s.logo} alt="" width={44} height={44} className="object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-brand">{s.monogram}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary truncate">{s.name}</span>
                  <span className="block text-xs text-text-tertiary truncate">{s.tagline}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-brand transition-colors shrink-0" />
              </a>
            ))}
          </div>
        ) : (
          <Card padding="lg" interactive={false} className="border-dashed border-brand/30 bg-brand/[0.03]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary">This slot is open</div>
                <p className="text-xs text-text-secondary mt-1">
                  Be the first featured sponsor, front and center in the sidebar on every page.
                </p>
              </div>
              <Button asChild className="bg-brand text-brand-text-on hover:bg-brand/90 shrink-0">
                <a href={contactHref} target="_blank" rel="noopener noreferrer">
                  Claim the featured slot
                </a>
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Partners */}
      {partners.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Ecosystem partners</h2>
          <div className="flex flex-wrap gap-3">
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface pl-2.5 pr-4 py-2 hover:border-border-default transition-colors"
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold border",
                    accentTile(p.accent)
                  )}
                >
                  {p.monogram}
                </span>
                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                  {p.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Donate */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Donate</h2>
        <Card padding="lg" interactive={false}>
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-gold/10 grid place-items-center shrink-0">
              <Heart className="w-4 h-4 text-gold" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-text-primary">Chip in, any size</div>
              <p className="text-xs text-text-secondary mt-1">
                Not a sponsor but want to help keep the terminal running? Donations go straight to
                infrastructure and development.
              </p>
              {donation.address ? (
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-text-tertiary">
                    {donation.chainLabel}
                  </div>
                  <code className="mono block mt-1 text-xs text-text-primary break-all rounded-md bg-surface-2 border border-border-subtle px-3 py-2">
                    {donation.address}
                  </code>
                </div>
              ) : (
                <p className="text-xs text-text-tertiary mt-3">
                  A donation address is coming soon. In the meantime, reach out and we will point you
                  the right way.
                </p>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Contact */}
      <section className="rounded-lg border border-border-subtle bg-surface px-6 py-8 text-center space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Let us talk</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Sponsorship, a partnership, or just a question? Send a DM and we will get back to you.
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <Button asChild className="bg-brand text-brand-text-on hover:bg-brand/90">
            <a href={contactHref} target="_blank" rel="noopener noreferrer">
              Message us on X
            </a>
          </Button>
          {fundingContact.email && (
            <Button asChild variant="outline">
              <a href={`mailto:${fundingContact.email}`}>Email us</a>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
