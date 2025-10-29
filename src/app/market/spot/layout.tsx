import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.spot);

export default function SpotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

