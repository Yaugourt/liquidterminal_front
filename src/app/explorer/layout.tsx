import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.explorer);

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

