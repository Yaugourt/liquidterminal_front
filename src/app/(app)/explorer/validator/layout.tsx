import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.validators);

// ISR: Revalidate every 2 minutes - validator data updates moderately
export const revalidate = 120;

export default function ValidatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

