import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.liquidations);

// ISR: Revalidate every 1 minute - liquidations data updates frequently
export const revalidate = 60;

export default function LiquidationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
