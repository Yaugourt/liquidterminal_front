
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ArrowDown, TrendingUp } from "lucide-react";
import { FadeIn, HeroFadeIn } from "@/components/common";
import { socials, reasons, screenshots, apiProviders } from "./landing-data";

export function SectionsEditorialPremium() {
  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden bg-base font-inter scroll-smooth pb-[env(safe-area-inset-bottom,0)]">
      {/* Hero/global gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-base" />
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
          <span className="font-inter text-base sm:text-lg text-text-primary tracking-tight whitespace-nowrap truncate">
            Liquid <span className="text-brand">Terminal</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {socials.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-text-secondary hover:text-brand hover:bg-white/[0.06] transition-all duration-200"
              aria-label={item.name}
            >
              <item.Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
          ))}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex group ml-1 sm:ml-2 items-center gap-2 px-4 py-2.5 rounded-lg bg-brand/10 border border-brand/25 text-text-primary font-medium text-sm hover:bg-brand/15 hover:border-brand/40 transition-all duration-200"
          >
            <span className="whitespace-nowrap">Open App</span>
            <ArrowRight className="h-4 w-4 text-brand group-hover:translate-x-0.5 transition-transform" />
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
              className="text-brand text-sm font-semibold uppercase tracking-[0.2em] mb-6"
            >
              One terminal. All of HyperLiquid.
            </HeroFadeIn>
            <HeroFadeIn
              as="h2"
              delay={0.35}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-inter font-normal text-text-primary leading-tight mb-6"
            >
              The Terminal to house all{" "}
              <span className="text-brand drop-shadow-[0_0_20px_rgba(131,233,255,0.3)]">Hyper</span>
              <span className="text-gold/90 drop-shadow-[0_0_15px_rgba(249,227,112,0.2)]">Liquid</span>
            </HeroFadeIn>
            <HeroFadeIn
              as="p"
              delay={0.5}
              className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto mb-10"
            >
              Market data, liquidations, vaults, auctions — everything you need in one place.
            </HeroFadeIn>
            <HeroFadeIn delay={0.65} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="#why"
                className="group inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-gradient-to-r from-brand/20 to-gold/10 border border-white/[0.12] hover:border-brand/40 transition-all duration-300"
              >
                <span className="font-semibold text-white">Explore the Terminal</span>
                <ArrowDown className="h-5 w-5 text-brand group-hover:translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-white/5 border border-white/[0.12] hover:border-white/25 hover:bg-white/10 transition-all duration-300"
              >
                <span className="font-semibold text-text-primary">Open App</span>
                <ArrowRight className="h-5 w-5 text-brand" />
              </Link>
            </HeroFadeIn>
          </div>
        </div>

        <HeroFadeIn delay={1.2} className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
          <a href="#why" className="flex flex-col items-center gap-2 text-text-secondary hover:text-brand transition-colors">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </a>
        </HeroFadeIn>
      </section>

      {/* Why */}
      <section id="why" className="relative py-16 sm:py-24 md:py-36 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-12 sm:mb-16 md:mb-24">
            <p className="text-brand text-xs font-semibold uppercase tracking-[0.25em] mb-3 font-inter">
              Why Liquid Terminal
            </p>
            <h2 className="font-inter text-3xl md:text-4xl lg:text-[2.75rem] text-text-primary leading-tight max-w-2xl mx-auto">
              One terminal. Zero noise.
            </h2>
            <p className="mt-4 text-text-secondary text-base max-w-xl mx-auto">
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
                      "bg-surface/40 border border-white/[0.06]",
                      "hover:border-brand/20 transition-all duration-300",
                      "hover:shadow-[0_0_40px_-8px_rgba(131,233,255,0.04)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-baseline gap-3">
                        <span
                          className={[
                            "text-xl sm:text-2xl md:text-3xl font-bold tracking-tight",
                            reason.accent === "accent" ? "text-brand" : "text-gold",
                          ].join(" ")}
                        >
                          {reason.stat}
                        </span>
                        <span
                          className={[
                            "text-xs font-semibold uppercase tracking-widest",
                            reason.accent === "accent" ? "text-brand/80" : "text-gold/80",
                          ].join(" ")}
                        >
                          {reason.label}
                        </span>
                      </div>
                      <div
                        className={[
                          "flex items-center justify-center w-12 h-12 rounded-full overflow-hidden shrink-0",
                          reason.accent === "accent"
                            ? "bg-brand/10 border border-brand/20"
                            : "bg-gold/10 border border-gold/20",
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

                    <h3 className="text-lg font-semibold text-text-primary mb-3 font-inter leading-snug">
                      {reason.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-5 font-inter">
                      {reason.problem}
                    </p>
                    <div
                      className={[
                        "pt-4 border-t border-white/[0.06] text-sm leading-relaxed font-medium",
                        reason.accent === "accent" ? "text-brand" : "text-gold",
                      ].join(" ")}
                    >
                      <span className="opacity-70">→</span> {reason.solution}
                    </div>

                    <div
                      className={[
                        "absolute bottom-0 left-8 right-8 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        reason.accent === "accent"
                          ? "bg-gradient-to-r from-transparent via-brand/40 to-transparent"
                          : "bg-gradient-to-r from-transparent via-gold/40 to-transparent",
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
          <p className="text-brand text-sm font-semibold uppercase tracking-[0.2em] mb-4">See it in action</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-inter text-text-primary max-w-2xl mx-auto">
            Built for <span className="text-brand">speed</span> and <span className="text-gold">clarity</span>
          </h2>
        </FadeIn>

        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {screenshots.map((shot, index) => (
            <FadeIn
              key={shot.title}
              delay={index * 0.1}
              className={`group rounded-2xl overflow-hidden border ${shot.border} bg-surface/40 transition-all duration-300 hover:border-brand/40 hover:shadow-[0_0_40px_rgba(131,233,255,0.08)]`}
            >
              <div className="aspect-[4/3] flex flex-col items-center justify-center p-5 sm:p-6 md:p-8">
                <div className="w-16 h-16 mb-4 rounded-lg bg-white/5 border border-white/[0.08] flex items-center justify-center">
                  <shot.icon className="w-7 h-7 text-brand/60" aria-hidden />
                </div>
                <p className="text-text-primary font-medium text-sm">{shot.title}</p>
                <p className="text-text-secondary text-xs mt-1">{shot.subtitle}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Get started */}
      <section id="get-started" className="relative py-24 md:py-32 px-4 sm:px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="text-brand text-sm font-semibold uppercase tracking-[0.2em] mb-4">Get started</p>
          <h2 className="text-3xl md:text-4xl font-inter text-text-primary mb-6">
            Your <span className="text-brand">terminal</span> awaits
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Free to use. No sign-up required. Connect your wallet to unlock portfolio tracking.
          </p>

          <FadeIn delay={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-gradient-to-r from-brand/20 to-gold/10 border border-white/[0.12] hover:border-brand/40 transition-all duration-300"
            >
              <span className="font-semibold text-white">Open the Terminal</span>
              <ArrowRight className="h-5 w-5 text-brand group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/market/spot"
              className="inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl border border-white/[0.08] text-text-primary font-medium hover:border-brand/30 hover:bg-brand/5 transition-all duration-300"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Explore the Market</span>
            </Link>
          </FadeIn>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-12 sm:mt-16 md:mt-20 text-center">
          <p className="text-text-tertiary text-xs font-medium uppercase tracking-wider mb-4">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {apiProviders.map((provider) => (
              <a
                key={provider.name}
                href={provider.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors"
              >
                <Image src={provider.logo} alt={provider.name} width={24} height={24} className="w-6 h-6 rounded" />
                <span className="text-sm">{provider.name}</span>
              </a>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.6} className="mt-10 sm:mt-14 md:mt-16 pt-8 border-t border-white/[0.06] text-center space-y-3">
          <p className="text-text-tertiary text-sm">Liquid Terminal v1.0.0</p>
          <nav className="flex items-center justify-center gap-1 text-xs">
            <Link href="/legal/terms" className="px-2.5 py-1 rounded-md text-text-tertiary hover:text-brand transition-colors">Terms</Link>
            <span className="text-text-tertiary/40">·</span>
            <Link href="/legal/privacy" className="px-2.5 py-1 rounded-md text-text-tertiary hover:text-brand transition-colors">Privacy</Link>
            <span className="text-text-tertiary/40">·</span>
            <Link href="/legal/disclaimer" className="px-2.5 py-1 rounded-md text-text-tertiary hover:text-brand transition-colors">Disclaimer</Link>
          </nav>
          <p className="text-text-tertiary text-xs">© {new Date().getFullYear()} Liquid Terminal. All rights reserved.</p>
        </FadeIn>
      </section>
    </div>
  );
}
