import { Card } from "@/components/ui/card";
import { useState, useCallback } from "react";
import { Copy, ExternalLink, Check, Loader2, Database } from "lucide-react";
import { useTransfers, useDeploys } from "@/services/explorer";
import { useNumberFormat } from "@/store/number-format.store";
import { formatTokenAmount } from "@/lib/formatting";
import Link from "next/link";
import { ActivityTab } from "@/components/types/explorer.types";

export function TransfersDeployTable() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("transfers");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { format } = useNumberFormat();
  
  const { transfers, isLoading: isLoadingTransfers, error: transfersError } = useTransfers();
  const { deploys, isLoading: isLoadingDeploys, error: deploysError } = useDeploys();

  const truncateHash = (hash: string) => {
    if (hash.length > 12) {
      return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    }
    return hash;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
    const limitedTransfers = transfers?.slice(0, 5) || [];

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
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <table className="w-full">
          <thead>
            <tr className="border-none bg-[#051728]">
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Time</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-right text-xs">Amount</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">From</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">To</th>
            </tr>
          </thead>
          <tbody className="bg-[#051728]">
            {limitedTransfers.length > 0 ? (
              limitedTransfers.map((transfer) => (
                <tr key={transfer.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                  <td className="py-3 px-4 text-sm text-white">{transfer.time}</td>
                  <td className="py-3 px-4 text-sm text-white text-right">
                    {formatTokenAmount(transfer.amount, transfer.token, format)}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">
                    <AddressLink address={transfer.from} />
                  </td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">
                    <AddressLink address={transfer.to} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                    <p className="text-white text-sm mb-1">Aucun transfer disponible</p>
                    <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const DeployContent = () => {
    const limitedDeploys = deploys?.slice(0, 5) || [];

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
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <table className="w-full">
          <thead>
            <tr className="border-none bg-[#051728]">
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Time</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">User</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Action</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Hash</th>
            </tr>
          </thead>
          <tbody className="bg-[#051728]">
            {limitedDeploys.length > 0 ? (
              limitedDeploys.map((deploy) => (
                <tr key={deploy.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                  <td className="py-3 px-4 text-sm text-white">{deploy.time}</td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">
                    <AddressLink address={deploy.user} />
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs border ${
                      deploy.status === 'error' 
                        ? 'bg-[#FF000033] text-[#FF6B6B] border-[#FF000066]' 
                        : 'bg-[#83E9FF1A] text-[#83E9FF] border-[#83E9FF33]'
                    }`}>
                      {deploy.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">
                    <div className="flex items-center">
                      {truncateHash(deploy.hash)}
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60 hover:opacity-100 cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                    <p className="text-white text-sm mb-1">Aucun deploy disponible</p>
                    <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                  : 'text-[#FFFFFF99] hover:text-white hover:bg-[#FFFFFF0A]'
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