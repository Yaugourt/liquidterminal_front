import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";
import { PageHeader } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";

// Each Elysium page sets its own title and canonical in its layout (seoConfig.elysium*).
export const metadata: Metadata = generateMetadata(seoConfig.elysium);

/** Elysium section shell: header with an explicit testnet status. */
export default function ElysiumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Elysium"
        titleQualifier="L2 on HyperEVM"
        description="Arbitrum Orbit rollup settled on HyperEVM, HYPE as gas. Chain 99801."
        actions={<StatusBadge variant="warning">Testnet</StatusBadge>}
      />
      {children}
    </div>
  );
}
