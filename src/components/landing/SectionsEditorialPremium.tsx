"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { ArrowRight } from "lucide-react";

/**
 * Hybrid: Sections Editorial structure + No-scroll Premium styling.
 * Structure: Hero → Why → See it → Get started
 * Style: glassmorphism, gradients cyan/gold, refined, elegant
 */
const socials = [
  { name: "Discord", href: "#", iconName: "ic:baseline-discord" },
  { name: "Twitter", href: "https://x.com/liquidterminal", iconName: "simple-icons:x" },
  { name: "Github", href: "https://github.com/Liquid-Terminal", iconName: "mdi:github" },
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

export function SectionsEditorialPremium() {
  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#0B0E14] font-inter scroll-smooth pb-[env(safe-area-inset-bottom,0)]">
      {/* Hero/global gradients - goldAccent */}
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

      {/* Header - sticky, gradient top (solid at top, fades to transparent at bottom) */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 backdrop-blur-xl border-b border-white/[0.04] min-h-[56px] sm:min-h-[60px]"
        style={{
          background: "linear-gradient(to bottom, rgba(11,14,20,0.98) 0%, rgba(11,14,20,0.92) 50%, rgba(11,14,20,0) 100%)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 min-w-0 shrink">
          <Image src="/logo.svg" alt="Liquid Terminal" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
          <span className="font-higuen text-base sm:text-lg text-white tracking-tight whitespace-nowrap truncate">
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
              <Icon icon={item.iconName} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
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

      {/* Hero - Premium style (height = viewport - header so scroll indicator is visible) */}
      <section id="hero" className="relative min-h-[calc(100svh-4.5rem)] sm:min-h-[calc(100vh-5rem)] flex flex-col shrink-0">
        <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-16 sm:pt-20 md:pt-24 pb-24 px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#83E9FF] text-sm font-semibold uppercase tracking-[0.2em] mb-6"
            >
              One terminal. All of HyperLiquid.
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-higuen font-normal text-white leading-tight mb-6"
            >
              The Terminal to house all{" "}
              <span className="text-[#83E9FF] drop-shadow-[0_0_20px_rgba(131,233,255,0.3)]">Hyper</span>
              <span className="text-[#f9e370]/90 drop-shadow-[0_0_15px_rgba(249,227,112,0.2)]">Liquid</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-[#a1a1aa] text-base sm:text-lg max-w-2xl mx-auto mb-10"
            >
              Market data, liquidations, vaults, auctions — everything you need in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            >
              <Link
                href="#why"
                className="group inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-gradient-to-r from-[#83E9FF]/20 to-[#f9e370]/10 backdrop-blur-md border border-white/[0.12] hover:border-[#83E9FF]/40 transition-all duration-300"
              >
                <span className="font-semibold text-white">Explore the Terminal</span>
                <Icon icon="mdi:arrow-down" className="h-5 w-5 text-[#83E9FF] group-hover:translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/[0.12] hover:border-white/25 hover:bg-white/10 transition-all duration-300"
              >
                <span className="font-semibold text-white">Open App</span>
                <ArrowRight className="h-5 w-5 text-[#83E9FF]" />
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#why" className="flex flex-col items-center gap-2 text-[#a1a1aa] hover:text-[#83E9FF] transition-colors">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <Icon icon="mdi:chevron-down" className="h-6 w-6" />
            </motion.div>
          </a>
        </motion.div>
      </section>

      {/* Why - Section 5 layout with Proposal 1 copy */}
      <section id="why" className="relative py-16 sm:py-24 md:py-36 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12 sm:mb-16 md:mb-24"
          >
            <p className="text-[#83E9FF] text-xs font-semibold uppercase tracking-[0.25em] mb-3 font-inter">
              Why Liquid Terminal
            </p>
            <h2 className="font-higuen text-3xl md:text-4xl lg:text-[2.75rem] text-white leading-tight max-w-2xl mx-auto">
              One terminal. Zero noise.
            </h2>
            <p className="mt-4 text-[#a1a1aa] text-base max-w-xl mx-auto">
              Built for traders who want clarity, not clutter. Every signal in one place.
            </p>
          </motion.header>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12, delayChildren: 0.08 },
              },
            }}
            className="relative"
          >
            <div
              className="absolute top-[72px] left-[16%] right-[16%] h-px hidden lg:block pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(131,233,255,0.15) 20%, rgba(249,227,112,0.2) 50%, rgba(131,233,255,0.15) 80%, transparent)",
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {reasons.map((reason) => (
                <motion.article
                  key={reason.title}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="group relative"
                >
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
                            "font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-tight",
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
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* See it - Premium glass screenshots */}
      <section id="see-it" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14 md:mb-20"
        >
          <p className="text-[#83E9FF] text-sm font-semibold uppercase tracking-[0.2em] mb-4">See it in action</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-higuen text-white max-w-2xl mx-auto">
            Built for <span className="text-[#83E9FF]">speed</span> and <span className="text-[#f9e370]">clarity</span>
          </h2>
        </motion.div>

        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {screenshots.map((shot, index) => (
            <motion.div
              key={shot.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group rounded-2xl overflow-hidden border ${shot.border} bg-[#151A25]/40 backdrop-blur-md transition-all duration-300 hover:border-[#83E9FF]/40 hover:shadow-[0_0_40px_rgba(131,233,255,0.08)]`}
            >
              <div className="aspect-[4/3] flex flex-col items-center justify-center p-5 sm:p-6 md:p-8">
                <div className="w-16 h-16 mb-4 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                  <span className="text-2xl text-[#83E9FF]/60">📊</span>
                </div>
                <p className="text-white font-medium text-sm">{shot.title}</p>
                <p className="text-[#a1a1aa] text-xs mt-1">{shot.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Get started - Premium CTA */}
      <section id="get-started" className="relative py-24 md:py-32 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-[#83E9FF] text-sm font-semibold uppercase tracking-[0.2em] mb-4">Get started</p>
          <h2 className="text-3xl md:text-4xl font-higuen text-white mb-6">
            Your <span className="text-[#83E9FF]">terminal</span> awaits
          </h2>
          <p className="text-[#a1a1aa] text-lg mb-10">
            Free to use. No sign-up required. Connect your wallet to unlock portfolio tracking.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
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
              <Icon icon="mdi:chart-line" className="h-5 w-5" />
              <span>Explore the Market</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 md:mt-20 text-center"
        >
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
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-10 sm:mt-14 md:mt-16 pt-8 border-t border-white/[0.06] text-center space-y-1"
        >
          <p className="text-[#71717a] text-sm">Liquid Terminal v1.0.0</p>
          <p className="text-[#71717a] text-xs">© {new Date().getFullYear()} Liquid Terminal. All rights reserved.</p>
        </motion.footer>
      </section>
    </div>
  );
}
