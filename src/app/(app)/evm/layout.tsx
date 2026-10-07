import type { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

// Own title, description and canonical: the page itself is a client component.
export const metadata: Metadata = generateMetadata(seoConfig.evm);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
