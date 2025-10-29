import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.publicLists);

export default function PublicListsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

