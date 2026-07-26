import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.exportPage);

export default function ExportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
