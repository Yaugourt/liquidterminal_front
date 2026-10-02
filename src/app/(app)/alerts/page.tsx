"use client";

import { AlertsWorkbench } from "@/components/alerts/AlertsWorkbench";
import { PageHeader } from "@/components/common";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        titleQualifier="Hyperliquid, straight to Telegram"
        description="Price levels and moves, extreme funding, open interest surges, liquidation cascades and new listings. Free, delivered within seconds."
      />
      <AlertsWorkbench />
    </div>
  );
}
