import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.publicGoodsPage);

// ISR: Revalidate every 5 minutes - public goods list is semi-static
export const revalidate = 300;

export default function PublicGoodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

