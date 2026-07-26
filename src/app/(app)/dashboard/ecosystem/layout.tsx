import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.dashboardEcosystem);

export default function DashboardEcosystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
