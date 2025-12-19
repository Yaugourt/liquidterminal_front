import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";

export const metadata: Metadata = generateMetadata(seoConfig.validators);

export default function ValidatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

