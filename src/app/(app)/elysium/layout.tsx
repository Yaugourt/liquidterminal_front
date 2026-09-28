import { Metadata } from "next";
import { PageHeader } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Elysium Testnet Dashboard | Liquid Terminal",
  description:
    "Live Elysium testnet data: blocks, transactions, active addresses, bridge transfers and reserves, and batches settled on HyperEVM.",
};

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
