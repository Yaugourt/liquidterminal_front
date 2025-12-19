import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.tracker);

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

