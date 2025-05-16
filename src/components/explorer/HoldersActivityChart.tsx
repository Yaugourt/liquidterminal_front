import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivitySquare, Clock, Code, ArrowRight, Copy, ExternalLink } from "lucide-react";
import { useTransfers } from "@/services/explorer/hooks/useTransfers";
import { useDeploys } from "@/services/explorer/hooks/useDeploys";

type ActivityTab = "transfers" | "deploy";

export function HoldersActivityChart() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("transfers");
  
  // Hooks pour récupérer les données API
  const { transfers, isLoading: isLoadingTransfers, error: transfersError } = useTransfers();
  const { deploys, isLoading: isLoadingDeploys, error: deploysError } = useDeploys();

  // Fonction pour tronquer un hash
  const truncateHash = (hash: string) => {
    if (hash.length > 12) {
      return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    }
    return hash;
  };

  // Limiter les déploiements à 5 éléments
  const limitedDeploys = deploys?.slice(0, 5) || [];
  
  // Limiter les transferts à 5 éléments
  const limitedTransfers = transfers?.slice(0, 5) || [];

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ActivitySquare className="w-5 h-5 mr-2 text-[#83E9FF]" />
          <h3 className="text-white text-lg">System Activity</h3>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActivityTab)} className="w-auto">
          <TabsList className="bg-[#051728] border border-[#83E9FF33] h-8">
            <TabsTrigger 
              value="transfers" 
              className="h-6 px-3 data-[state=active]:bg-[#1692AD] data-[state=active]:text-white"
            >
              <ArrowRight className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              Transfers
            </TabsTrigger>
            <TabsTrigger 
              value="deploy" 
              className="h-6 px-3 data-[state=active]:bg-[#1692AD] data-[state=active]:text-white"
            >
              <Code className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              Deploy
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActivityTab)} className="w-full">
        <div className="overflow-x-auto">
          <TabsContent value="transfers" className="mt-0 pt-0">
            {isLoadingTransfers ? (
              <div className="flex justify-center items-center h-[260px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1692AD]"></div>
              </div>
            ) : transfersError ? (
              <div className="flex flex-col items-center justify-center h-[260px] text-center">
                <p className="text-red-500">Error loading transfers: {transfersError.message}</p>
              </div>
            ) : (
              <table className="w-full text-sm text-white">
                <thead className="text-[#FFFFFF99]">
                  <tr>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3.5 w-3.5 opacity-70" />
                        Time
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Amount</th>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">From</th>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">To</th>
                  </tr>
                </thead>
                <tbody>
                  {limitedTransfers.map((transfer) => (
                    <tr key={transfer.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                      <td className="py-3 px-2">{transfer.time}</td>
                      <td className="py-3 px-2 text-[#00FF85]">{transfer.amount} {transfer.token}</td>
                      <td className="py-3 px-2 text-[#83E9FF]">
                        <div className="flex items-center">
                          {truncateHash(transfer.from)}
                          <button className="ml-1.5 text-[#83E9FF] opacity-60 hover:opacity-100 transition-opacity">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[#83E9FF]">
                        <div className="flex items-center">
                          {truncateHash(transfer.to)}
                          <button className="ml-1.5 text-[#83E9FF] opacity-60 hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {limitedTransfers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#FFFFFF80]">
                        No transfer data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </TabsContent>

          <TabsContent value="deploy" className="mt-0 pt-0">
            {isLoadingDeploys ? (
              <div className="flex justify-center items-center h-[260px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1692AD]"></div>
              </div>
            ) : deploysError ? (
              <div className="flex flex-col items-center justify-center h-[260px] text-center">
                <p className="text-red-500">Error loading deploys: {deploysError.message}</p>
              </div>
            ) : (
              <table className="w-full text-sm text-white">
                <thead className="text-[#FFFFFF99]">
                  <tr>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3.5 w-3.5 opacity-70" />
                        Time
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">User</th>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Action</th>
                    <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {limitedDeploys.map((deploy) => (
                    <tr key={deploy.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                      <td className="py-3 px-2">{deploy.time}</td>
                      <td className="py-3 px-2 text-[#83E9FF]">
                        <div className="flex items-center">
                          {truncateHash(deploy.user)}
                          <button className="ml-1.5 text-[#83E9FF] opacity-60 hover:opacity-100 transition-opacity">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs border ${
                          deploy.status === 'error' 
                            ? 'bg-[#FF000033] text-[#FF6B6B] border-[#FF000066]' 
                            : 'bg-[#83E9FF1A] text-[#83E9FF] border-[#83E9FF33]'
                        }`}>
                          {deploy.action}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[#83E9FF]">
                        <div className="flex items-center">
                          {truncateHash(deploy.hash)}
                          <button className="ml-1.5 text-[#83E9FF] opacity-60 hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {limitedDeploys.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#FFFFFF80]">
                        No deploy data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
} 