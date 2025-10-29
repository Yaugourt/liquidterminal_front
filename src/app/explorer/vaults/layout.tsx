import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.vaults);

export default function VaultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

