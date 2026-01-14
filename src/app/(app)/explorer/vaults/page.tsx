import React from "react";
import { VaultStatsCard, VaultSection, VaultChartSection } from "@/components/explorer/vault";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function VaultsPage() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-stretch">
        <GlassPanel>
          <VaultStatsCard />
        </GlassPanel>
        <GlassPanel className="md:col-span-2">
          <VaultChartSection
            vaultAddress="0xdfc24b077bc1425ad1dea75bcb6f8158e10df303"
          />
        </GlassPanel>
      </div>

      <GlassPanel>
        <VaultSection />
      </GlassPanel>
    </>
  );
}