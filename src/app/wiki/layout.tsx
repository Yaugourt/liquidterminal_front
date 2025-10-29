import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.wiki);

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

