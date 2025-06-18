import { Card } from "@/components/ui/card";
import { useTrendingValidators } from "@/services/dashboard/hooks/useTrendingValidators";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Transaction } from "@/components/types/explorer.types";

interface Error {
  message: string;
}

// Hook temporaire pour les transactions (à remplacer par un vrai hook plus tard)
const useTransactions = () => {
  // Données de test - à remplacer par de vraies données
  return {
    transactions: [
      {
        hash: "0x1234...5678",
        method: "Transfer",
        age: "2 mins ago",
        from: "0xabcd...efgh",
        data: "0x123456789abcdef",
      },
      // Ajouter plus de données de test si nécessaire
    ] as Transaction[],
    isLoading: false,
    error: null as Error | null,
  };
};

export function ValidatorsTable() {
  const { validators, isLoading: isLoadingValidators, error: validatorsError } = useTrendingValidators();
  const { transactions, isLoading: isLoadingTransactions, error: transactionsError } = useTransactions();
  const { format } = useNumberFormat();
  const [activeTab, setActiveTab] = useState("validators");

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-4">
      <Tabs defaultValue="validators" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] text-white font-medium pl-4">Validators</h3>
          <TabsList className="h-8 p-0.5 bg-[#051728] border border-[#83E9FF4D]">
            <TabsTrigger 
              value="validators"
              className="h-6 px-3 text-xs data-[state=active]:bg-[#83E9FF1A] data-[state=active]:text-[#83E9FF] text-[#FFFFFF99]"
            >
              Validators
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="h-6 px-3 text-xs data-[state=active]:bg-[#83E9FF1A] data-[state=active]:text-[#83E9FF] text-[#FFFFFF99]"
            >
              Transactions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="validators" className="mt-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728]">
            <table className="w-full text-sm text-white">
              <thead className="text-[#FFFFFF99]">
                <tr>
                  <th className="text-left py-3 px-4 font-normal border-b border-[#83E9FF4D]">Name</th>
                  <th className="text-left py-3 px-4 font-normal border-b border-[#83E9FF4D]">Status</th>
                  <th className="text-right py-3 px-4 font-normal border-b border-[#83E9FF4D]">Staked HYPE</th>
                  <th className="text-right py-3 px-4 font-normal border-b border-[#83E9FF4D]">Commission</th>
                  <th className="text-right py-3 px-4 font-normal border-b border-[#83E9FF4D]">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingValidators ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-[#FFFFFF99]">
                      Loading validators...
                    </td>
                  </tr>
                ) : validatorsError ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-red-500">
                      {validatorsError.message}
                    </td>
                  </tr>
                ) : (
                  validators.map((validator) => (
                    <tr key={validator.name} className="border-b border-[#FFFFFF1A] hover:bg-[#83E9FF08]">
                      <td className="py-3 px-4 text-[#83E9FF]">{validator.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-[#4ADE80]">
                          {validator.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatNumber(validator.stake, format, { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(validator.commission, format, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</td>
                      <td className="py-3 px-4 text-right">{formatNumber(validator.uptime, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728]">
            <table className="w-full text-sm text-white">
              <thead className="text-[#FFFFFF99]">
                <tr>
                  <th className="text-left py-3 px-4 font-normal border-b border-[#83E9FF4D]">Hash</th>
                  <th className="text-left py-3 px-4 font-normal border-b border-[#83E9FF4D]">Method</th>
                  <th className="text-left py-3 px-4 font-normal border-b border-[#83E9FF4D]">Age</th>
                  <th className="text-left py-3 px-4 font-normal border-b border-[#83E9FF4D]">From</th>
                  <th className="text-left py-3 px-4 font-normal border-b border-[#83E9FF4D]">Data</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTransactions ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-[#FFFFFF99]">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactionsError ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-red-500">
                      {transactionsError.message}
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#83E9FF08]">
                      <td className="py-3 px-4 text-[#83E9FF]">{tx.hash}</td>
                      <td className="py-3 px-4">{tx.method}</td>
                      <td className="py-3 px-4">{tx.age}</td>
                      <td className="py-3 px-4 text-[#83E9FF]">{tx.from}</td>
                      <td className="py-3 px-4 font-mono text-sm">{tx.data}</td>
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
