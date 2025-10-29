import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.dashboard);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

