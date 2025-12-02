"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/formatters/digitFormat";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Menu, Loader2, ArrowLeft, DollarSign, TrendingUp, BarChart3, Percent, Gauge, Shield } from "lucide-react";

// Type pour les tokens perp
interface PerpToken {
  name: string;
  logo: string | null;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  openInterest: number;
  funding: number;
  maxLeverage: number;
  onlyIsolated: boolean;
}

// Données mockées pour le token perp
const mockPerpToken: PerpToken = {
  name: "BTC-PERP",
  logo: null,
  price: 65000,
  change24h: 2.5,
  volume: 25000000000,
  marketCap: 1250000000000,
  openInterest: 15000000000,
  funding: 0.01,
  maxLeverage: 100,
  onlyIsolated: false
};

export default function PerpTokenPage() {
  const router = useRouter();
  const [token, setToken] = useState<PerpToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Simuler le chargement des données
    const loadData = () => {
      setLoading(true);
      
      // Simuler un délai de chargement
      setTimeout(() => {
        setToken(mockPerpToken);
        setLoading(false);
      }, 1000);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="">
          <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
            <Header customTitle="Perpetual Token" showFees={true} />
          </div>
          <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
            <div className="flex justify-center items-center h-[200px]">
              <div className="flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
                <span className="text-zinc-500 text-sm">Loading...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="">
          <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
            <Header customTitle="Token Not Found" showFees={true} />
          </div>
          <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
            <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl shadow-black/20 flex flex-col items-center justify-center min-h-[50vh]">
              <div className="text-xl font-bold text-white mb-4">Token not found</div>
              <Button onClick={() => router.back()} className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="">
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
          <Header customTitle={`${token.name} - Perpetual`} showFees={true} />
        </div>
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search tokens..." />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          {/* Header with back button */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{token.name}</h1>
            <Button 
              onClick={() => router.back()} 
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info Card */}
            <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all shadow-xl shadow-black/20">
              <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">General Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
                      <DollarSign size={16} className="text-[#83e9ff]" />
                    </div>
                    <span className="text-zinc-400 text-sm">Price</span>
                  </div>
                  <span className="font-bold text-white">${formatNumber(token.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
                      <TrendingUp size={16} className="text-[#83e9ff]" />
                    </div>
                    <span className="text-zinc-400 text-sm">24h Change</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-sm ${token.change24h >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
                      <BarChart3 size={16} className="text-[#83e9ff]" />
                    </div>
                    <span className="text-zinc-400 text-sm">24h Volume</span>
                  </div>
                  <span className="font-bold text-white">${formatNumber(token.volume)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
                      <DollarSign size={16} className="text-[#83e9ff]" />
                    </div>
                    <span className="text-zinc-400 text-sm">Market Cap</span>
                  </div>
                  <span className="font-bold text-white">${formatNumber(token.marketCap)}</span>
                </div>
              </div>
            </div>

            {/* Market Details Card */}
            <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all shadow-xl shadow-black/20">
              <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">Market Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#f9e370]/10 flex items-center justify-center">
                      <BarChart3 size={16} className="text-[#f9e370]" />
                    </div>
                    <span className="text-zinc-400 text-sm">Open Interest</span>
                  </div>
                  <span className="font-bold text-white">${formatNumber(token.openInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#f9e370]/10 flex items-center justify-center">
                      <Percent size={16} className="text-[#f9e370]" />
                    </div>
                    <span className="text-zinc-400 text-sm">Funding Rate</span>
                  </div>
                  <span className="font-bold text-white">{token.funding}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#f9e370]/10 flex items-center justify-center">
                      <Gauge size={16} className="text-[#f9e370]" />
                    </div>
                    <span className="text-zinc-400 text-sm">Max Leverage</span>
                  </div>
                  <span className="font-bold text-white">{token.maxLeverage}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#f9e370]/10 flex items-center justify-center">
                      <Shield size={16} className="text-[#f9e370]" />
                    </div>
                    <span className="text-zinc-400 text-sm">Isolated Only</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-sm ${token.onlyIsolated ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {token.onlyIsolated ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 