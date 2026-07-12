import type { Metadata } from "next";
import { CHAPTER_CATEGORY_MAP, slugify } from "@/components/wiki/hub/topics";
import { generateMetadata as buildMetadata } from "@/lib/seo";

/** Reverse the chapter slug back to its display title. */
function chapterTitle(slug: string): string | null {
  const match = Object.keys(CHAPTER_CATEGORY_MAP).find((title) => slugify(title) === slug);
  return match ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const title = chapterTitle(chapter);
  if (!title) return {};
  return buildMetadata({
    title: `${title} - Hyperliquid Wiki`,
    description: `Learn about ${title} on Hyperliquid: curated articles, official docs, threads and guides, ranked by community saves.`,
    path: `/wiki/learn/${chapter}`,
  });
}

export default function ChapterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
