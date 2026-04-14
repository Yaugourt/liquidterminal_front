import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.priorityFees);

// ISR: stats and fills change frequently; keep page reasonably fresh
export const revalidate = 60;

export default function PriorityFeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
