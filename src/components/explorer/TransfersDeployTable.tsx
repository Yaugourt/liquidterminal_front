import { useState } from "react";
import { Copy, ExternalLink, Check, Loader2, Database } from "lucide-react";
import { useTransfers, useDeploys } from "@/services/explorer";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { ActivityTab } from "@/components/types/explorer.types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/common/pagination";

export function TransfersDeployTable() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("transfers");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transfersPage, setTransfersPage] = useState(0);
  const [transfersRowsPerPage, setTransfersRowsPerPage] = useState(5);
  const [deploysPage, setDeploysPage] = useState(0);
  const [deploysRowsPerPage, setDeploysRowsPerPage] = useState(5);
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  
  const { transfers, isLoading: isLoadingTransfers, error: transfersError } = useTransfers();
  const { deploys, isLoading: isLoadingDeploys, error: deploysError } = useDeploys();

  const truncateHash = (hash: string) => {
    if (hash.length > 12) {
      return `${hash.substring(0, 4)}..${hash.substring(hash.length - 3)}`;
    }
    return hash;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
          } catch {
        // Error handled silently
      }
  };

  const AddressLink = ({ address }: { address: string }) => (
    <div className="flex items-center gap-1.5">
      <Link 
        href={`/explorer/address/${address}`}
        prefetch={false}
        className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
      >
        {truncateHash(address)}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          copyToClipboard(address);
        }}
        className="group p-1 rounded transition-colors"
      >
        {copiedAddress === address ? (
          <Check className="h-3 w-3 text-green-500 transition-all duration-200" />
        ) : (
          <Copy className="h-3 w-3 text-zinc-500 group-hover:text-white transition-all duration-200" />
        )}
      </button>
    </div>
  );

  const TransfersContent = () => {
    const allTransfers = transfers || [];
    const startIndex = transfersPage * transfersRowsPerPage;
    const paginatedTransfers = allTransfers.slice(startIndex, startIndex + transfersRowsPerPage);

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
                      <AddressLink address={transfer.from} />
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm">
                      <AddressLink address={transfer.to} />
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
              page={transfersPage}
              rowsPerPage={transfersRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={setTransfersPage}
              onRowsPerPageChange={(newRowsPerPage) => {
                setTransfersRowsPerPage(newRowsPerPage);
                setTransfersPage(0);
              }}
              disabled={isLoadingTransfers}
            />
          </div>
        )}
      </div>
    );
  };

  const DeployContent = () => {
    const allDeploys = deploys || [];
    const startIndex = deploysPage * deploysRowsPerPage;
    const paginatedDeploys = allDeploys.slice(startIndex, startIndex + deploysRowsPerPage);

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
                      <AddressLink address={deploy.user} />
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        deploy.status === 'error' 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : 'bg-[#83e9ff]/10 text-[#83e9ff]'
                      }`}>
                        {deploy.action}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-sm text-[#83E9FF]">
                      <div className="flex items-center gap-1.5">
                        {truncateHash(deploy.hash)}
                        <ExternalLink className="text-zinc-500 h-3 w-3 hover:text-white transition-colors cursor-pointer" />
                      </div>
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
              page={deploysPage}
              rowsPerPage={deploysRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={setDeploysPage}
              onRowsPerPageChange={(newRowsPerPage) => {
                setDeploysRowsPerPage(newRowsPerPage);
                setDeploysPage(0);
              }}
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
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
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