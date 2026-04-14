
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ArrowDown, TrendingUp } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tiny fade-in-on-scroll wrapper (replaces framer-motion whileInView) */
/* ------------------------------------------------------------------ */

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero fade-in (initial load, not scroll-triggered)                  */
/* ------------------------------------------------------------------ */

function HeroFadeIn({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "h2";
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Tag
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (replaces @iconify/react)                         */
/* ------------------------------------------------------------------ */

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const socials = [
  { name: "Discord", href: "#", Icon: DiscordIcon },
  { name: "Twitter", href: "https://x.com/liquidterminal", Icon: XIcon },
  { name: "Github", href: "https://github.com/Liquid-Terminal", Icon: GithubIcon },
];

const reasons = [
  {
    hypurr: "/hypurr/sherlock.png",
    stat: "01",
    label: "Unified",
    title: "Scattered data, fragmented insights",
    problem: "Market data, liquidations, and vault metrics live across multiple dashboards.",
    solution: "One unified terminal. Real-time spot, perps, auctions, and liquidations — all in one view.",
    accent: "accent" as const,
  },
  {
    hypurr: "/hypurr/handshake.png",
    stat: "02",
    label: "Verified",
    title: "Trust, transparency, proof",
    problem: "You need to verify what you see. Raw data without context can mislead.",
    solution: "On-chain verified data. Explorer, validators, and transaction history — trace everything back.",
    accent: "gold" as const,
  },
  {
    hypurr: "/hypurr/saiyan.png",
    stat: "03",
    label: "Execution",
    title: "From discovery to execution",
    problem: "Finding opportunities is one thing. Acting on them is another.",
    solution: "Discover trending tokens, track auctions, monitor vaults — then move with confidence.",
    accent: "accent" as const,
  },
];

const screenshots = [
  { title: "Market overview", subtitle: "Spot, perps, auctions", border: "border-[#83E9FF]/20" },
  { title: "Explorer & liquidations", subtitle: "On-chain verified", border: "border-[#f9e370]/20" },
  { title: "Dashboard & analytics", subtitle: "Portfolio, fees, trends", border: "border-[#83E9FF]/20" },
];

const apiProviders = [
  { name: "HyperLiquid", href: "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api", logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg" },
  { name: "HypurrScan", href: "https://api.hypurrscan.io/ui/#/Experimental/hypurrscanAPI.get%20spotUSDC", logo: "/hypurrscan.jpg" },
  { name: "DefiLlama", href: "https://api-docs.defillama.com/", logo: "/defillama.jpg" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SectionsEditorialPremium() {
  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#0B0E14] font-inter scroll-smooth pb-[env(safe-area-inset-bottom,0)]">
      {/* Hero/global gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: "#0B0E14" }} />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(131,233,255,0.08), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 70% at 50% 100%, rgba(249,227,112,0.1), transparent 50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: "linear-gradient(to top, rgba(249,227,112,0.06), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(to right, transparent, rgba(131,233,255,0.3), transparent)",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 backdrop-blur-xl border-b border-white/[0.04] min-h-[56px] sm:min-h-[60px]"
        style={{
          background: "linear-gradient(to bottom, rgba(11,14,20,0.98) 0%, rgba(11,14,20,0.92) 50%, rgba(11,14,20,0) 100%)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 min-w-0 shrink">
          <Image src="/logo.svg" alt="Liquid Terminal" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
          <span className="font-inter text-base sm:text-lg text-white tracking-tight whitespace-nowrap truncate">
            Liquid <span className="text-[#83E9FF]">Terminal</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {socials.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#a1a1aa] hover:text-[#83E9FF] hover:bg-white/[0.06] transition-all duration-200"
              aria-label={item.name}
            >
              <item.Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
          ))}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex group ml-1 sm:ml-2 items-center gap-2 px-4 py-2.5 rounded-xl bg-[#83E9FF]/10 border border-[#83E9FF]/25 text-white font-medium text-sm hover:bg-[#83E9FF]/15 hover:border-[#83E9FF]/40 transition-all duration-200"
          >
            <span className="whitespace-nowrap">Open App</span>
            <ArrowRight className="h-4 w-4 text-[#83E9FF] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative min-h-[calc(100svh-4.5rem)] sm:min-h-[calc(100vh-5rem)] flex flex-col shrink-0">
        <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-16 sm:pt-20 md:pt-24 pb-24 px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <HeroFadeIn
              as="p"
              delay={0.2}
              className="text-[#83E9FF] text-sm font-semibold uppercase tracking-[0.2em] mb-6"
            >
              One terminal. All of HyperLiquid.
            </HeroFadeIn>
            <HeroFadeIn
              as="h2"
              delay={0.35}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-inter font-normal text-white leading-tight mb-6"
            >
              The Terminal to house all{" "}
              <span className="text-[#83E9FF] drop-shadow-[0_0_20px_rgba(131,233,255,0.3)]">Hyper</span>
              <span className="text-[#f9e370]/90 drop-shadow-[0_0_15px_rgba(249,227,112,0.2)]">Liquid</span>
            </HeroFadeIn>
            <HeroFadeIn
              as="p"
              delay={0.5}
              className="text-[#a1a1aa] text-base sm:text-lg max-w-2xl mx-auto mb-10"
            >
              Market data, liquidations, vaults, auctions — everything you need in one place.
            </HeroFadeIn>
            <HeroFadeIn delay={0.65} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="#why"
                className="group inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-gradient-to-r from-[#83E9FF]/20 to-[#f9e370]/10 backdrop-blur-md border border-white/[0.12] hover:border-[#83E9FF]/40 transition-all duration-300"
              >
                <span className="font-semibold text-white">Explore the Terminal</span>
                <ArrowDown className="h-5 w-5 text-[#83E9FF] group-hover:translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/[0.12] hover:border-white/25 hover:bg-white/10 transition-all duration-300"
              >
                <span className="font-semibold text-white">Open App</span>
                <ArrowRight className="h-5 w-5 text-[#83E9FF]" />
              </Link>
            </HeroFadeIn>
          </div>
        </div>

        <HeroFadeIn delay={1.2} className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
          <a href="#why" className="flex flex-col items-center gap-2 text-[#a1a1aa] hover:text-[#83E9FF] transition-colors">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </a>
        </HeroFadeIn>
      </section>

      {/* Why */}
      <section id="why" className="relative py-16 sm:py-24 md:py-36 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-12 sm:mb-16 md:mb-24">
            <p className="text-[#83E9FF] text-xs font-semibold uppercase tracking-[0.25em] mb-3 font-inter">
              Why Liquid Terminal
            </p>
            <h2 className="font-inter text-3xl md:text-4xl lg:text-[2.75rem] text-white leading-tight max-w-2xl mx-auto">
              One terminal. Zero noise.
            </h2>
            <p className="mt-4 text-[#a1a1aa] text-base max-w-xl mx-auto">
              Built for traders who want clarity, not clutter. Every signal in one place.
            </p>
          </FadeIn>

          <div className="relative">
            <div
              className="absolute top-[72px] left-[16%] right-[16%] h-px hidden lg:block pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(131,233,255,0.15) 20%, rgba(249,227,112,0.2) 50%, rgba(131,233,255,0.15) 80%, transparent)",
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {reasons.map((reason, index) => (
                <FadeIn key={reason.title} delay={index * 0.12} className="group relative">
                  <div
                    className={[
                      "rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 h-full",
                      "bg-[#151A25]/40 backdrop-blur-md border border-white/[0.06]",
                      "hover:border-[#83E9FF]/20 transition-all duration-300",
                      "hover:shadow-[0_0_40px_-8px_rgba(131,233,255,0.04)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-baseline gap-3">
                        <span
                          className={[
                            "text-xl sm:text-2xl md:text-3xl font-bold tracking-tight",
                            reason.accent === "accent" ? "text-[#83E9FF]" : "text-[#f9e370]",
                          ].join(" ")}
                        >
                          {reason.stat}
                        </span>
                        <span
                          className={[
                            "text-xs font-semibold uppercase tracking-widest",
                            reason.accent === "accent" ? "text-[#83E9FF]/80" : "text-[#f9e370]/80",
                          ].join(" ")}
                        >
                          {reason.label}
                        </span>
                      </div>
                      <div
                        className={[
                          "flex items-center justify-center w-12 h-12 rounded-full overflow-hidden shrink-0",
                          reason.accent === "accent"
                            ? "bg-[#83E9FF]/10 border border-[#83E9FF]/20"
                            : "bg-[#f9e370]/10 border border-[#f9e370]/20",
                        ].join(" ")}
                      >
                        <Image
                          src={reason.hypurr}
                          alt=""
                          width={40}
                          height={40}
                          className="w-full h-full object-contain scale-90"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-3 font-inter leading-snug">
                      {reason.title}
                    </h3>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed mb-5 font-inter">
                      {reason.problem}
                    </p>
                    <div
                      className={[
                        "pt-4 border-t border-white/[0.06] text-sm leading-relaxed font-medium",
                        reason.accent === "accent" ? "text-[#83E9FF]" : "text-[#f9e370]",
                      ].join(" ")}
                    >
                      <span className="opacity-70">→</span> {reason.solution}
                    </div>

                    <div
                      className={[
                        "absolute bottom-0 left-8 right-8 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        reason.accent === "accent"
                          ? "bg-gradient-to-r from-transparent via-[#83E9FF]/40 to-transparent"
                          : "bg-gradient-to-r from-transparent via-[#f9e370]/40 to-transparent",
                      ].join(" ")}
                    />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* See it */}
      <section id="see-it" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <FadeIn className="text-center mb-10 sm:mb-14 md:mb-20">
          <p className="text-[#83E9FF] text-sm font-semibold uppercase tracking-[0.2em] mb-4">See it in action</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-inter text-white max-w-2xl mx-auto">
            Built for <span className="text-[#83E9FF]">speed</span> and <span className="text-[#f9e370]">clarity</span>
          </h2>
        </FadeIn>

        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {screenshots.map((shot, index) => (
            <FadeIn
              key={shot.title}
              delay={index * 0.1}
              className={`group rounded-2xl overflow-hidden border ${shot.border} bg-[#151A25]/40 backdrop-blur-md transition-all duration-300 hover:border-[#83E9FF]/40 hover:shadow-[0_0_40px_rgba(131,233,255,0.08)]`}
            >
              <div className="aspect-[4/3] flex flex-col items-center justify-center p-5 sm:p-6 md:p-8">
                <div className="w-16 h-16 mb-4 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                  <span className="text-2xl text-[#83E9FF]/60">📊</span>
                </div>
                <p className="text-white font-medium text-sm">{shot.title}</p>
                <p className="text-[#a1a1aa] text-xs mt-1">{shot.subtitle}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Get started */}
      <section id="get-started" className="relative py-24 md:py-32 px-4 sm:px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="text-[#83E9FF] text-sm font-semibold uppercase tracking-[0.2em] mb-4">Get started</p>
          <h2 className="text-3xl md:text-4xl font-inter text-white mb-6">
            Your <span className="text-[#83E9FF]">terminal</span> awaits
          </h2>
          <p className="text-[#a1a1aa] text-lg mb-10">
            Free to use. No sign-up required. Connect your wallet to unlock portfolio tracking.
          </p>

          <FadeIn delay={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-gradient-to-r from-[#83E9FF]/20 to-[#f9e370]/10 backdrop-blur-md border border-white/[0.12] hover:border-[#83E9FF]/40 transition-all duration-300"
            >
              <span className="font-semibold text-white">Open the Terminal</span>
              <ArrowRight className="h-5 w-5 text-[#83E9FF] group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/market/spot"
              className="inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl border border-white/[0.08] text-white font-medium hover:border-[#83E9FF]/30 hover:bg-[#83E9FF]/5 transition-all duration-300"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Explore the Market</span>
            </Link>
          </FadeIn>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-12 sm:mt-16 md:mt-20 text-center">
          <p className="text-[#71717a] text-xs font-medium uppercase tracking-wider mb-4">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {apiProviders.map((provider) => (
              <a
                key={provider.name}
                href={provider.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#83E9FF] transition-colors"
              >
                <Image src={provider.logo} alt={provider.name} width={24} height={24} className="w-6 h-6 rounded" />
                <span className="text-sm">{provider.name}</span>
              </a>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.6} className="mt-10 sm:mt-14 md:mt-16 pt-8 border-t border-white/[0.06] text-center space-y-1">
          <p className="text-[#71717a] text-sm">Liquid Terminal v1.0.0</p>
          <p className="text-[#71717a] text-xs">© {new Date().getFullYear()} Liquid Terminal. All rights reserved.</p>
        </FadeIn>
      </section>
    </div>
  );
}
