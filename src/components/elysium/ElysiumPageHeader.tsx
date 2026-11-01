"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { toolForPath } from "@/lib/sidebar-config";

/**
 * Elysium section header. A tool page (simulator, decoder...) is titled after
 * the tool, so a visitor landing on a shared link knows what they opened; every
 * other Elysium page keeps the section header.
 */
export function ElysiumPageHeader() {
  const tool = toolForPath(usePathname());
  const testnet = <StatusBadge variant="warning">Testnet</StatusBadge>;

  if (tool) {
    return (
      <PageHeader
        back={{ href: "/tools", label: "All tools" }}
        title={tool.name}
        titleQualifier="on Elysium"
        description={tool.description}
        actions={
          <>
            <StatusBadge variant="info">Tool</StatusBadge>
            {testnet}
          </>
        }
      />
    );
  }

  return (
    <PageHeader
      title="Elysium"
      titleQualifier="L2 on HyperEVM"
      description="Arbitrum Orbit rollup settled on HyperEVM, HYPE as gas. Chain 99801."
      actions={testnet}
    />
  );
}
