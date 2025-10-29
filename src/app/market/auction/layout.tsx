import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.auction);

export default function AuctionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

