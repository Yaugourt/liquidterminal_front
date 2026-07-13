"use client";

import Link from "next/link";
import Image from "next/image";
import { ExplorerSearchBar } from "@/components/explorer/ExplorerSearchBar";
import { KpiRibbon, type KpiCell } from "@/components/common";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useHypePrice } from "@/services/market/hype/hooks";
import { compactUsd, formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { trackBotCta, trackConnectStarted } from "@/lib/analytics";

/**
 * Landing "Command House" (dash-mockups/home-v4-D-command-house.html):
 * Command's arrive-and-search hero on top of Open House's narrative
 * sections. Bot CTAs stay href="#" until the public bot handle ships.
 */

const NAV_LINKS = [
  { label: "Market", href: "/market" },
  { label: "Explorer", href: "/explorer" },
  { label: "Vaults", href: "/explorer/vaults" },
  { label: "HYPE", href: "/hype" },
  { label: "Wiki", href: "/wiki" },
] as const;

const SEARCH_CHIPS = [
  { label: "Token", href: "/market/spot" },
  { label: "Wallet", href: "/market/tracker" },
  { label: "Validator", href: "/explorer/validator" },
  { label: "Vault", href: "/explorer/vaults" },
  { label: "Perp DEX", href: "/market/perpdex" },
  { label: "Builder", href: "/market/builders" },
  { label: "Tx hash", href: "/explorer" },
] as const;

function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-brand">
      <rect x="1" y="1" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5v7h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TopNav() {
  return (
    <header className="border-b border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoMark />
          <span className="font-inter text-[14px] font-semibold tracking-tight">Liquid Terminal</span>
        </Link>
        <nav className="hidden md:flex items-center gap-3 text-[12.5px] text-text-tertiary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="inline-block px-1 py-3.5 -my-3.5 hover:text-text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="#"
            onClick={() => trackBotCta("landing-nav")}
            className="h-8 px-3 inline-flex items-center rounded-md text-xs font-medium border border-gold/40 text-gold hover:bg-gold/10"
          >
            Bot
          </a>
          <Link
            href="/dashboard"
            onClick={() => trackConnectStarted("landing-nav")}
            className="h-8 px-3 inline-flex items-center rounded-md text-xs font-semibold bg-brand text-brand-text-on hover:bg-brand/90"
          >
            Connect
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="py-20 flex flex-col items-center text-center">
      <div className="mono text-[11px] font-semibold tracking-[0.18em] uppercase text-brand mb-4">
        Open-source · MIT · Free forever
      </div>
      <h1 className="font-inter font-semibold tracking-tight text-[34px] sm:text-[48px] leading-[1.08]">
        The Hyperliquid terminal.
      </h1>
      <p className="text-sm text-text-secondary mt-4 max-w-xl">
        Markets, vaults, validators, wallets. Free, real time.
      </p>

      <div className="w-full max-w-2xl mt-8">
        <ExplorerSearchBar className="w-full" />
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {SEARCH_CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="rounded-md border border-border-subtle bg-surface-2 px-2.5 py-1 text-[11px] text-text-secondary hover:text-text-primary"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LivePulse() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { price: hypePrice } = useHypePrice();
  const { format } = useNumberFormat();

  const loading = "…";
  const formatCount = (value: number | null | undefined): string => {
    if (value == null || !Number.isFinite(value)) return "—".replace("—", "-");
    return formatNumber(value, format, { maximumFractionDigits: 0 });
  };

  const cells: KpiCell[] = [
    {
      label: "HYPE",
      value: hypePrice != null ? formatPrice(hypePrice, format) : loading,
      sub: "live",
    },
    {
      label: "24h Volume",
      value: statsLoading && !stats ? loading : compactUsd(stats?.dailyVolume),
      sub: "perps + spot",
    },
    {
      label: "Open Interest",
      value: compactUsd(perpStats?.totalOpenInterest),
      sub: "all perp markets",
    },
    {
      label: "HYPE Staked",
      value: statsLoading && !stats ? loading : formatCount(stats?.totalHypeStake),
      sub: "across validators",
    },
    {
      label: "Vaults TVL",
      value: statsLoading && !stats ? loading : compactUsd(stats?.vaultsTvl),
      sub: "all vaults",
      tone: "gold",
    },
    {
      label: "Users",
      value: statsLoading && !stats ? loading : formatCount(stats?.numberOfUsers),
      sub: "all time",
    },
  ];

  return (
    <section>
      <KpiRibbon cells={cells} columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6" />
    </section>
  );
}

interface ScreenShotProps {
  src: string;
  alt: string;
  url: string;
  name: string;
  caption: string;
  href: string;
  priority?: boolean;
}

function ScreenShot({ src, alt, url, name, caption, href, priority }: ScreenShotProps) {
  return (
    <div>
      <div className="rounded-lg border border-border-default overflow-hidden shadow-2xl shadow-black/50 bg-surface">
        <div className="h-8 px-3 flex items-center gap-1.5 bg-surface-2 border-b border-border-subtle">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-gold/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/40" />
          <span className="mx-auto mono text-[10px] text-text-tertiary bg-base rounded px-2 py-0.5">{url}</span>
          <span className="w-10" aria-hidden="true" />
        </div>
        <Image src={src} alt={alt} width={1232} height={800} priority={priority} className="block w-full h-auto" />
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-3 px-1">
        <span className="text-[13px] font-medium text-text-primary">{name}</span>
        <span className="text-[12px] text-text-secondary">{caption}</span>
        <Link href={href} className="ml-auto mono text-[11.5px] text-brand hover:text-brand-hover inline-block px-1.5 py-2.5 -my-2.5">
          Open →
        </Link>
      </div>
    </div>
  );
}

function InsideTheTerminal() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-2xl space-y-3">
        <h2 className="font-inter text-[30px] sm:text-[36px] font-semibold tracking-tight leading-tight">
          Inside the terminal.
        </h2>
        <p className="text-[15.5px] leading-relaxed text-text-secondary">
          The HYPE page, validators and spot markets, straight from the app.
        </p>
      </div>

      <div className="mt-10">
        <ScreenShot
          src="/landing/shot-hype.png"
          alt="HYPE page: supply, buybacks, revenue and burn"
          url="liquidterminal.xyz/hype"
          name="HYPE"
          caption="supply & scarcity, Assistance Fund flywheel, revenue & burn, staking"
          href="/hype"
          priority
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <ScreenShot
          src="/landing/shot-validator.png"
          alt="Validators: network health and stake concentration"
          url="liquidterminal.xyz/explorer/validator"
          name="Validators"
          caption="health, stake concentration, governance votes"
          href="/explorer/validator"
        />
        <ScreenShot
          src="/landing/shot-spot.png"
          alt="Spot markets: stablecoin liquidity, fees, auctions"
          url="liquidterminal.xyz/market/spot"
          name="Spot"
          caption="stablecoin liquidity, volume concentration, deploy auctions"
          href="/market/spot"
        />
      </div>
    </section>
  );
}

interface ProviderCardProps {
  initials: string;
  name: string;
  description: string;
  domain: string;
  endpoints: number;
  href: string;
}

function ProviderCard({ initials, name, description, domain, endpoints, href }: ProviderCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-surface border border-border-subtle rounded-lg p-5 flex flex-col gap-4 hover:border-border-default transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border-subtle flex items-center justify-center text-[13px] font-semibold text-text-secondary">
          {initials}
        </div>
        <span className="text-[13px] text-text-tertiary group-hover:text-brand transition-colors">↗</span>
      </div>
      <div className="space-y-1">
        <div className="text-[14px] font-medium text-text-primary">{name}</div>
        <div className="text-[12px] leading-relaxed text-text-secondary">{description}</div>
      </div>
      <div className="mt-auto flex items-baseline justify-between">
        <span className="mono text-[10.5px] text-text-tertiary">{domain}</span>
        <span className="mono text-[11.5px] text-text-secondary">
          <span className="text-text-primary font-medium">{endpoints}</span> endpoints
        </span>
      </div>
    </a>
  );
}

function DataSources() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-20 border-t border-border-subtle">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="max-w-2xl space-y-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-brand font-medium">Built with</div>
          <h2 className="font-inter text-[30px] sm:text-[36px] font-semibold tracking-tight leading-tight">
            Data sources.
          </h2>
          <p className="text-[15.5px] leading-relaxed text-text-secondary">
            The official node API plus independent providers. Every chart cites its source.
          </p>
        </div>
      </div>

      <a
        href="https://hypedexer.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group block mt-10 bg-surface border border-brand/30 rounded-lg p-6 hover:border-brand/50 transition-colors"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4 lg:w-[300px] shrink-0">
            <div className="w-12 h-12 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center text-[15px] font-semibold text-brand">
              HD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold text-text-primary">HypeDexer</span>
                <span className="text-[13px] text-text-tertiary group-hover:text-brand transition-colors">↗</span>
              </div>
              <span className="inline-flex items-center gap-1.5 mt-1 text-[10.5px] px-2 py-0.5 rounded-md bg-brand/10 border border-brand/25 text-brand font-medium uppercase tracking-[0.06em]">
                Primary data provider
              </span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary min-w-0 flex-1">
            The data engine of the terminal, built by Enigma Validator. One unified API across HyperCore, HyperEVM,
            HIP-3 and builders: fills, liquidations, TWAPs, vaults and 247M+ historical trades, over REST and WebSocket.
          </p>
          <div className="flex lg:flex-col items-baseline lg:items-end gap-2 lg:gap-0 shrink-0">
            <div className="mono text-[26px] font-medium tracking-[-0.01em] text-brand leading-none">61</div>
            <div className="text-[10.5px] text-text-tertiary lg:mt-1.5">endpoints in production</div>
          </div>
        </div>
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <ProviderCard
          initials="HL"
          name="Hyperliquid"
          description="The official node API. Prices, order books, funding, staking and vaults, streamed live over WebSocket."
          domain="hyperliquid.xyz"
          endpoints={29}
          href="https://hyperliquid.xyz"
        />
        <ProviderCard
          initials="HS"
          name="Hypurrscan"
          description="The reference L1 explorer. Protocol fees, deploy auctions, unstaking queue and stablecoin supply."
          domain="hypurrscan.io"
          endpoints={7}
          href="https://hypurrscan.io"
        />
        <ProviderCard
          initials="DL"
          name="DefiLlama"
          description="The largest open-source TVL aggregator. Bridge flows, stablecoins and per-project TVL, fees and volume."
          domain="defillama.com"
          endpoints={4}
          href="https://defillama.com"
        />
      </div>

      <p className="mt-6 text-[12px] text-text-tertiary">
        Plus our own indexing pipelines for what no upstream keeps: liquidation history, revenue aggregation,
        governance votes, served back to the community on the free Liquid Terminal API.
      </p>
    </section>
  );
}

const CHARTER_ITEMS = [
  { label: "All site data", note: "forever" },
  { label: "The code", note: "MIT" },
  { label: "Base API quotas", note: "build on us" },
  { label: "Essential bot alerts", note: "included" },
] as const;

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-success" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CharterAndBot() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-20 border-t border-border-subtle">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
          <div className="flex items-baseline gap-2 px-4 py-3 border-b border-border-subtle">
            <h3 className="text-[13px] font-medium text-text-primary truncate">Free forever</h3>
            <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">the charter</span>
          </div>
          <div className="px-4 py-4 space-y-4">
            <p className="text-[13.5px] leading-relaxed text-text-secondary">
              Liquid Terminal is a public good. Site data never sits behind a paywall. That is written into the charter.
            </p>
            <div className="space-y-0">
              {CHARTER_ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 py-2.5 ${i < CHARTER_ITEMS.length - 1 ? "border-b border-border-subtle" : ""}`}
                >
                  <CheckIcon />
                  <span className="text-[12.5px] text-text-primary">{item.label}</span>
                  <span className="ml-auto text-[11px] text-text-tertiary">{item.note}</span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-text-tertiary">
              Embed our widgets, fork the repo, or build your own app on the free API.
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
          <div className="flex items-baseline gap-2 px-4 py-3 border-b border-border-subtle">
            <h3 className="text-[13px] font-medium text-text-primary truncate">Alerts on Telegram</h3>
            <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">Telegram · 24/7</span>
          </div>
          <div className="px-4 py-4 space-y-4">
            <p className="text-[13.5px] leading-relaxed text-text-secondary">
              Fills, liquidations, vault moves and governance, pushed as they happen. You set the threshold, the bot
              watches it.
            </p>
            <div className="bg-surface-2 rounded-lg p-3 mono text-[12px] leading-relaxed border border-border-subtle max-w-md">
              <div className="flex items-center gap-2 text-[10px] text-text-tertiary mb-1.5">
                <span className="font-semibold text-text-secondary">LiquidTerminal Bot</span>
                <span>14:32</span>
              </div>
              <div className="text-text-primary">
                ⚡ Fill: <span className="text-brand">0x8bc…e9b1</span> bought 12,400 HYPE @ $65.31 ·{" "}
                <span className="text-gold">$809K</span>
              </div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3 mono text-[12px] leading-relaxed border border-border-subtle max-w-md">
              <div className="flex items-center gap-2 text-[10px] text-text-tertiary mb-1.5">
                <span className="font-semibold text-text-secondary">LiquidTerminal Bot</span>
                <span>14:35</span>
              </div>
              <div className="text-text-primary">
                🔻 Liq: <span className="text-brand">0x7a3f…9c2e</span> lost <span className="text-danger">$1.2M</span>{" "}
                BTC long @ $96,410
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#"
                onClick={() => trackBotCta("landing-bot-card")}
                className="h-9 px-4 inline-flex items-center rounded-md text-[12.5px] font-semibold bg-gold/10 border border-gold/40 text-gold hover:bg-gold/20"
              >
                Set your first alert
              </a>
              <span className="text-[11px] text-text-tertiary">Essentials free · pro alerts fund the public good</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LogoMark size={16} />
            <span className="font-inter text-[13px] font-semibold tracking-tight">Liquid Terminal</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-text-tertiary max-w-[260px]">
            Open source. Free API. Built for Hyperliquid.
          </p>
        </div>
        <div className="space-y-2.5">
          <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">Terminal</div>
          <div className="flex flex-col gap-2 text-[12px] text-text-secondary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="inline-block py-1 hover:text-text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">Open</div>
          <div className="flex flex-col gap-2 text-[12px] text-text-secondary">
            <a
              href="https://github.com/Liquid-Terminal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-1 hover:text-text-primary"
            >
              GitHub
            </a>
            <a
              href="https://x.com/liquidterminal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-1 hover:text-text-primary"
            >
              X
            </a>
            <Link href="/legal/terms" className="inline-block py-1 hover:text-text-primary">
              Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CommandHouse() {
  return (
    <div className="min-h-screen bg-base text-text-primary antialiased">
      <TopNav />
      <div className="max-w-[1280px] mx-auto px-6">
        <Hero />
        <LivePulse />
      </div>
      <InsideTheTerminal />
      <DataSources />
      <CharterAndBot />
      <Footer />
    </div>
  );
}
