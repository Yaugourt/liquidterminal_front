"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
import { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";

// Asset logo component with fallback
function AssetLogo({ assetName, isDelisted }: { assetName: string; isDelisted?: boolean }) {
  const [hasError, setHasError] = useState(false);
  const ticker = assetName.split(':')[1] || assetName;
  const logoUrl = `https://app.hyperliquid.xyz/coins/${assetName}.svg`;

  if (hasError) {
    return (
      <div className={`w-6 h-6 rounded-full bg-[#83E9FF20] flex items-center justify-center ${isDelisted ? 'opacity-50' : ''}`}>
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

  const { dex, isLoading, error, wsConnected } = usePerpDexWithMarketData(dexName);

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
      <span className="text-white font-mono text-sm">{truncateAddress(address)}</span>
      <button
        onClick={() => copyToClipboard(address, label)}
        className="text-[#83E9FF40] hover:text-[#83E9FF] transition-colors"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <Link
        href={`/explorer/address/${address}`}
        className="text-[#83E9FF40] hover:text-[#83E9FF] transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );

  const renderAssetBadges = (asset: PerpDexAssetWithMarketData) => {
    const badges = [];
    
    if (asset.isDelisted) {
      badges.push(
        <span key="delisted" className="px-1.5 py-0.5 bg-[#FF4D4F20] text-[#FF4D4F] text-[10px] rounded-full flex items-center gap-0.5">
          <AlertCircle className="h-2.5 w-2.5" />
          Delisted
        </span>
      );
    }
    
    if (asset.growthMode === 'enabled') {
      badges.push(
        <span key="growth" className="px-1.5 py-0.5 bg-[#52C41A20] text-[#52C41A] text-[10px] rounded-full flex items-center gap-0.5">
          <Sprout className="h-2.5 w-2.5" />
          Growth
        </span>
      );
    }
    
    return badges.length > 0 ? <div className="flex gap-1 mt-1">{badges}</div> : null;
  };

  if (isLoading && !dex) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
      </div>
    );
  }

  if (error || !dex) {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#051728] hover:bg-[#112941]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6 text-white" />
          </Button>
        </div>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="">
          <Header customTitle="PerpDex Not Found" showFees={true} />
          <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 max-w-[1920px] mx-auto">
            <Card className="p-8 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex flex-col items-center justify-center text-center">
                <Database className="w-16 h-16 mb-4 text-[#83E9FF4D]" />
                <h2 className="text-xl font-medium text-white mb-2">DEX Not Found</h2>
                <p className="text-[#FFFFFF80] mb-4">The PerpDex &quot;{dexName}&quot; was not found.</p>
                <Button onClick={() => router.push('/market/perpdex')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to PerpDexs
                </Button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#051728] hover:bg-[#112941]"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="">
        <Header customTitle={dex.fullName} showFees={true} />

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-6 max-w-[1920px] mx-auto">
          {/* Back button and title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/market/perpdex')}
                className="text-[#83E9FF] hover:text-[#83E9FF] hover:bg-[#83E9FF20]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#83E9FF20] to-[#f9e37020] flex items-center justify-center text-lg font-bold text-[#83E9FF]">
                  {dex.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-medium text-white">{dex.fullName}</h1>
                  <span className="text-[#83E9FF] text-sm">{dex.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#52C41A20] rounded-full">
                  <Wifi className="h-3 w-3 text-[#52C41A]" />
                  <span className="text-[#52C41A] text-xs">LIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#FF4D4F20] rounded-full">
                  <WifiOff className="h-3 w-3 text-[#FF4D4F]" />
                  <span className="text-[#FF4D4F] text-xs">OFFLINE</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats cards - 2 rows */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 24h Volume */}
            <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="h-3.5 w-3.5 text-[#52C41A]" />
                <span className="text-[#FFFFFF80] text-sm">24h Volume</span>
              </div>
              <span className="text-[#52C41A] text-sm font-medium">
                {dex.totalVolume24h > 0 
                  ? formatNumber(dex.totalVolume24h, format, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      currency: '$',
                      showCurrency: true
                    })
                  : '-'}
              </span>
            </Card>

            {/* Open Interest */}
            <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-[#83E9FF]" />
                <span className="text-[#FFFFFF80] text-sm">Open Interest</span>
              </div>
              <span className="text-[#83E9FF] text-sm font-medium">
                {dex.totalOpenInterest > 0 
                  ? formatNumber(dex.totalOpenInterest, format, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      currency: '$',
                      showCurrency: true
                    })
                  : '-'}
              </span>
            </Card>

            {/* Avg Funding */}
            <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="h-3.5 w-3.5 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Avg Funding</span>
              </div>
              <span className={`text-sm font-medium ${dex.avgFunding >= 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}`}>
                {formatFunding(dex.avgFunding)}
              </span>
            </Card>

            {/* Active Markets */}
            <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-1.5 mb-2">
                <Scale className="h-3.5 w-3.5 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Active Markets</span>
              </div>
              <span className="text-white text-sm font-medium">
                {dex.activeAssets}
                {dex.activeAssets !== dex.totalAssets && (
                  <span className="text-[#FF4D4F] text-xs ml-1">
                    ({dex.totalAssets - dex.activeAssets} delisted)
                  </span>
                )}
              </span>
            </Card>

            {/* OI Cap */}
            <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">OI Cap</span>
              </div>
              <span className="text-white text-sm font-medium">
                {formatNumber(dex.totalOiCap, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  currency: '$',
                  showCurrency: true
                })}
              </span>
            </Card>

            {/* Fee Scale */}
            <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-1.5 mb-2">
                <Wallet className="h-3.5 w-3.5 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Fee Scale</span>
              </div>
              <span className="text-[#52C41A] text-sm font-medium">
                {(dex.deployerFeeScale * 100).toFixed(0)}%
              </span>
            </Card>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Deployer */}
            <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Deployer</span>
              </div>
              {renderAddressLink(dex.deployer, 'Deployer address')}
            </Card>

            {/* Fee Recipient */}
            <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Fee Recipient</span>
              </div>
              {renderAddressLink(dex.feeRecipient, 'Fee recipient address')}
            </Card>

            {/* Oracle Updater or Sub Deployers */}
            {dex.oracleUpdater ? (
              <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-[#f9e370]" />
                  <span className="text-[#FFFFFF80] text-sm">Oracle Updater</span>
                </div>
                {renderAddressLink(dex.oracleUpdater, 'Oracle updater address')}
              </Card>
            ) : dex.subDeployers.length > 0 ? (
              <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-[#f9e370]" />
                  <span className="text-[#FFFFFF80] text-sm">Sub-Deployers ({dex.subDeployers.length})</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {dex.subDeployers.slice(0, 4).map((sub, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="text-[#83E9FF]">{sub.permission}</span>
                      <span className="text-[#FFFFFF60] ml-1">({sub.addresses.length})</span>
                    </div>
                  ))}
                  {dex.subDeployers.length > 4 && (
                    <span className="text-[#FFFFFF40] text-xs">+{dex.subDeployers.length - 4} more</span>
                  )}
                </div>
              </Card>
            ) : null}
          </div>

          {/* Markets table with live data */}
          <div>
            <h2 className="text-lg font-medium text-white mb-4">
              Markets ({dex.activeAssets} active / {dex.totalAssets} total)
            </h2>
            <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow className="border-none bg-[#051728]">
                      <TableHead className="text-white font-normal py-3 pl-4 w-[18%] text-xs text-left">Asset</TableHead>
                      <TableHead className="text-white font-normal py-3 w-[10%] text-xs text-right">Price</TableHead>
                      <TableHead className="text-white font-normal py-3 w-[8%] text-xs text-right">24h</TableHead>
                      <TableHead className="text-white font-normal py-3 w-[14%] text-xs text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Activity className="h-3 w-3 text-[#52C41A]" />
                          Volume
                        </div>
                      </TableHead>
                      <TableHead className="text-white font-normal py-3 w-[12%] text-xs text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <TrendingUp className="h-3 w-3 text-[#83E9FF]" />
                          OI
                        </div>
                      </TableHead>
                      <TableHead className="text-white font-normal py-3 w-[10%] text-xs text-right">Funding</TableHead>
                      <TableHead className="text-white font-normal py-3 w-[8%] text-xs text-center">Lev</TableHead>
                      <TableHead className="text-white font-normal py-3 pr-4 w-[12%] text-xs text-right">OI Cap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-[#051728]">
                    {dex.assetsWithMarketData.length > 0 ? (
                      dex.assetsWithMarketData.map((asset) => (
                        <TableRow 
                          key={asset.name}
                          className={`border-b border-[#FFFFFF1A] hover:bg-[#0a2035] ${asset.isDelisted ? 'opacity-50' : ''}`}
                        >
                          {/* Asset */}
                          <TableCell className="py-3 pl-4 text-left">
                            <div className="flex items-center gap-2">
                              <AssetLogo assetName={asset.name} isDelisted={asset.isDelisted} />
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-white text-sm font-medium">{getTicker(asset.name)}</span>
                                  <span className="text-[#FFFFFF60] text-sm">/</span>
                                  <span className={`text-xs font-medium ${asset.collateralToken === 'USDH' ? 'text-[#f9e370]' : 'text-[#52C41A]'}`}>
                                    {asset.collateralToken}
                                  </span>
                                </div>
                                {renderAssetBadges(asset)}
                              </div>
                            </div>
                          </TableCell>

                          {/* Price */}
                          <TableCell className="py-3 text-right">
                            <span className="text-white text-sm">
                              {asset.markPx 
                                ? `$${formatNumber(asset.markPx, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : '-'}
                            </span>
                          </TableCell>

                          {/* 24h Change */}
                          <TableCell className="py-3 text-right">
                            <span className={`text-sm ${(asset.priceChange24h ?? 0) >= 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}`}>
                              {formatPriceChange(asset.priceChange24h)}
                            </span>
                          </TableCell>

                          {/* Volume */}
                          <TableCell className="py-3 text-right">
                            <span className="text-[#52C41A] text-sm">
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
                          <TableCell className="py-3 text-right">
                            <span className="text-[#83E9FF] text-sm">
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
                          <TableCell className="py-3 text-right">
                            <span className={`text-sm ${(asset.funding ?? 0) >= 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}`}>
                              {formatFunding(asset.funding)}
                            </span>
                          </TableCell>

                          {/* Max Leverage */}
                          <TableCell className="py-3 text-center">
                            <span className="text-white text-sm">
                              {asset.maxLeverage}x
                            </span>
                          </TableCell>

                          {/* OI Cap */}
                          <TableCell className="py-3 pr-4 text-right">
                            <span className="text-white text-sm">
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
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
                            <p className="text-white text-lg">No markets available</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
