import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.yields);

// ISR: yields refresh a few times an hour upstream
export const revalidate = 120;

export default function YieldsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
