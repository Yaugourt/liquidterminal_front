import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.marketHip4);

export default function Hip4MarketLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}
