"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { toolForPath } from "@/lib/sidebar-config";
import { ELYSIUM_CHAIN_ID, ELYSIUM_MAINNET_PUBLIC, useElysiumNetwork, type ElysiumNet } from "@/store/use-elysium-network";

/**
 * Pages that follow the selected chain: the overview, address profiles and the
 * computed-analytics pages read the backend (both networks), and the builder
 * tools read the public testnet RPC or, on mainnet, the /elysium/rpc proxy.
 * Only /elysium/node (testnet snapshots) stays testnet-only.
 */
const MAINNET_READY = [
  /^\/elysium$/,
  /^\/elysium\/address\//,
  /^\/elysium\/(ecosystem|launchpads|fees|users|economics|dex|contracts|tokens|bridge)(\/|$)/,
  // Builder tools: reads go through the /elysium/rpc proxy on mainnet.
  /^\/elysium\/(simulate|decode|network|tx|check|start|trust)(\/|$)/,
];

/**
 * Elysium section header. A tool page (simulator, decoder...) is titled after
 * the tool, so a visitor landing on a shared link knows what they opened; every
 * other Elysium page keeps the section header. The network switch lives here.
 */
export function ElysiumPageHeader() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const tool = toolForPath(pathname);
  const { network, setNetwork } = useElysiumNetwork();

  // `?network=mainnet` previews the mainnet view before the switch goes public.
  const linked = sp.get("network");
  useEffect(() => {
    if (linked === "mainnet" || linked === "testnet") setNetwork(linked);
  }, [linked, setNetwork]);
  // Before launch, a stored "mainnet" from a preview only sticks while previewing.
  useEffect(() => {
    if (!ELYSIUM_MAINNET_PUBLIC && network === "mainnet" && linked !== "mainnet") setNetwork("testnet");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSwitch = ELYSIUM_MAINNET_PUBLIC || network === "mainnet";
  const badge = showSwitch ? (
    <PillTabs
      activeTab={network}
      onTabChange={(v) => setNetwork(v as ElysiumNet)}
      tabs={[{ value: "mainnet", label: "Mainnet" }, { value: "testnet", label: "Testnet" }]}
    />
  ) : (
    <StatusBadge variant="warning">Testnet</StatusBadge>
  );

  const testnetOnly = network === "mainnet" && !MAINNET_READY.some((re) => re.test(pathname));
  const notice = testnetOnly ? (
    <p className="rounded-md border border-gold/30 bg-gold/5 px-3 py-2 text-[12px] text-text-secondary">
      {tool
        ? "This tool runs on Elysium testnet: mainnet has no public RPC until launch. Overview and address pages already read mainnet."
        : "This page covers Elysium testnet: our mainnet indexing starts with the launch. Overview and address pages already read mainnet."}
    </p>
  ) : null;

  if (tool) {
    return (
      <div className="space-y-3">
        <PageHeader
          back={{ href: "/tools", label: "All tools" }}
          title={tool.name}
          titleQualifier="on Elysium"
          description={tool.description}
          actions={
            <>
              <StatusBadge variant="info">Tool</StatusBadge>
              {badge}
            </>
          }
        />
        {notice}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Elysium"
        titleQualifier="L2 on HyperEVM"
        description={`Arbitrum Orbit rollup settled on HyperEVM, HYPE as gas. Chain ${ELYSIUM_CHAIN_ID[network]}.`}
        actions={badge}
      />
      {notice}
    </div>
  );
}
