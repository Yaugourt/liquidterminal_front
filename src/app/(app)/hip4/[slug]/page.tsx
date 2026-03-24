import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hip4DocBody } from "@/components/hip4/Hip4DocBody";
import { getHip4Chapter, HIP4_SLUGS } from "@/lib/hip4-chapters";

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
  return {
    title: `${ch.title} — HIP-4`,
    description:
      "Exploratory HIP-4 prediction markets documentation on HyperEVM testnet. Reverse-engineered; not official Hyperliquid documentation.",
  };
}

export default async function Hip4SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getHip4Chapter(slug)) {
    notFound();
  }
  return <Hip4DocBody slug={slug} />;
}
