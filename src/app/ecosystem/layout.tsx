import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.ecosystem);

export default function EcosystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

