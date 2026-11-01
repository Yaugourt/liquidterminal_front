import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.toolsPage);

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
