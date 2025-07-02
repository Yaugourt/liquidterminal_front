import { formatNumber } from "@/lib/formatting";
import { DataTable } from "./DataTable";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const CopyButton = ({ text }: { text: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="p-1 h-auto hover:bg-[#83E9FF20] transition-colors"
    >
      <Copy className="h-3 w-3 text-[#83E9FF]" />
    </Button>
  );
};

export function TableContent({ 
  activeTab, 
  validatorSubTab,
  validatorsData, 
  vaultsData,
  stakingData,
  unstakingData,
  format, 
  startIndex, 
  endIndex 
}: any) {
  const { validators, loading: validatorsLoading, error: validatorsError } = validatorsData;
  const { vaults, loading: vaultsLoading, error: vaultsError } = vaultsData;
  const { validations: stakingValidations, loading: stakingLoading, error: stakingError } = stakingData;
  const { unstakingQueue, loading: unstakingLoading, error: unstakingError } = unstakingData;

  if (activeTab === 'validators') {
    return (
      <div>
        
        {validatorSubTab === 'all' && (
          <DataTable 
            isLoading={validatorsLoading} 
            error={validatorsError}
            emptyMessage="Aucun validator disponible"
          >
            <thead className="text-[#FFFFFF99]">
              <tr>
                <th className="text-left py-3 px-4 font-normal">Name</th>
                <th className="text-left py-3 px-4 font-normal">Status</th>
                <th className="text-right py-3 px-4 font-normal">Staked HYPE</th>
                <th className="text-right py-3 px-4 font-normal">APR</th>
                <th className="text-right py-3 px-4 font-normal">Commission</th>
                <th className="text-right py-3 px-4 font-normal">Uptime</th>
                <th className="text-right py-3 px-4 font-normal">Recent Blocks</th>
              </tr>
            </thead>
            <tbody>
              {validators.slice(startIndex, endIndex).map((validator: any) => (
                <tr key={validator.name} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                  <td className="py-3 px-4 text-[#83E9FF] font-medium">{validator.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      validator.isActive 
                        ? 'bg-[#4ADE8020] text-[#4ADE80] border border-[#4ADE8040]' 
                        : 'bg-[#FF575720] text-[#FF5757] border border-[#FF575740]'
                    }`}>
                      {validator.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatNumber(validator.stake, format, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-[#4ADE80]">
                    {formatNumber(validator.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatNumber(validator.commission, format, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatNumber(validator.uptime, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </td>
                  <td className="py-3 px-4 text-right text-[#83E9FF]">
                    {formatNumber(validator.nRecentBlocks, format, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}

        {validatorSubTab === 'transactions' && (
          <DataTable 
            isLoading={stakingLoading} 
            error={stakingError}
            emptyMessage="Aucune transaction disponible"
          >
            <thead className="text-[#FFFFFF99]">
              <tr>
                <th className="text-left py-3 px-4 font-normal">Time</th>
                <th className="text-left py-3 px-4 font-normal">User</th>
                <th className="text-left py-3 px-4 font-normal">Type</th>
                <th className="text-right py-3 px-4 font-normal">Amount</th>
                <th className="text-left py-3 px-4 font-normal">Validator</th>
                <th className="text-left py-3 px-4 font-normal">Hash</th>
              </tr>
            </thead>
            <tbody>
              {stakingValidations?.map((tx: any) => (
                <tr key={tx.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                  <td className="py-3 px-4 text-[#FFFFFF80]">
                    {tx.time}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#83E9FF] font-mono text-sm">
                        {tx.user.slice(0, 6)}...{tx.user.slice(-4)}
                      </span>
                      <CopyButton text={tx.user} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'Undelegate'
                        ? 'bg-[#FF575720] text-[#FF5757] border border-[#FF575740]'
                        : 'bg-[#4ADE8020] text-[#4ADE80] border border-[#4ADE8040]'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatNumber(tx.amount, format, { maximumFractionDigits: 6 })} HYPE
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#83E9FF] font-mono text-sm">
                        {tx.validator.slice(0, 6)}...{tx.validator.slice(-4)}
                      </span>
                      <CopyButton text={tx.validator} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#83E9FF] font-mono text-sm">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </span>
                      <CopyButton text={tx.hash} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}

        {validatorSubTab === 'unstaking' && (
          <DataTable 
            isLoading={unstakingLoading} 
            error={unstakingError}
            emptyMessage="Aucune demande d'unstaking en attente"
          >
            <thead className="text-[#FFFFFF99]">
              <tr>
                <th className="text-left py-3 px-4 font-normal">Time</th>
                <th className="text-left py-3 px-4 font-normal">Address</th>
                <th className="text-right py-3 px-4 font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {unstakingQueue?.map((item: any, index: number) => (
                <tr key={`${item.user}-${item.timestamp}-${index}`} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                  <td className="py-3 px-4 text-[#FFFFFF80]">
                    {item.time}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#83E9FF] font-mono text-sm">
                        {item.user.slice(0, 6)}...{item.user.slice(-4)}
                      </span>
                      <CopyButton text={item.user} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-[#F9E370]">
                    {formatNumber(item.amount, format, { maximumFractionDigits: 6 })} HYPE
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    );
  }

  return (
    <DataTable 
      isLoading={vaultsLoading} 
      error={vaultsError}
      emptyMessage="Aucun vault disponible"
    >
      <thead className="text-[#FFFFFF99]">
        <tr>
          <th className="text-left py-3 px-4 font-normal">Name</th>
          <th className="text-left py-3 px-4 font-normal">Status</th>
          <th className="text-right py-3 px-4 font-normal">TVL</th>
          <th className="text-right py-3 px-4 font-normal">APR</th>
          <th className="text-left py-3 px-4 font-normal">Leader</th>
          <th className="text-left py-3 px-4 font-normal">Created</th>
        </tr>
      </thead>
      <tbody>
        {vaults.map((vault: any) => (
          <tr key={vault.summary.vaultAddress} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
            <td className="py-3 px-4 text-[#83E9FF] font-medium">{vault.summary.name}</td>
            <td className="py-3 px-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                !vault.summary.isClosed 
                  ? 'bg-[#4ADE8020] text-[#4ADE80] border border-[#4ADE8040]' 
                  : 'bg-[#FF575720] text-[#FF5757] border border-[#FF575740]'
              }`}>
                {!vault.summary.isClosed ? 'Open' : 'Closed'}
              </span>
            </td>
            <td className="py-3 px-4 text-right">
              ${formatNumber(parseFloat(vault.summary.tvl), format, { maximumFractionDigits: 2 })}
            </td>
            <td className="py-3 px-4 text-right text-[#4ADE80]">
              {formatNumber(vault.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </td>
            <td className="py-3 px-4 text-[#83E9FF]">
              {vault.summary.leader.slice(0, 6)}...{vault.summary.leader.slice(-4)}
            </td>
            <td className="py-3 px-4 text-[#FFFFFF80]">
              {new Date(vault.summary.createTimeMillis).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
} 