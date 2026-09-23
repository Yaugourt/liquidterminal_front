import { Metadata } from "next";
import { generateMetadata as buildMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(seoConfig.fundingPage);

export default function FundingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
