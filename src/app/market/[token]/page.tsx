"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";

export default function TokenPage() {
  const { setTitle } = usePageTitle();
  const params = useParams();
  const token = params.token as string;
  const tokenName = decodeURIComponent(token);

  useEffect(() => {
    setTitle(`${tokenName} - Market`);
  }, [setTitle, tokenName]);

  return (
    <div className="min-h-screen">
      {/* En-tête avec le nom du token */}
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-white">{tokenName}</h2>
      </div>

      {/* 3 Cards en colonnes sur mobile, en ligne sur desktop */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart Card */}
          <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
            <h3 className="text-white text-lg mb-4">Chart</h3>
            <div className="h-[400px] flex items-center justify-center text-white/60">
              Chart à venir
            </div>
          </Card>

          {/* Order Book Card */}
          <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
            <h3 className="text-white text-lg mb-4">Order Book</h3>
            <div className="h-[400px] flex items-center justify-center text-white/60">
              Order Book à venir
            </div>
          </Card>

          {/* Trades Card */}
          <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
            <h3 className="text-white text-lg mb-4">Trades</h3>
            <div className="h-[400px] flex items-center justify-center text-white/60">
              Trades à venir
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
