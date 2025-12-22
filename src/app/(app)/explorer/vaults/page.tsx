"use client";

import React from "react";
import { VaultStatsCard, VaultSection, VaultChartSection } from "@/components/explorer/vault";

export default function VaultsPage() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:items-stretch">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <VaultStatsCard />
        </div>
        <div className="md:col-span-3 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <VaultChartSection
            vaultAddress="0xdfc24b077bc1425ad1dea75bcb6f8158e10df303"
          />
        </div>
      </div>

      <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <VaultSection />
      </div>
    </>
  );
}