import type { Metadata } from "next";
import { generateMetadata as buildMetadata } from "@/lib/seo";

/** Best-effort display name from a category slug (categories live in the API). */
function humanize(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word.match(/^hip\d*$/i) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = humanize(slug);
  return buildMetadata({
    title: `${name} - Hyperliquid Wiki`,
    description: `Community-curated ${name} resources for the Hyperliquid ecosystem: articles, docs and threads.`,
    path: `/wiki/c/${slug}`,
  });
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
