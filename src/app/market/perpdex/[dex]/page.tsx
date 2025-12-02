"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Menu, 
  ArrowLeft, 
  Building2, 
  Wallet, 
  Users, 
  ExternalLink,
  Copy,
  Loader2,
  Database,
  TrendingUp,
  Scale,
  Clock,
  Activity,
  Zap,
  AlertCircle,
  Sprout,
  Wifi,
  WifiOff
} from "lucide-react";
import { usePerpDexWithMarketData } from "@/services/market/perpDex/hooks";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useWindowSize } from "@/hooks/use-window-size";
import { toast } from "sonner";
import { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";

// Asset logo component with fallback
function AssetLogo({ assetName, isDelisted }: { assetName: string; isDelisted?: boolean }) {
  const [hasError, setHasError] = useState(false);
  const ticker = assetName.split(':')[1] || assetName;
  const logoUrl = `https://app.hyperliquid.xyz/coins/${assetName}.svg`;

  if (hasError) {
    return (
      <div className={`w-6 h-6 rounded-full bg-[#83E9FF]/20 flex items-center justify-center ${isDelisted ? 'opacity-50' : ''}`}>
        <span className="text-xs font-bold text-[#83E9FF]">{ticker.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center ${isDelisted ? 'opacity-50' : ''}`}>
      <img 
        src={logoUrl} 
        alt={assetName}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatFunding = (funding: number | undefined) => {
    if (funding === undefined) return '-';
    const percentage = funding * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
  };

  const formatPriceChange = (change: number | undefined) => {
    if (change === undefined) return '-';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  // Extract ticker from full asset name (e.g., "xyz:NVDA" -> "NVDA")
  const getTicker = (assetName: string) => {
    const parts = assetName.split(':');
    return parts.length > 1 ? parts[1] : assetName;
  };

  const renderAddressLink = (address: string, label: string) => (
    <div className="flex items-center gap-2">
      <Link
        href={`/explorer/address/${address}`}
        className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
      >
        {truncateAddress(address)}
      </Link>
      <button
        onClick={() => copyToClipboard(address, label)}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <Copy className="h-3 w-3" />
      </button>
      <Link
        href={`/explorer/address/${address}`}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );

  const renderAssetBadges = (asset: PerpDexAssetWithMarketData) => {
    const badges = [];
    
    // Always show leverage
    badges.push(
      <span key="leverage" className="text-zinc-500 text-[10px]">
        {asset.maxLeverage}x
      </span>
    );
    
    if (asset.growthMode === 'enabled') {
      badges.push(
        <span key="growth" className="text-emerald-400 text-[10px] flex items-center gap-0.5">
          <Sprout className="h-2.5 w-2.5" />
          Growth
        </span>
      );
    }
    
    if (asset.isDelisted) {
      badges.push(
        <span key="delisted" className="text-rose-400 text-[10px] flex items-center gap-0.5">
          <AlertCircle className="h-2.5 w-2.5" />
          Delisted
        </span>
      );
    }
    
    return <div className="flex items-center gap-2 mt-0.5">{badges}</div>;
  };

  if (isLoading && !dex) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
      </div>
    );
  }

  if (error || !dex) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
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
          <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
            <Header customTitle="PerpDex Not Found" showFees={true} />
          </div>
          <main className="px-6 py-8 max-w-[1920px] mx-auto">
            <div className="p-8 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20">
              <div className="flex flex-col items-center justify-center text-center">
                <Database className="w-12 h-12 mb-4 text-zinc-600" />
                <h2 className="text-xl font-medium text-white mb-2">DEX Not Found</h2>
                <p className="text-zinc-400 mb-4">The PerpDex &quot;{dexName}&quot; was not found.</p>
                <Button onClick={() => router.push('/market/perpdex')} className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728]">
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
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
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
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
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
                className="text-[#83E9FF] hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#83E9FF]/20 to-[#f9e370]/20 flex items-center justify-center text-lg font-bold text-[#83E9FF]">
                  {dex.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{dex.fullName}</h1>
                  <span className="text-[#83E9FF] text-sm">{dex.name}</span>
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
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Activity className="h-3 w-3 text-[#83e9ff]" />
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
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <TrendingUp className="h-3 w-3 text-[#83e9ff]" />
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
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Zap className="h-3 w-3 text-[#83e9ff]" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Avg Funding</span>
              </div>
              <span className={`font-bold text-lg ${dex.avgFunding >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatFunding(dex.avgFunding)}
              </span>
            </div>

            {/* Active Markets */}
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Scale className="h-3 w-3 text-[#83e9ff]" />
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
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <TrendingUp className="h-3 w-3 text-[#83e9ff]" />
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
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Wallet className="h-3 w-3 text-[#83e9ff]" />
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
            {/* Deployer */}
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-[#83e9ff]" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Deployer</span>
              </div>
              {renderAddressLink(dex.deployer, 'Deployer address')}
            </div>

            {/* Fee Recipient */}
            <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center">
                  <Wallet className="h-3 w-3 text-[#83e9ff]" />
                </div>
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Fee Recipient</span>
              </div>
              {renderAddressLink(dex.feeRecipient, 'Fee recipient address')}
            </div>

            {/* Oracle Updater or Sub Deployers */}
            {dex.oracleUpdater ? (
              <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center">
                    <Clock className="h-3 w-3 text-[#83e9ff]" />
                  </div>
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Oracle Updater</span>
                </div>
                {renderAddressLink(dex.oracleUpdater, 'Oracle updater address')}
              </div>
            ) : dex.subDeployers.length > 0 ? (
              <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center">
                    <Users className="h-3 w-3 text-[#83e9ff]" />
                  </div>
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Sub-Deployers ({dex.subDeployers.length})</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {dex.subDeployers.slice(0, 4).map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-[#83E9FF] shrink-0">{sub.permission}</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {sub.addresses.slice(0, 2).map((addr, addrIdx) => (
                          <Link
                            key={addrIdx}
                            href={`/explorer/address/${addr}`}
                            className="text-zinc-400 font-mono text-[10px] hover:text-[#83E9FF] transition-colors bg-white/5 px-1.5 py-0.5 rounded"
                          >
                            {truncateAddress(addr)}
                          </Link>
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
          <div>
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">
              Markets ({dex.activeAssets} active / {dex.totalAssets} total)
            </h2>
            <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow className="border-b border-white/5 hover:bg-transparent">
                      <TableHead className="py-3 pl-4 w-[22%]">
                        <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Asset</span>
                      </TableHead>
                      <TableHead className="py-3 w-[12%]">
                        <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Price</span>
                      </TableHead>
                      <TableHead className="py-3 w-[10%]">
                        <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">24h</span>
                      </TableHead>
                      <TableHead className="py-3 w-[14%]">
                        <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Volume</span>
                      </TableHead>
                      <TableHead className="py-3 w-[14%]">
                        <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">OI</span>
                      </TableHead>
                      <TableHead className="py-3 w-[12%]">
                        <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Funding</span>
                      </TableHead>
                      <TableHead className="py-3 pr-4 w-[16%]">
                        <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">OI Cap</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dex.assetsWithMarketData.length > 0 ? (
                      dex.assetsWithMarketData.map((asset) => (
                        <TableRow 
                          key={asset.name}
                          className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${asset.isDelisted ? 'opacity-50' : ''}`}
                        >
                          {/* Asset */}
                          <TableCell className="py-3 pl-4 text-left">
                            <div className="flex items-center gap-2">
                              <AssetLogo assetName={asset.name} isDelisted={asset.isDelisted} />
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-white text-sm font-medium">{getTicker(asset.name)}</span>
                                  <span className="text-zinc-600 text-sm">/</span>
                                  <span className="text-zinc-500 text-xs">
                                    {asset.collateralToken}
                                  </span>
                                </div>
                                {renderAssetBadges(asset)}
                              </div>
                            </div>
                          </TableCell>

                          {/* Price */}
                          <TableCell className="py-3 text-left">
                            <span className="text-white text-sm font-medium">
                              {asset.markPx 
                                ? `$${formatNumber(asset.markPx, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : '-'}
                            </span>
                          </TableCell>

                          {/* 24h Change */}
                          <TableCell className="py-3 text-left">
                            <span className={`text-sm font-medium ${(asset.priceChange24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatPriceChange(asset.priceChange24h)}
                            </span>
                          </TableCell>

                          {/* Volume */}
                          <TableCell className="py-3 text-left">
                            <span className="text-white text-sm font-medium">
                              {asset.dayNtlVlm && asset.dayNtlVlm > 0
                                ? formatNumber(asset.dayNtlVlm, format, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                    currency: '$',
                                    showCurrency: true
                                  })
                                : '-'}
                            </span>
                          </TableCell>

                          {/* Open Interest */}
                          <TableCell className="py-3 text-left">
                            <span className="text-white text-sm font-medium">
                              {asset.openInterest && asset.openInterest > 0
                                ? formatNumber(asset.openInterest, format, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                    currency: '$',
                                    showCurrency: true
                                  })
                                : '-'}
                            </span>
                          </TableCell>

                          {/* Funding */}
                          <TableCell className="py-3 text-left">
                            <span className={`text-sm font-medium ${(asset.funding ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatFunding(asset.funding)}
                            </span>
                          </TableCell>

                          {/* OI Cap */}
                          <TableCell className="py-3 pr-4 text-left">
                            <span className="text-white text-sm font-medium">
                              {formatNumber(asset.streamingOiCap, format, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                                currency: '$',
                                showCurrency: true
                              })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Database className="w-10 h-10 mb-3 text-zinc-600" />
                            <p className="text-zinc-400 text-sm mb-1">No markets available</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
