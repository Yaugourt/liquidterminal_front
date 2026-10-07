import type { Metadata } from "next";
import "@usdh-kit/widget/styles.css";
import { generateMetadata, seoConfig } from "@/lib/seo";
import { UsdhProviders } from "@/components/usdh/UsdhProviders";

export const metadata: Metadata = generateMetadata(seoConfig.usdh);

export default function UsdhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UsdhProviders>{children}</UsdhProviders>;
}
