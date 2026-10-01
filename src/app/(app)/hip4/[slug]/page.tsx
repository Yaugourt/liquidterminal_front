import type { Metadata } from "next";
import { generateMetadata as seoMetadata, seoConfig } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Hip4ChapterRouter } from "@/components/hip4/hip4-chapter-registry";
import { getHip4Chapter, HIP4_SLUGS, type Hip4Slug } from "@/lib/hip4-chapters";

export function generateStaticParams() {
  return HIP4_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ch = getHip4Chapter(slug);
  if (!ch) {
    return { title: "HIP-4" };
  }
  if (slug === "home") return seoMetadata({ ...seoConfig.hip4, path: "/hip4/home" });
  return seoMetadata({
    title: `${ch.title} - HIP-4 Research`,
    description: `${ch.title}: exploratory HIP-4 prediction markets documentation, reverse-engineered from the contracts. Not official Hyperliquid documentation.`,
    path: `/hip4/${slug}`,
    keywords: ["HIP-4", "Hyperliquid prediction markets", "HIP-4 documentation"],
  });
}

export default async function Hip4SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getHip4Chapter(slug);
  if (!chapter) {
    notFound();
  }
  return <Hip4ChapterRouter slug={chapter.slug as Hip4Slug} />;
}
