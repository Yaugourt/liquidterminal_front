import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.alertsPage);

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
