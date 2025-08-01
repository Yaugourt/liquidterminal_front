import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Copy, ExternalLink, Check, Loader2, Database } from "lucide-react";
import { useTransfers, useDeploys } from "@/services/explorer";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import {  formatNumber } from "@/lib/numberFormatting";
import { formatDateTime } from "@/lib/dateFormatting";
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
        className="hover:text-[#83E9FF] transition-colors"
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
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
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
            <span className="text-[#FFFFFF80] text-sm">Chargement...</span>
          </div>
        </div>
      );
    }

    if (transfersError) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
            <p className="text-[#FF5757] text-sm mb-1">Une erreur est survenue</p>
            <p className="text-[#FFFFFF80] text-xs">Veuillez réessayer plus tard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-none bg-[#051728]">
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Time</TableHead>
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Amount</TableHead>
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">From</TableHead>
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#051728]">
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((transfer) => (
                  <TableRow key={transfer.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                    <TableCell className="py-3 px-4 text-sm text-white">
                      {formatDistanceToNowStrict(transfer.timestamp, { addSuffix: false })}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-white text-left">
                      {(() => {
                        const numericAmount = typeof transfer.amount === 'string' ? parseFloat(transfer.amount) : transfer.amount;
                        return `${formatNumber(numericAmount, format, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2
                        })} ${transfer.token}`;
                      })()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-[#83E9FF]">
                      <AddressLink address={transfer.from} />
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-[#83E9FF]">
                      <AddressLink address={transfer.to} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                      <p className="text-white text-sm mb-1">Aucun transfer disponible</p>
                      <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {allTransfers.length > 0 && (
          <div className="px-4 py-2 bg-[#051728] border-t border-[#FFFFFF1A]">
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
            <span className="text-[#FFFFFF80] text-sm">Chargement...</span>
          </div>
        </div>
      );
    }

    if (deploysError) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
            <p className="text-[#FF5757] text-sm mb-1">Une erreur est survenue</p>
            <p className="text-[#FFFFFF80] text-xs">Veuillez réessayer plus tard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-none bg-[#051728]">
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Time</TableHead>
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">User</TableHead>
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Action</TableHead>
                <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#051728]">
              {paginatedDeploys.length > 0 ? (
                paginatedDeploys.map((deploy) => (
                  <TableRow key={deploy.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                    <TableCell className="py-3 px-4 text-sm text-white">
                      {formatDateTime(deploy.timestamp, dateFormat)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-[#83E9FF]">
                      <AddressLink address={deploy.user} />
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs border ${
                        deploy.status === 'error' 
                          ? 'bg-[#FF000033] text-[#FF6B6B] border-[#FF000066]' 
                          : 'bg-[#83E9FF1A] text-[#83E9FF] border-[#83E9FF33]'
                      }`}>
                        {deploy.action}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-[#83E9FF]">
                      <div className="flex items-center">
                        {truncateHash(deploy.hash)}
                        <ExternalLink className="text-[#f9e370] ml-1.5 h-3.5 w-3.5 opacity-60 hover:opacity-100 cursor-pointer" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                      <p className="text-white text-sm mb-1">Aucun deploy disponible</p>
                      <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {allDeploys.length > 0 && (
          <div className="px-4 py-2 bg-[#051728] border-t border-[#FFFFFF1A]">
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
    <div className="w-full">
      {/* Header avec TabSelector */}
      <div className="flex justify-start items-center mb-4">
        <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                  : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl mx-auto">
        {activeTab === "transfers" && <TransfersContent />}
        {activeTab === "deploy" && <DeployContent />}
      </Card>
    </div>
  );
} 