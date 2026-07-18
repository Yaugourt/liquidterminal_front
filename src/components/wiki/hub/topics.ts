import type { LucideIcon } from "lucide-react";
import { CHAPTER_META, DEFAULT_META, type ChapterMeta } from "../education-meta";
import type { EducationalCategory } from "@/services/wiki/types";

/**
 * Chapter <-> category bridge of the fused wiki: each Learn chapter claims
 * the article categories that cover the same ground. Categories are matched
 * by exact name (names are the stable public contract of the wiki taxonomy);
 * an unmatched name simply contributes no articles, it never breaks the page.
 */
export const CHAPTER_CATEGORY_MAP: Record<string, string[]> = {
  // Names must match the live category names EXACTLY (see buildTopics): the
  // taxonomy casing is "HyperLiquid", not "Hyperliquid".
  Introduction: ["HyperLiquid"],
  HyperBFT: ["Validator"],
  HyperCore: ["HyperCore", "Order Book", "HyperCore Oracle", "Oracles"],
  HyperEVM: ["HyperEVM", "HyperEVM Block"],
  "HyperCore ↔ HyperEVM": ["CoreWriter", "Read precompiles", "Precompiles"],
  "Trading & Risk": ["Perpetual", "Trading", "Market maker", "Builder codes"],
  "Vaults & HLP": ["Vaults", "HLP"],
  "Spot & Unit": ["Auction", "DEX", "Liquidity"],
  "Stablecoins & USDH": ["Stablecoin", "USDH", "Lending"],
  $HYPE: ["HYPE", "Governance", "Farming"],
  "HIP Framework": [
    "HIP-1: Native token standard",
    "HIP-2: Hyperliquidity",
    "HIP-3: Builder-Deployed Perpetuals",
    "HIP-4: Outcome markets",
    "HIP (HyperLiquid improvement proposal)",
  ],
};

/** Sub-chapter id (education JSON) -> category names, for the primer pills. */
export const SUBCHAPTER_CATEGORY_MAP: Record<string, string[]> = {
  "hip-1": ["HIP-1: Native token standard"],
  "hip-2": ["HIP-2: Hyperliquidity"],
  "hip-3": ["HIP-3: Builder-Deployed Perpetuals"],
  "hip-4": ["HIP-4: Outcome markets"],
  "order-types": ["Order Book"],
  "margin-modes": ["Perpetual"],
  "liquidations-adl": ["HLP"],
  "funding-and-fees": ["Builder codes"],
  hlp: ["HLP"],
  "user-vaults": ["Vaults"],
  "spot-and-auctions": ["Auction"],
  usdh: ["USDH"],
  "aligned-quote-assets": ["Stablecoin"],
  distribution: ["HYPE"],
  "assistance-fund": ["HYPE"],
  "staking-and-lsts": ["Validator", "Farming"],
};

/** Kebab-case slug for URL segments (chapter titles, category names). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/↔/g, "to")
    .replace(/\$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Route to a chapter (optionally a sub-chapter). */
export function chapterHref(chapterTitle: string, subId?: string): string {
  const base = `/wiki/learn/${slugify(chapterTitle)}`;
  return subId ? `${base}/${subId}` : base;
}

/** Route to a community category. */
export function categoryHref(categoryName: string): string {
  return `/wiki/c/${slugify(categoryName)}`;
}

export interface EducationSubChapter {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
}

export interface EducationChapter {
  id: number;
  title: string;
  description: string;
  subChapters?: EducationSubChapter[];
}

/** A Learn chapter resolved against the live category list. */
export interface ChapterTopic {
  kind: "chapter";
  chapter: EducationChapter;
  meta: ChapterMeta;
  icon: LucideIcon;
  /** Ids of the categories this chapter claims (may be empty). */
  categoryIds: number[];
  /** APPROVED article count across the claimed categories. */
  articleCount: number;
}

/** Selected topic of the hub: a chapter, a community category, or everything. */
export type WikiTopic =
  | ChapterTopic
  | { kind: "category"; category: EducationalCategory }
  | { kind: "all" };

/**
 * Resolve chapters against the live categories (withCounts) and split the
 * taxonomy: chapters claim their mapped categories, everything left is
 * "community".
 */
export function buildTopics(
  chapters: EducationChapter[],
  categories: EducationalCategory[]
): { chapterTopics: ChapterTopic[]; communityCategories: EducationalCategory[] } {
  const byName = new Map(categories.map((cat) => [cat.name, cat]));
  const claimed = new Set<number>();

  const chapterTopics: ChapterTopic[] = chapters.map((chapter) => {
    const names = CHAPTER_CATEGORY_MAP[chapter.title] ?? [];
    const mapped = names
      .map((name) => byName.get(name))
      .filter((cat): cat is EducationalCategory => !!cat);
    mapped.forEach((cat) => claimed.add(cat.id));
    const meta = CHAPTER_META[chapter.title] ?? DEFAULT_META;
    return {
      kind: "chapter",
      chapter,
      meta,
      icon: meta.icon,
      categoryIds: mapped.map((cat) => cat.id),
      articleCount: mapped.reduce((sum, cat) => sum + (cat.resourcesCount ?? 0), 0),
    };
  });

  const communityCategories = categories
    .filter((cat) => !claimed.has(cat.id))
    .sort(
      (a, b) =>
        (b.resourcesCount ?? 0) - (a.resourcesCount ?? 0) || a.name.localeCompare(b.name)
    );

  return { chapterTopics, communityCategories };
}

/**
 * Word-boundary excerpt for primer texts. CSS line-clamp is banned here: its
 * -webkit-box overflow trips the visual-check clipping gate.
 */
export function excerpt(text: string, maxLength = 180): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= maxLength) return flat;
  const cut = flat.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : maxLength)}…`;
}

/** Category ids of a sub-chapter, falling back to the whole chapter. */
export function subChapterCategoryIds(
  topic: ChapterTopic,
  subId: string | null,
  categories: EducationalCategory[]
): number[] {
  if (!subId) return topic.categoryIds;
  const names = SUBCHAPTER_CATEGORY_MAP[subId];
  if (!names) return topic.categoryIds;
  const byName = new Map(categories.map((cat) => [cat.name, cat]));
  const ids = names
    .map((name) => byName.get(name)?.id)
    .filter((id): id is number => typeof id === "number");
  return ids.length > 0 ? ids : topic.categoryIds;
}
