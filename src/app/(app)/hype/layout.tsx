import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";
import { PageHeader } from "@/components/common";
import { HypePricePill, HypeScopeBar } from "@/components/hype";

export const metadata: Metadata = generateMetadata(seoConfig.hype);

/**
 * HYPE shell — header, live quote and scope bar, shared by every chapter.
 *
 * The price pill sits here rather than on the overview: the quote stays
 * relevant whichever chapter is open. Each chapter route owns its own sections
 * and only mounts its own hooks.
 */
export default function HypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <PageHeader
        title="HYPE"
        titleQualifier="· the Hyperliquid token"
        description="Supply and scarcity, the Assistance Fund buyback flywheel, protocol revenue, burn and staking."
        actions={<HypePricePill />}
      />
      <HypeScopeBar />
      {children}
    </div>
  );
}
