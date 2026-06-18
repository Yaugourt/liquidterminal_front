"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePageTitle } from "@/store/use-page-title";
import { AddressHero } from "./AddressHero";
import { AddressSummary, type AddressSummaryVariant } from "./AddressSummary";
import { AddressTabBar } from "./AddressTabBar";
import {
  ADDRESS_TAB_REGISTRY,
  ALL_ADDRESS_TABS,
  resolveTabs,
  type AddressTabId,
} from "./address-tabs.config";

import { AddressTransactionList } from "@/components/explorer/address";
import { AssetsSection } from "@/components/market/tracker/assets";
import {
  OrdersSection,
  AddressTwapSection,
} from "@/components/explorer/address/orders";
import { WalletRecentFillsSection } from "@/components/market/tracker/fills";
import { VaultDepositList } from "@/components/explorer/address/VaultDepositList";
import { StakingTable } from "@/components/explorer/address/StakingTable";
import { useTransactions } from "@/services/explorer/address";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

interface AddressAnalyticsLayoutProps {
  address: string;
  /** Restrict visible tabs. Defaults to all 7 tabs. */
  tabs?: AddressTabId[];
  /** Tab active on first mount (must be part of `tabs`). */
  defaultTab?: AddressTabId;
  /**
   * Summary variant.
   * - `explorer` (default): 3 stat cards, on-chain emphasis.
   * - `tracker`: PortfolioStats + PerformanceChart, trading emphasis.
   */
  summaryVariant?: AddressSummaryVariant;
  /** Override the default page title ("Address 0x1234...abcd"). */
  titleOverride?: string;
}

/**
 * Canonical layout for the address analytics page.
 * Used by both `/explorer/address/[address]` and `/market/tracker/wallet/[address]`.
 *
 * Key features:
 * - Validates the address format up-front (shows a friendly invalid-state card).
 * - Shared hero + summary + tab bar.
 * - Lazy-mount + keep-alive pattern for tab panels: each panel is only mounted
 *   on first visit, then stays in memory so switching tabs is instant.
 */
export function AddressAnalyticsLayout({
  address,
  tabs,
  defaultTab,
  summaryVariant = "explorer",
  titleOverride,
}: AddressAnalyticsLayoutProps) {
  const { setTitle } = usePageTitle();

  const visibleTabs = useMemo(() => {
    const resolved = resolveTabs(tabs);
    return resolved.length > 0 ? resolved : resolveTabs(ALL_ADDRESS_TABS);
  }, [tabs]);

  const initialTab: AddressTabId = useMemo(() => {
    if (defaultTab && visibleTabs.some((t) => t.id === defaultTab)) {
      return defaultTab;
    }
    return visibleTabs[0].id;
  }, [defaultTab, visibleTabs]);

  const [activeTab, setActiveTab] = useState<AddressTabId>(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<AddressTabId>>(
    new Set([initialTab])
  );

  const isValidAddress = ADDRESS_REGEX.test(address);

  useEffect(() => {
    const title =
      titleOverride ??
      `Address ${address.slice(0, 6)}...${address.slice(-4)}`;
    setTitle(title);
  }, [setTitle, address, titleOverride]);

  const handleTabChange = useCallback((tabId: string) => {
    const next = tabId as AddressTabId;
    setActiveTab(next);
    setVisitedTabs((prev) => {
      if (prev.has(next)) return prev;
      const updated = new Set(prev);
      updated.add(next);
      return updated;
    });
  }, []);

  if (!isValidAddress) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-danger" />
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Invalid Address
          </h2>
          <p className="mb-4 text-text-secondary">
            &quot;{address}&quot; is not a valid Ethereum address.
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-brand font-semibold text-black hover:bg-brand/90"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AddressHero address={address} />

      <AddressSummary address={address} variant={summaryVariant} />

      <AddressTabBar
        tabs={visibleTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <div>
        {visibleTabs.map((tab) => {
          if (!visitedTabs.has(tab.id)) return null;
          const isActive = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              className={isActive ? "animate-in fade-in duration-200" : "hidden"}
              role="tabpanel"
              aria-hidden={!isActive}
            >
              <AddressTabPanel tabId={tab.id} address={address} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AddressTabPanelProps {
  tabId: AddressTabId;
  address: string;
}

function AddressTabPanel({ tabId, address }: AddressTabPanelProps) {
  switch (tabId) {
    case "transactions":
      return <TransactionsTabPanel address={address} />;
    case "holdings":
      return <AssetsSection initialViewType="spot" addressOverride={address} />;
    case "orders":
      return <OrdersSection address={address} />;
    case "twap":
      return <AddressTwapSection address={address} />;
    case "fills":
      return <WalletRecentFillsSection address={address} />;
    case "vaults":
      return <VaultDepositList address={address} />;
    case "staking":
      return <StakingTable address={address} />;
    default: {
      const _exhaustive: never = tabId;
      void _exhaustive;
      const label = ADDRESS_TAB_REGISTRY[tabId as AddressTabId]?.label ?? tabId;
      return (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-border-subtle bg-surface/60">
          <p className="text-brand">Coming soon: {label}</p>
        </div>
      );
    }
  }
}

function TransactionsTabPanel({ address }: { address: string }) {
  const { transactions, isLoading, error } = useTransactions(address);
  return (
    <AddressTransactionList
      transactions={transactions || []}
      isLoading={isLoading}
      error={error}
      currentAddress={address}
    />
  );
}
