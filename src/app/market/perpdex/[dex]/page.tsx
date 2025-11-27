"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Clock
} from "lucide-react";
import { usePerpDex } from "@/services/market/perpDex/hooks";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { toast } from "sonner";

export default function PerpDexDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dexName = typeof params.dex === 'string' ? decodeURIComponent(params.dex) : '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { format } = useNumberFormat();

  const { dex, isLoading, isInitialLoading, error } = usePerpDex(dexName);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      <a
        href={`https://app.hyperliquid.xyz/explorer/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#83E9FF40] hover:text-[#83E9FF] transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );

  if (isInitialLoading) {
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

          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Deployer card */}
            <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Deployer</span>
              </div>
              {renderAddressLink(dex.deployer, 'Deployer address')}
            </Card>

            {/* Fee Recipient card */}
            <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Fee Recipient</span>
              </div>
              {renderAddressLink(dex.feeRecipient, 'Fee recipient address')}
            </Card>

            {/* Total Markets card */}
            <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Total Markets</span>
              </div>
              <span className="text-white text-xl font-medium">{dex.totalAssets}</span>
            </Card>

            {/* Fee Scale card */}
            <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-4 w-4 text-[#f9e370]" />
                <span className="text-[#FFFFFF80] text-sm">Fee Scale</span>
              </div>
              <span className="text-[#52C41A] text-xl font-medium">
                {(dex.deployerFeeScale * 100).toFixed(0)}%
              </span>
            </Card>
          </div>

          {/* Additional info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Oracle Updater */}
            {dex.oracleUpdater && (
              <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-[#f9e370]" />
                  <span className="text-[#FFFFFF80] text-sm">Oracle Updater</span>
                </div>
                {renderAddressLink(dex.oracleUpdater, 'Oracle updater address')}
              </Card>
            )}

            {/* Sub Deployers */}
            {dex.subDeployers.length > 0 && (
              <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-[#f9e370]" />
                  <span className="text-[#FFFFFF80] text-sm">Sub-Deployers ({dex.subDeployers.length})</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {dex.subDeployers.map((sub, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="text-[#83E9FF]">{sub.permission}:</span>
                      <span className="text-[#FFFFFF80] ml-2">
                        {sub.addresses.length} address{sub.addresses.length > 1 ? 'es' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Markets table */}
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Markets ({dex.totalAssets})</h2>
            <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none bg-[#051728]">
                      <TableHead className="text-white font-normal py-3 pl-4 w-[50%]">Asset</TableHead>
                      <TableHead className="text-white font-normal py-3 w-[50%]">Streaming OI Cap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-[#051728]">
                    {dex.assets.length > 0 ? (
                      dex.assets.map((asset) => (
                        <TableRow 
                          key={asset.name}
                          className="border-b border-[#FFFFFF1A] hover:bg-[#051728]"
                        >
                          <TableCell className="py-3 pl-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#83E9FF20] flex items-center justify-center text-xs font-bold text-[#83E9FF]">
                                {asset.name.split(':')[1]?.charAt(0) || asset.name.charAt(0)}
                              </div>
                              <span className="text-white text-sm">{asset.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
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
                        <TableCell colSpan={2} className="text-center py-8">
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

          {/* Total OI Cap summary */}
          <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D]">
            <div className="flex items-center justify-between">
              <span className="text-[#FFFFFF80]">Total Streaming OI Cap</span>
              <span className="text-white text-xl font-medium">
                {formatNumber(dex.totalOiCap, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  currency: '$',
                  showCurrency: true
                })}
              </span>
            </div>
          </Card>
        </main>
      </div>

      {/* Loading indicator for background refresh */}
      {isLoading && !isInitialLoading && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-[#051728] border border-[#83E9FF4D] rounded-lg px-3 py-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#83E9FF]" />
            <span className="text-[#83E9FF] text-xs">Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

