import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.dashboardMarket);

export default function DashboardMarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
