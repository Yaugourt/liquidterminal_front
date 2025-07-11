import { formatNumber } from "@/lib/formatting";
import { DataTable } from "../../vaultValidatorSum/DataTable";
import { Copy, Check } from "lucide-react";
import { useDateFormat } from "@/store/date-format.store";
import { formatDateTime } from "@/lib/date-formatting";
import { useState } from "react";
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type StakingSubTab = 'delegations' | 'history' | 'rewards';

const CopyButton = ({ text }: { text: string }) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        copyToClipboard(text);
      }}
      className="group p-1 rounded transition-colors"
    >
      {copiedAddress === text ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
      )}
    </button>
  );
};

interface StakingTableContentProps {
  activeSubTab: StakingSubTab;
  delegationsData: {
    delegations: any[];
    loading: boolean;
    error: Error | null;
  };
  historyData: {
    history: any[];
    loading: boolean;
    error: Error | null;
  };
  rewardsData: {
    rewards: any[];
    loading: boolean;
    error: Error | null;
  };
  format: any;
  hypePrice: number | null;
}

export function StakingTableContent({ 
  activeSubTab, 
  delegationsData, 
  historyData,
  rewardsData,
  format,
  hypePrice 
}: StakingTableContentProps) {
  const { format: dateFormat } = useDateFormat();

  if (activeSubTab === 'delegations') {
    return (
      <DataTable 
        isLoading={delegationsData.loading} 
        error={delegationsData.error}
        emptyMessage="No active delegations found. Start delegating to validators to earn rewards."
      >
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Validator</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Amount</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Value</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Locked until</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {delegationsData.delegations.map((delegation: any, index: number) => (
            <TableRow key={`${delegation.validator}-${index}`} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    {delegation.validatorName && !delegation.validatorName.includes('...') ? (
                      <>
                        <span className="text-white font-medium text-sm font-inter">{delegation.validatorName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#83E9FF] font-inter text-xs">
                            {delegation.validator.slice(0, 8)}...{delegation.validator.slice(-6)}
                          </span>
                          <CopyButton text={delegation.validator} />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[#83E9FF] font-inter text-sm">
                          {delegation.validator.slice(0, 8)}...{delegation.validator.slice(-6)}
                        </span>
                        <CopyButton text={delegation.validator} />
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {formatNumber(parseFloat(delegation.amount), format, { maximumFractionDigits: 2 })} HYPE
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {hypePrice 
                  ? `$${formatNumber(parseFloat(delegation.amount) * hypePrice, format, { maximumFractionDigits: 2 })}`
                  : '-'
                }
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {delegation.lockedUntilTimestamp 
                  ? formatDateTime(delegation.lockedUntilTimestamp * 1000, dateFormat)
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    );
  }

  if (activeSubTab === 'history') {
    return (
      <DataTable 
        isLoading={historyData.loading} 
        error={historyData.error}
        emptyMessage="No staking history found. Your delegation and undelegation transactions will appear here."
      >
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Hash</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Method</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Amount</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Value</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Validator</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historyData.history.map((tx: any) => (
            <TableRow key={tx.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#83E9FF] font-inter text-sm">
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                  </span>
                  <CopyButton text={tx.hash} />
                </div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  tx.type === 'Undelegate'
                    ? 'bg-[#FF575720] text-[#FF5757] border border-[#FF575740]'
                    : 'bg-[#4ADE8020] text-[#4ADE80] border border-[#4ADE8040]'
                }`}>
                  {tx.type}
                </span>
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {formatNumber(tx.amount, format, { maximumFractionDigits: 2 })} HYPE
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {hypePrice 
                  ? `$${formatNumber(tx.amount * hypePrice, format, { maximumFractionDigits: 2 })}`
                  : '-'
                }
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    {tx.validatorName && !tx.validatorName.includes('...') ? (
                      <>
                        <span className="text-white font-medium text-sm font-inter">{tx.validatorName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#83E9FF]  font-inter text-xs">
                            {tx.validator.slice(0, 8)}...{tx.validator.slice(-6)}
                          </span>
                          <CopyButton text={tx.validator} />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[#83E9FF]  font-inter text-sm">
                          {tx.validator.slice(0, 8)}...{tx.validator.slice(-6)}
                        </span>
                        <CopyButton text={tx.validator} />
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {formatDateTime(tx.timestamp, dateFormat)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    );
  }

  if (activeSubTab === 'rewards') {
    return (
      <DataTable 
        isLoading={rewardsData.loading} 
        error={rewardsData.error}
        emptyMessage="No staking rewards found. Delegate to validators to start earning commission and delegation rewards."
      >
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Source</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Amount</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Value</TableHead>
            <TableHead className="text-white text-left py-3 px-4 font-normal">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewardsData.rewards.map((reward: any, index: number) => (
            <TableRow key={`${reward.source}-${reward.timestamp}-${index}`} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
              <TableCell className="py-3 px-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  reward.source === 'commission'
                    ? 'bg-[#F9E37020] text-[#F9E370] border border-[#F9E37040]'
                    : 'bg-[#4ADE8020] text-[#4ADE80] border border-[#4ADE8040]'
                }`}>
                  {reward.source === 'commission' ? 'Commission' : 'Delegation'}
                </span>
              </TableCell>
              <TableCell className="py-3 px-4 text-[#4ADE80]">
                {formatNumber(reward.amount, format, { maximumFractionDigits: 6 })} HYPE
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {hypePrice 
                  ? `$${formatNumber(reward.amount * hypePrice, format, { maximumFractionDigits: 6 })}`
                  : '-'
                }
              </TableCell>
              <TableCell className="py-3 px-4 text-white">
                {formatDateTime(reward.timestamp, dateFormat)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    );
  }

  return null;
} 