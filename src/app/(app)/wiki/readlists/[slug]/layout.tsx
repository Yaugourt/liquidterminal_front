import type { Metadata } from "next";
import { generateMetadata as buildMetadata } from "@/lib/seo";

/** Slug format is `${slugify(name)}-${id}`: strip the id, humanize the name. */
function readListName(slug: string): string {
  const withoutId = slug.replace(/-\d+$/, "");
  return withoutId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = readListName(slug);
  return buildMetadata({
    title: `${name} - Hyperliquid Read List`,
    description: `${name}: a curated Hyperliquid reading list on Liquid Terminal, with reading order and progress tracking.`,
    image: "/og/wiki.png",
    path: `/wiki/readlists/${slug}`,
  });
}

export default function ReadListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
