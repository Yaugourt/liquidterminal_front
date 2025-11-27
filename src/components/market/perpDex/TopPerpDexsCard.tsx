"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { usePerpDexs } from "@/services/market/perpDex/hooks";
import { Loader2, Database, Building2, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNumberFormat } from "@/store/number-format.store";
import { useRouter } from "next/navigation";

/**
 * Card showing top PerpDexs by OI Cap
 */
export const TopPerpDexsCard = memo(function TopPerpDexsCard() {
  const router = useRouter();
  const { format } = useNumberFormat();
  const { data, isLoading, error } = usePerpDexs({
    defaultParams: { sortBy: 'totalOiCap', sortOrder: 'desc' }
  });

  // Get top 5
  const topDexs = data?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg h-full">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg h-full">
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500 text-sm">Failed to load data</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg h-full flex flex-col">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="text-white text-sm py-1.5 bg-[#051728] pl-4 w-[45%]">
                <div className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#f9e370]" />
                  <span className="font-normal">Top DEXs</span>
                </div>
              </TableHead>
              <TableHead className="text-white text-sm py-1.5 bg-[#051728] text-center w-[20%] font-normal">
                Markets
              </TableHead>
              <TableHead className="text-white text-sm py-1.5 bg-[#051728] pr-4 w-[35%] font-normal">
                OI Cap
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {topDexs.length > 0 ? (
              topDexs.map((dex) => (
                <TableRow
                  key={dex.name}
                  className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer group"
                  style={{ height: `${100 / Math.max(topDexs.length, 5)}%` }}
                  onClick={() => router.push(`/market/perpdex/${dex.name}`)}
                >
                  <TableCell className="py-1.5 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#83E9FF20] to-[#f9e37020] flex items-center justify-center text-xs font-bold text-[#83E9FF]">
                        {dex.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-medium">{dex.fullName}</span>
                        <span className="text-[#83E9FF80] text-[10px]">{dex.name}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-[#83E9FF40] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-white text-xs py-1.5">
                    {dex.totalAssets}
                  </TableCell>
                  <TableCell className="text-left text-white text-xs py-1.5 pr-4">
                    {formatNumber(dex.totalOiCap, format, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      currency: '$',
                      showCurrency: true
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
                    <p className="text-white text-lg">No DEXs available</p>
                    <p className="text-[#FFFFFF80] text-sm mt-2">Check back later</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
});

