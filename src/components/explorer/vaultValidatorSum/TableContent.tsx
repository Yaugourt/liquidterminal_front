import { formatNumber } from "@/lib/formatting";
import { DataTable } from "./DataTable";

export function TableContent({ 
  activeTab, 
  validatorsData, 
  vaultsData, 
  format, 
  startIndex, 
  endIndex 
}: any) {
  const { validators, loading: validatorsLoading, error: validatorsError } = validatorsData;
  const { vaults, loading: vaultsLoading, error: vaultsError } = vaultsData;

  if (activeTab === 'validators') {
    return (
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