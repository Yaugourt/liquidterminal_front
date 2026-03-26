import type { Metadata } from "next";
import { Hip4SubNav } from "@/components/hip4/Hip4SubNav";
import { generateMetadata as genMeta, seoConfig } from "@/lib/seo";

export const metadata: Metadata = genMeta(seoConfig.hip4);

/** HIP-4 HTML is semi-static; refresh occasionally in production */
export const revalidate = 300;

export default function Hip4Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="hip4-docs-root mx-auto w-full max-w-[1200px] border-t border-brand-gold/20 px-4 pb-16 pt-6 lg:px-6">
        <p className="mb-4 mt-1 text-xs text-text-muted">
          <span className="text-brand-gold font-medium">HIP-4</span> testnet · Exploratory
          documentation — not official Hyperliquid documentation.
        </p>
        <Hip4SubNav />
        {children}
      </div>
    </>
  );
}
