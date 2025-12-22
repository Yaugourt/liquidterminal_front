import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.vaults);

// ISR: Revalidate every 2 minutes - vault data updates moderately
export const revalidate = 120;

export default function VaultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

