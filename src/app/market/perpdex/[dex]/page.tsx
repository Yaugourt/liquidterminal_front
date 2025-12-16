"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ArrowLeft,
  Database,
  TrendingUp,
  Scale,
  Activity,
  Zap,
  Wallet,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";
import { usePerpDexWithMarketData } from "@/services/market/perpDex/hooks";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useWindowSize } from "@/hooks/use-window-size";
import { PerpDexMarketsTable } from "@/components/market/perpDex";
import { AddressDisplay } from "@/components/ui/address-display";

import { toast } from "sonner";

export default function PerpDexDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dexName = typeof params.dex === 'string' ? decodeURIComponent(params.dex) : '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { format } = useNumberFormat();
  const { width } = useWindowSize();

  const { dex, isLoading, error, wsConnected } = usePerpDexWithMarketData(dexName);

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

  const formatFunding = (funding: number | undefined) => {
    if (funding === undefined) return '-';
    const percentage = funding * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading && !dex) {
    return (
      <div className="min-h-screen bg-brand-main flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (error || !dex) {
    return (
      <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505]">
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="">
          <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-main/80 border-b border-white/5">
            <Header customTitle="PerpDex Not Found" showFees={true} />
          </div>
          <main className="px-6 py-8 max-w-[1920px] mx-auto">
            <div className="p-8 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20">
              <div className="flex flex-col items-center justify-center text-center">
                <Database className="w-12 h-12 mb-4 text-zinc-600" />
                <h2 className="text-xl font-medium text-white mb-2">DEX Not Found</h2>
                <p className="text-zinc-400 mb-4">The PerpDex &quot;{dexName}&quot; was not found.</p>
                <Button onClick={() => router.push('/market/perpdex')} className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to PerpDexs
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505]">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="">
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-main/80 border-b border-white/5">
          <Header customTitle={dex.fullName} showFees={true} />
        </div>

        <main className="px-6 py-8 space-y-6 max-w-[1920px] mx-auto">
          {/* Back button and title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/market/perpdex')}
                className="text-brand-accent hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-lg font-bold text-brand-accent">
                  {dex.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{dex.fullName}</h1>
                  <span className="text-brand-accent text-sm">{dex.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full">
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">LIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 rounded-full">
                  <WifiOff className="h-3 w-3 text-rose-400" />
                  <span className="text-rose-400 text-xs font-medium">OFFLINE</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 24h Volume */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Activity className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">24h Volume</span>
              </div>
              <span className="text-white font-bold text-lg">
                {dex.totalVolume24h > 0
                  ? formatNumber(dex.totalVolume24h, format, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    currency: '$',
                    showCurrency: true
                  })
                  : '-'}
              </span>
            </div>

            {/* Open Interest */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <TrendingUp className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Open Interest</span>
              </div>
              <span className="text-white font-bold text-lg">
                {dex.totalOpenInterest > 0
                  ? formatNumber(dex.totalOpenInterest, format, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    currency: '$',
                    showCurrency: true
                  })
                  : '-'}
              </span>
            </div>

            {/* Avg Funding */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Zap className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Avg Funding</span>
              </div>
              <span className={`font-bold text-lg ${dex.avgFunding >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatFunding(dex.avgFunding)}
              </span>
            </div>

            {/* Active Markets */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Scale className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Active Markets</span>
              </div>
              <span className="text-white font-bold text-lg">
                {dex.activeAssets}
                {dex.activeAssets !== dex.totalAssets && (
                  <span className="text-zinc-500 text-sm font-normal ml-1">
                    / {dex.totalAssets}
                  </span>
                )}
              </span>
            </div>

            {/* OI Cap */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <TrendingUp className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">OI Cap</span>
              </div>
              <span className="text-white font-bold text-lg">
                {formatNumber(dex.totalOiCap, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  currency: '$',
                  showCurrency: true
                })}
              </span>
            </div>

            {/* Fee Scale */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Wallet className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Fee Scale</span>
              </div>
              <span className="text-white font-bold text-lg">
                {(dex.deployerFeeScale * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Deployer Card */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Database className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">DEPLOYER</span>
              </div>
              <AddressDisplay
                address={dex.deployer}
                showExternalLink={true}
                externalLinkHref={`/explorer/address/${dex.deployer}`}
                copyMessage="Deployer address copied"
                className="text-brand-accent font-mono text-sm"
              />
            </div>

            {/* Fee Recipient Card */}
            <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Wallet className="h-3 w-3 text-brand-accent" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">FEE RECIPIENT</span>
              </div>
              <AddressDisplay
                address={dex.feeRecipient}
                showExternalLink={true}
                externalLinkHref={`/explorer/address/${dex.feeRecipient}`}
                copyMessage="Fee recipient address copied"
                className="text-brand-accent font-mono text-sm"
              />
            </div>

            {/* Oracle Updater or Sub Deployers */}
            {dex.oracleUpdater ? (
              <AddressDisplay
                address={dex.oracleUpdater!}
                label="Oracle Updater"
                copyMessage="Oracle updater address copied"
                className="text-zinc-400 font-mono text-sm"
              />
            ) : dex.subDeployers.length > 0 ? (
              <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                    <Wallet className="h-3 w-3 text-brand-accent" />
                  </div>
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Sub-Deployers ({dex.subDeployers.length})</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {dex.subDeployers.slice(0, 4).map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-brand-accent shrink-0">{sub.permission}</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {sub.addresses.slice(0, 2).map((addr, addrIdx) => (
                          <div
                            key={addrIdx}
                            className="cursor-pointer"
                            onClick={() => copyToClipboard(addr, "Sub-deployer address")}
                          >
                            <span className="text-zinc-400 font-mono text-[10px] hover:text-brand-accent transition-colors bg-white/5 px-1.5 py-0.5 rounded">
                              {truncateAddress(addr)}
                            </span>
                          </div>
                        ))}
                        {sub.addresses.length > 2 && (
                          <span className="text-zinc-600 text-[10px]">+{sub.addresses.length - 2}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {dex.subDeployers.length > 4 && (
                    <span className="text-zinc-600 text-xs">+{dex.subDeployers.length - 4} more permissions</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Markets table with live data */}
          <PerpDexMarketsTable
            assets={dex.assetsWithMarketData}
            totalAssets={dex.totalAssets}
            activeAssets={dex.activeAssets}
          />
        </main>
      </div>
    </div>
  );
}
