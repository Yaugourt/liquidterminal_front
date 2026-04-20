import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";
import { BuildersNavBar } from "@/components/market/builders/BuildersNavBar";

export const metadata: Metadata = generateMetadata(seoConfig.marketBuilders);

export default function BuildersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <BuildersNavBar />
      {children}
    </div>
  );
}
