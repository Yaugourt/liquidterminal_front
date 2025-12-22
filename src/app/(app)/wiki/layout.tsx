import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.wiki);

// ISR: Revalidate every 5 minutes - wiki content is semi-static
export const revalidate = 300;

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

