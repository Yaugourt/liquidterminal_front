"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PortfolioMarginView } from "@/components/market/portfolio-margin/PortfolioMarginView";

/** Market · Portfolio margin: Hyperliquid borrow/lend reserves and borrower health. */
export default function MarketPortfolioMarginPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => {
    setTitle("Portfolio Margin - Market");
  }, [setTitle]);
  return <PortfolioMarginView />;
}
