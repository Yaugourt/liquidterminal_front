import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.explorer);

// ISR: Revalidate every 60 seconds - explorer data changes more frequently
export const revalidate = 60;

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

