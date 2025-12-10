import { useState } from "react";
import { Loader2, Database } from "lucide-react";
import { useTransfers, useDeploys } from "@/services/explorer";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { formatDistanceToNowStrict } from "date-fns";
import { ActivityTab } from "@/components/types/explorer.types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
import { AddressDisplay } from "@/components/ui/address-display";


export function TransfersDeployTable() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("transfers");

  const transfersPagination = usePagination({ initialRowsPerPage: 5 });
  const deploysPagination = usePagination({ initialRowsPerPage: 5 });

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const { transfers, isLoading: isLoadingTransfers, error: transfersError } = useTransfers();
  const { deploys, isLoading: isLoadingDeploys, error: deploysError } = useDeploys();



  const TransfersContent = () => {
    const allTransfers = transfers || [];
    const paginatedTransfers = allTransfers.slice(transfersPagination.startIndex, transfersPagination.endIndex);

    if (isLoadingTransfers) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-zinc-500 text-sm">Loading...</span>
          </div>
        </div>
      );
    }

    if (transfersError) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-rose-400" />
            <p className="text-rose-400 text-sm mb-1">An error occurred</p>
            <p className="text-zinc-500 text-xs">Please try again later</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Time</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Amount</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">From</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">To</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((transfer) => (
                  <TableRow key={transfer.hash} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3 px-3 text-sm text-white font-medium">
                      {formatDistanceToNowStrict(transfer.timestamp, { addSuffix: false })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm text-white font-medium">
                      {(() => {
                        const numericAmount = typeof transfer.amount === 'string' ? parseFloat(transfer.amount) : transfer.amount;
                        return `${formatNumber(numericAmount, format, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2
                        })} ${transfer.token}`;
                      })()}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm">
                      <AddressDisplay address={transfer.from} />
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm">
                      <AddressDisplay address={transfer.to} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 border-none">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Database className="w-10 h-10 mb-3 text-zinc-600" />
                      <p className="text-zinc-400 text-sm mb-1">No transfers available</p>
                      <p className="text-zinc-600 text-xs">Come back later</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {allTransfers.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5">
            <Pagination
              total={allTransfers.length}
              page={transfersPagination.page}
              rowsPerPage={transfersPagination.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={transfersPagination.onPageChange}
              onRowsPerPageChange={transfersPagination.onRowsPerPageChange}
              disabled={isLoadingTransfers}
            />
          </div>
        )}
      </div>
    );
  };

  const DeployContent = () => {
    const allDeploys = deploys || [];
    const paginatedDeploys = allDeploys.slice(deploysPagination.startIndex, deploysPagination.endIndex);

    if (isLoadingDeploys) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-zinc-500 text-sm">Loading...</span>
          </div>
        </div>
      );
    }

    if (deploysError) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-rose-400" />
            <p className="text-rose-400 text-sm mb-1">An error occurred</p>
            <p className="text-zinc-500 text-xs">Please try again later</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Time</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">User</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Action</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Hash</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDeploys.length > 0 ? (
                paginatedDeploys.map((deploy) => (
                  <TableRow key={deploy.hash} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3 px-3 text-sm text-white font-medium">
                      {formatDateTime(deploy.timestamp, dateFormat)}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm">
                      <AddressDisplay address={deploy.user} />
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm">
                      <StatusBadge variant={deploy.status === 'error' ? 'error' : 'success'}>
                        {deploy.action}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm text-[#83E9FF]">
                      <AddressDisplay address={deploy.hash} showCopy={false} showExternalLink={true} className="text-[#83E9FF]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 border-none">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Database className="w-10 h-10 mb-3 text-zinc-600" />
                      <p className="text-zinc-400 text-sm mb-1">No deploys available</p>
                      <p className="text-zinc-600 text-xs">Come back later</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {allDeploys.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5">
            <Pagination
              total={allDeploys.length}
              page={deploysPagination.page}
              rowsPerPage={deploysPagination.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={deploysPagination.onPageChange}
              onRowsPerPageChange={deploysPagination.onRowsPerPageChange}
              disabled={isLoadingDeploys}
            />
          </div>
        )}
      </div>
    );
  };

  const tabs: { key: ActivityTab; label: string }[] = [
    { key: 'transfers', label: 'Transfers' },
    { key: 'deploy', label: 'Deploy' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="flex items-center gap-2 p-4 border-b border-white/5">
        <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === "transfers" && <TransfersContent />}
        {activeTab === "deploy" && <DeployContent />}
      </div>
    </div>
  );
} 