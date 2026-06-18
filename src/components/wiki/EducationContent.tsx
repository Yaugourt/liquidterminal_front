"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeHref } from "@/lib/safeUrl";
import { Card } from "@/components/ui/card";
import {
  CHAPTER_META,
  DEFAULT_META,
  DEFAULT_SUB_META,
} from "./education-meta";
import {
  buildResourceLinks,
  renderParagraph,
  type EducationInfo,
} from "./education-helpers";
import { EducationStatCard } from "./EducationStatCard";

interface SubChapter {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  subChapters?: SubChapter[];
}

interface EducationContentProps {
  chapters: Chapter[];
  info?: EducationInfo | null;
}


/* CHAPTER_META block removed — moved to ./education-meta.ts */

export function EducationContent({ chapters, info }: EducationContentProps) {
  const [activeTab, setActiveTab] = useState(chapters[0]?.title || "");
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const userInitiatedRef = useRef(false);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.title === activeTab) ?? chapters[0],
    [chapters, activeTab],
  );
  const activeMeta = useMemo(
    () => (activeChapter ? CHAPTER_META[activeChapter.title] ?? DEFAULT_META : DEFAULT_META),
    [activeChapter],
  );

  const subChapters = activeChapter?.subChapters;
  const hasSubChapters = !!subChapters && subChapters.length > 0;

  // Keep the sub-selection coherent with the active chapter. If the user lands
  // on a chapter with sub-chapters and the current `activeSubId` isn't one of
  // them, snap to the first sub — otherwise preserve their last choice.
  useEffect(() => {
    if (!hasSubChapters) return;
    const hasMatch =
      activeSubId !== null && subChapters.some((s) => s.id === activeSubId);
    if (!hasMatch) {
      setActiveSubId(subChapters[0].id);
    }
  }, [hasSubChapters, subChapters, activeSubId]);

  const activeSub = useMemo(
    () => subChapters?.find((s) => s.id === activeSubId) ?? subChapters?.[0],
    [subChapters, activeSubId],
  );

  const activeSubMeta = useMemo(() => {
    if (!hasSubChapters || !activeSub) return DEFAULT_SUB_META;
    return activeMeta.subChapters?.[activeSub.id] ?? DEFAULT_SUB_META;
  }, [hasSubChapters, activeSub, activeMeta]);

  const paragraphs = useMemo(
    () =>
      activeChapter
        ? activeChapter.description
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean)
        : [],
    [activeChapter],
  );

  const subParagraphs = useMemo(
    () =>
      activeSub
        ? activeSub.description
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean)
        : [],
    [activeSub],
  );

  // Auto-scroll the active pill into view *inside the tab container only*.
  // `scrollIntoView({ inline: "center" })` was buggy here: when the tab row
  // fitted the card, it bubbled up to the nearest scrollable ancestor — which
  // turned out to be the whole page — and shifted the entire layout sideways.
  // Computing offsetLeft against the container and calling `scrollTo` on it
  // directly keeps the scroll strictly local and becomes a no-op when nothing
  // overflows.
  useEffect(() => {
    if (!userInitiatedRef.current) return;
    const container = tabsContainerRef.current;
    const tab = activeTabRef.current;
    if (!container || !tab) return;
    if (container.scrollWidth <= container.clientWidth) return;
    const target =
      tab.offsetLeft - (container.clientWidth - tab.offsetWidth) / 2;
    container.scrollTo({
      left: Math.max(0, target),
      behavior: "smooth",
    });
  }, [activeTab]);

  const handleTabChange = useCallback((title: string) => {
    userInitiatedRef.current = true;
    setActiveTab(title);
  }, []);

  const copyColor = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor((c) => (c === hex ? null : c)), 1600);
    } catch {
      // Clipboard not available — fail silently, the dot still shows the color.
    }
  }, []);

  const resourceLinks = useMemo(() => buildResourceLinks(info), [info]);
  const brandColors = info?.colors ?? [];

  if (!activeChapter) return null;

  return (
    <Card interactive={false} className="relative overflow-hidden bg-gradient-to-br from-surface/80 via-surface/60 to-base/90">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-gold/[0.06] blur-3xl" />

      {/* HERO */}
      <div className="relative z-10 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
            <Sparkles className="h-3 w-3" />
            Liquid Wiki · Fundamentals
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-text-primary sm:text-2xl md:text-[28px]">
            Understand Hyperliquid
            <span className="ml-2 text-brand">from first principles</span>
          </h1>
          <p className="max-w-2xl text-[13px] leading-relaxed text-text-secondary sm:text-sm">
            From the consensus that powers it to the proposals that extend it — short, precise
            chapters to decode the first truly on-chain derivatives L1.
          </p>
        </div>
      </div>

      {/* TABS — width hugs the content and only scrolls horizontally when it
         truly overflows the card, so the card can never accidentally shift the
         whole page sideways. Fade edges hint at overflow without a scrollbar. */}
      <div className="relative z-10 px-5 sm:px-6">
        <div className="relative w-fit max-w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 rounded-l-xl bg-gradient-to-r from-surface/90 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 rounded-r-xl bg-gradient-to-l from-surface/90 to-transparent" />
          <div
            ref={tabsContainerRef}
            role="tablist"
            aria-label="Hyperliquid fundamentals"
            className={cn(
              "flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-border-subtle bg-base/60 p-1 scroll-smooth snap-x",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {chapters.map((chapter) => {
              const meta = CHAPTER_META[chapter.title] ?? DEFAULT_META;
              const Icon = meta.icon;
              const isActive = activeTab === chapter.title;
              return (
                <button
                  key={chapter.id}
                  ref={isActive ? activeTabRef : undefined}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(chapter.title)}
                  className={cn(
                    "flex shrink-0 snap-start items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                    isActive
                      ? "border-brand/40 bg-brand/15 text-brand shadow-sm shadow-brand/10"
                      : "border-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{chapter.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChapter.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {hasSubChapters && activeSub ? (
              <div className="space-y-4">
                {/* Chapter header + short overview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-brand/30 bg-brand/10">
                      <activeMeta.icon className="h-3.5 w-3.5 text-brand" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
                      {activeMeta.tagline}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-text-primary md:text-[22px]">
                    {activeChapter.title}
                  </h2>
                  {paragraphs[0] && (
                    <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
                      {renderParagraph(paragraphs[0])}
                    </p>
                  )}
                </div>

                {/* Sub-nav + active sub-chapter content + its stats */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[172px_minmax(0,1fr)] lg:items-start">
                    <div
                      role="tablist"
                      aria-label={`${activeChapter.title} sub-sections`}
                      className={cn(
                        "flex gap-1.5 overflow-x-auto rounded-lg border border-border-subtle bg-base/40 p-1.5 scroll-smooth snap-x",
                        "lg:flex-col lg:overflow-visible lg:snap-none lg:h-fit lg:self-start",
                        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                      )}
                    >
                      {subChapters!.map((sub) => {
                        const subMeta =
                          activeMeta.subChapters?.[sub.id] ?? DEFAULT_SUB_META;
                        const SubIcon = subMeta.icon;
                        const isActive = activeSub.id === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveSubId(sub.id)}
                            className={cn(
                              "flex shrink-0 snap-start items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-all lg:w-full",
                              isActive
                                ? "border-brand/40 bg-brand/15 shadow-sm shadow-brand/10"
                                : "border-transparent hover:border-border-subtle hover:bg-surface-2",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                                isActive
                                  ? "border-brand/40 bg-brand/15"
                                  : "border-border-subtle bg-base/50",
                              )}
                            >
                              <SubIcon
                                className={cn(
                                  "h-3 w-3",
                                  isActive
                                    ? "text-brand"
                                    : "text-text-tertiary",
                                )}
                              />
                            </span>
                            <span className="min-w-0">
                              <span
                                className={cn(
                                  "block text-[12px] font-bold leading-tight",
                                  isActive
                                    ? "text-brand"
                                    : "text-text-primary",
                                )}
                              >
                                {sub.title}
                              </span>
                              {sub.subtitle && (
                                <span className="mt-0.5 block text-[10px] leading-snug text-text-tertiary">
                                  {sub.subtitle}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sub-chapter body */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSub.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="space-y-3"
                      >
                        {activeSub.subtitle && (
                          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand/80">
                            {activeSub.subtitle}
                          </div>
                        )}
                        <h3 className="text-lg font-bold tracking-tight text-text-primary">
                          {activeSub.title}
                        </h3>
                        <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
                          {subParagraphs.map((paragraph, i) => (
                            <p key={i}>{renderParagraph(paragraph)}</p>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Sub-chapter stats */}
                  {activeSubMeta.stats.length > 0 && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`stats-${activeSub.id}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1"
                      >
                        {activeSubMeta.stats.map((stat) => (
                          <EducationStatCard key={stat.label} stat={stat} />
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                {/* Main column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-brand/30 bg-brand/10">
                      <activeMeta.icon className="h-3.5 w-3.5 text-brand" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
                      {activeMeta.tagline}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-text-primary md:text-[22px]">
                    {activeChapter.title}
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
                    {paragraphs.map((paragraph, i) => (
                      <p key={i}>{renderParagraph(paragraph)}</p>
                    ))}
                  </div>
                </div>

                {/* Stat column */}
                {activeMeta.stats.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    {activeMeta.stats.map((stat) => (
                      <EducationStatCard key={stat.label} stat={stat} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER — official resources + brand palette (replaces the old sidebar) */}
      {(resourceLinks.length > 0 || brandColors.length > 0) && (
        <div className="relative z-10 border-t border-border-subtle bg-base/30 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {resourceLinks.length > 0 && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary sm:inline">
                  Official
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 lg:flex-nowrap lg:overflow-x-auto lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
                  {resourceLinks.map((link) => (
                    <a
                      key={link.label}
                      href={safeHref(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.label}
                      aria-label={link.label}
                      className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-base/50 px-2.5 py-1.5 text-[11px] font-medium text-text-secondary transition-all hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
                    >
                      <link.icon className="h-3 w-3" />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {brandColors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary sm:inline">
                  Brand
                </span>
                <div className="flex items-center gap-1">
                  {brandColors.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => copyColor(hex)}
                      title={copiedColor === hex ? "Copied!" : hex}
                      aria-label={`Copy ${hex}`}
                      className="group relative flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle transition-all hover:scale-105 hover:border-border-default"
                      style={{ backgroundColor: hex }}
                    >
                      <span
                        className={cn(
                          "absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity",
                          copiedColor === hex
                            ? "opacity-100"
                            : "group-hover:opacity-100",
                        )}
                      >
                        {copiedColor === hex ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3 text-text-primary" />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

