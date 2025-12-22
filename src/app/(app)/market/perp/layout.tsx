import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.perp);

export default function PerpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

