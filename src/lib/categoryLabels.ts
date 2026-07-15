import { Category } from "@/services/ecosystem/project/types";

/**
 * The backend project-category taxonomy is dirty (CSV imports created
 * variants like "Socialfi" vs "sociafi", or "DEFI"). Canonical spellings
 * are keyed by a squashed lowercase form so variants collapse to a single
 * display label.
 */
const CANONICAL_LABELS: Record<string, string> = {
  socialfi: "SocialFi",
  sociafi: "SocialFi", // known misspelling of SocialFi in the backend data
  defi: "DeFi",
  ai: "AI",
  nft: "NFT",
  dex: "DEX",
};

/** Squashed key used to group label variants (case/spacing-insensitive). */
const labelKey = (name: string): string => name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

/** Title-case fallback for labels without a canonical spelling. */
const titleCase = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** Display label for a category name, collapsing known dirty variants. */
export function normalizeCategoryLabel(name: string): string {
  return CANONICAL_LABELS[labelKey(name)] ?? titleCase(name);
}

export interface CategoryGroup {
  /** Normalized display label. */
  label: string;
  /** Backend ids of every category variant sharing this label. */
  ids: number[];
}

/** Dedupe categories by normalized label, merging variant ids for filtering. */
export function groupCategories(categories: Category[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  for (const category of categories) {
    const label = normalizeCategoryLabel(category.name);
    const existing = groups.get(label);
    if (existing) {
      existing.ids.push(category.id);
    } else {
      groups.set(label, { label, ids: [category.id] });
    }
  }
  return [...groups.values()];
}
