import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.market);

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Section tabs come from the shared SectionNav in the header.
  return children;
}

