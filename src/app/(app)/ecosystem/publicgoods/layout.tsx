import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.publicGoodsPage);

export default function PublicGoodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

