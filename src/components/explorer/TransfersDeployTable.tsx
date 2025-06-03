import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, ExternalLink, Check } from "lucide-react";
import { useTransfers } from "@/services/explorer/hooks/useTransfers";
import { useDeploys } from "@/services/explorer/hooks/useDeploys";
import { useNumberFormat } from "@/store/number-format.store";
import { formatTokenAmount } from "@/lib/formatting";
import Link from "next/link";

type ActivityTab = "transfers" | "deploy";

export function HoldersActivityChart() {
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
      setTimeout(() => setCopiedAddress(null), 2000); // Reset après 2 secondes
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
        className="group hover:bg-[#83E9FF1A] p-1 rounded transition-colors"
      >
        {copiedAddress === address ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );

  const limitedDeploys = deploys?.slice(0, 5) || [];
  const limitedTransfers = transfers?.slice(0, 5) || [];

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-4">
      <Tabs defaultValue="transfers" className="w-full" onValueChange={(value) => setActiveTab(value as ActivityTab)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] text-white font-medium pl-4">Activity</h3>
          <TabsList className="h-8 p-0.5 bg-[#051728] border border-[#83E9FF4D]">
            <TabsTrigger 
              value="transfers"
              className="h-6 px-3 text-xs data-[state=active]:bg-[#83E9FF1A] data-[state=active]:text-[#83E9FF] text-[#FFFFFF99]"
            >
              Transfers
            </TabsTrigger>
            <TabsTrigger 
              value="deploy"
              className="h-6 px-3 text-xs data-[state=active]:bg-[#83E9FF1A] data-[state=active]:text-[#83E9FF] text-[#FFFFFF99]"
            >
              Deploy
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="transfers" className="mt-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728]">
            <table className="w-full text-sm text-white">
              <thead className="text-[#FFFFFF99]">
                <tr>
                  <th className="text-left py-2 px-3 font-normal border-b border-[#83E9FF4D]">Time</th>
                  <th className="text-right py-2 px-3 font-normal border-b border-[#83E9FF4D]">Amount</th>
                  <th className="text-left py-2 px-3 font-normal border-b border-[#83E9FF4D]">From</th>
                  <th className="text-left py-2 px-3 font-normal border-b border-[#83E9FF4D]">To</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTransfers ? (
                  <tr>
                    <td colSpan={4} className="text-center py-2 text-[#FFFFFF99]">Loading...</td>
                  </tr>
                ) : transfersError ? (
                  <tr>
                    <td colSpan={4} className="text-center py-2 text-red-500">{transfersError.message}</td>
                  </tr>
                ) : (
                  limitedTransfers.map((transfer) => (
                    <tr key={transfer.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#83E9FF08]">
                      <td className="py-2.5 px-3">{transfer.time}</td>
                      <td className="py-2.5 px-3 text-right text-[#4ADE80]">
                        {formatTokenAmount(transfer.amount, transfer.token, format)}
                      </td>
                      <td className="py-2.5 px-3 text-[#83E9FF]">
                        <AddressLink address={transfer.from} />
                      </td>
                      <td className="py-2.5 px-3 text-[#83E9FF]">
                        <AddressLink address={transfer.to} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="mt-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728]">
            <table className="w-full text-sm text-white">
              <thead className="text-[#FFFFFF99]">
                <tr>
                  <th className="text-left py-2 px-3 font-normal border-b border-[#83E9FF4D]">Time</th>
                  <th className="text-left py-2 px-3 font-normal border-b border-[#83E9FF4D]">User</th>
                  <th className="text-left py-2 px-3 font-normal border-b border-[#83E9FF4D]">Action</th>
                  <th className="text-left py-2 px-3 font-normal border-b border-[#83E9FF4D]">Hash</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingDeploys ? (
                  <tr>
                    <td colSpan={4} className="text-center py-2 text-[#FFFFFF99]">Loading...</td>
                  </tr>
                ) : deploysError ? (
                  <tr>
                    <td colSpan={4} className="text-center py-2 text-red-500">{deploysError.message}</td>
                  </tr>
                ) : (
                  limitedDeploys.map((deploy) => (
                    <tr key={deploy.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#83E9FF08]">
                      <td className="py-2.5 px-3">{deploy.time}</td>
                      <td className="py-2.5 px-3 text-[#83E9FF]">
                        <AddressLink address={deploy.user} />
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs border ${
                          deploy.status === 'error' 
                            ? 'bg-[#FF000033] text-[#FF6B6B] border-[#FF000066]' 
                            : 'bg-[#83E9FF1A] text-[#83E9FF] border-[#83E9FF33]'
                        }`}>
                          {deploy.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#83E9FF]">
                        <div className="flex items-center">
                          {truncateHash(deploy.hash)}
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60 hover:opacity-100 cursor-pointer" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 