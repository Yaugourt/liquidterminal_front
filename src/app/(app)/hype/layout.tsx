import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.hype);

export default function HypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
