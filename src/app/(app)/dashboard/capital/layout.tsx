import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.dashboardCapital);

export default function DashboardCapitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
