import type { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.namesPage);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
