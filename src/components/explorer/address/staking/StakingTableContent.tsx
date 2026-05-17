import { formatNumber } from "@/lib/formatters/numberFormatting";
import { DataTable } from "@/components/common";
import { CopyButton } from "@/components/ui/copy-button";
import { useDateFormat } from "@/store/date-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { NumberFormatType } from "@/store/number-format.store";
import { ValidatorDelegation } from "@/services/explorer/validator/types/validators";
import { FormattedDelegatorHistoryItem, FormattedDelegatorRewardItem } from "@/services/explorer/validator/types/delegator";

type StakingSubTab = 'delegations' | 'history' | 'rewards';

interface StakingTableContentProps {
  activeSubTab: StakingSubTab;
  delegationsData: {
    delegations: ValidatorDelegation[];
    loading: boolean;
    error: Error | null;
  };
  historyData: {
    history: FormattedDelegatorHistoryItem[];
    loading: boolean;
    error: Error | null;
  };
  rewardsData: {
    rewards: FormattedDelegatorRewardItem[];
    loading: boolean;
    error: Error | null;
  };
  format: NumberFormatType;
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
        isEmpty={delegationsData.delegations.length === 0}
        emptyState={{
          title: "No active delegations found. Start delegating to validators to earn rewards."
        }}
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Validator</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Amount</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Value</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Locked until</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delegationsData.delegations.map((delegation: ValidatorDelegation, index: number) => (
              <TableRow key={`${delegation.validator}-${index}`} className="border-b border-white/10 hover:bg-white/4">
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      {delegation.validatorName && !delegation.validatorName.includes('...') ? (
                        <>
                          <span className="text-text-primary font-medium text-sm font-inter">{delegation.validatorName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-brand-accent text-xs">
                              {delegation.validator.slice(0, 8)}...{delegation.validator.slice(-6)}
                            </span>
                            <CopyButton text={delegation.validator} />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-brand-accent text-sm">
                            {delegation.validator.slice(0, 8)}...{delegation.validator.slice(-6)}
                          </span>
                          <CopyButton text={delegation.validator} />
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
                  {formatNumber(parseFloat(delegation.amount), format, { maximumFractionDigits: 2 })} HYPE
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
                  {hypePrice
                    ? `$${formatNumber(parseFloat(delegation.amount) * hypePrice, format, { maximumFractionDigits: 2 })}`
                    : '-'
                  }
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
                  {delegation.lockedUntilTimestamp
                    ? formatDateTime(delegation.lockedUntilTimestamp * 1000, dateFormat)
                    : '-'
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    );
  }

  if (activeSubTab === 'history') {
    return (
      <DataTable
        isLoading={historyData.loading}
        error={historyData.error}
        isEmpty={historyData.history.length === 0}
        emptyState={{
          title: "No staking history found. Your delegation and undelegation transactions will appear here."
        }}
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Hash</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Method</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Amount</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Value</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Validator</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData.history.map((tx: FormattedDelegatorHistoryItem) => (
              <TableRow key={tx.hash} className="border-b border-white/10 hover:bg-white/4">
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent text-sm">
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                    </span>
                    <CopyButton text={tx.hash} />
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'Undelegate'
                    ? 'bg-rose-400/12 text-rose-400 border border-rose-400/25'
                    : 'bg-emerald-400/12 text-emerald-400 border border-emerald-400/25'
                    }`}>
                    {tx.type}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
                  {formatNumber(tx.amount, format, { maximumFractionDigits: 2 })} HYPE
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
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
                          <span className="text-text-primary font-medium text-sm font-inter">{tx.validatorName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-brand-accent text-xs">
                              {tx.validator.slice(0, 8)}...{tx.validator.slice(-6)}
                            </span>
                            <CopyButton text={tx.validator} />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-brand-accent text-sm">
                            {tx.validator.slice(0, 8)}...{tx.validator.slice(-6)}
                          </span>
                          <CopyButton text={tx.validator} />
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
                  {formatDateTime(tx.timestamp, dateFormat)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    );
  }

  if (activeSubTab === 'rewards') {
    return (
      <DataTable
        isLoading={rewardsData.loading}
        error={rewardsData.error}
        isEmpty={rewardsData.rewards.length === 0}
        emptyState={{
          title: "No staking rewards found. Delegate to validators to start earning commission and delegation rewards."
        }}
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Source</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Amount</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Value</TableHead>
              <TableHead className="text-text-primary text-left py-3 px-4 font-normal">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewardsData.rewards.map((reward: FormattedDelegatorRewardItem, index: number) => (
              <TableRow key={`${reward.source}-${reward.timestamp}-${index}`} className="border-b border-white/10 hover:bg-white/4">
                <TableCell className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${reward.source === 'commission'
                    ? 'bg-brand-gold text-brand-gold border border-brand-gold'
                    : 'bg-emerald-400/12 text-emerald-400 border border-emerald-400/25'
                    }`}>
                    {reward.source === 'commission' ? 'Commission' : 'Delegation'}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-emerald-400">
                  {formatNumber(reward.amount, format, { maximumFractionDigits: 6 })} HYPE
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
                  {hypePrice
                    ? `$${formatNumber(reward.amount * hypePrice, format, { maximumFractionDigits: 6 })}`
                    : '-'
                  }
                </TableCell>
                <TableCell className="py-3 px-4 text-text-primary">
                  {formatDateTime(reward.timestamp, dateFormat)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    );
  }

  return null;
} 