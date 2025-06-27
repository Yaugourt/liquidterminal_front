import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useValidators } from "@/services/validator";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatting";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Database } from "lucide-react";
import { Pagination } from "../common/pagination";

interface Error {
  message: string;
}

type TabType = 'validators' | 'vaults';

export function ValidatorsTable() {
  const [activeTab, setActiveTab] = useState<TabType>('validators');
  const { validators, stats, isLoading: validatorsLoading, error: validatorsError } = useValidators();
  const { vaults, totalTvl, isLoading: vaultsLoading, error: vaultsError } = useVaults({ limit: 100 }); // Get all vaults
  const { format } = useNumberFormat();
  const [currentPage, setCurrentPage] = useState(0); // 0-based pour le composant common
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleValidatorsClick = useCallback(() => setActiveTab("validators"), []);
  const handleVaultsClick = useCallback(() => setActiveTab("vaults"), []);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(0);
  }, [validators, vaults, activeTab]);

  // Get current data based on active tab
  const currentData = activeTab === 'validators' ? validators : vaults;
  const isLoading = activeTab === 'validators' ? validatorsLoading : vaultsLoading;
  const error = activeTab === 'validators' ? validatorsError : vaultsError;

  // Calculate pagination
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedData = currentData.slice(startIndex, endIndex);

  const ValidatorsContent = () => {
    if (validatorsLoading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF] mb-3" />
            <span className="text-[#FFFFFF80] text-sm">Loading validators...</span>
          </div>
        </div>
      );
    }

    if (validatorsError) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
            <p className="text-[#FF5757] text-lg mb-2">Une erreur est survenue</p>
            <p className="text-[#FFFFFF80] text-sm">Impossible de charger les validators</p>
          </div>
        </div>
      );
    }

    const displayedValidators = validators.slice(startIndex, endIndex);

    if (displayedValidators.length === 0) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
            <p className="text-white text-lg mb-2">Aucun validator disponible</p>
            <p className="text-[#FFFFFF80] text-sm">Revenez plus tard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <table className="w-full text-sm text-white font-inter">
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
            {displayedValidators.map((validator) => (
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
        </table>
      </div>
    );
  };

  const VaultsContent = () => {
    if (vaultsLoading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF] mb-3" />
            <span className="text-[#FFFFFF80] text-sm">Loading vaults...</span>
          </div>
        </div>
      );
    }

    if (vaultsError) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
            <p className="text-[#FF5757] text-lg mb-2">Une erreur est survenue</p>
            <p className="text-[#FFFFFF80] text-sm">Impossible de charger les vaults</p>
          </div>
        </div>
      );
    }

    const displayedVaults = vaults.slice(startIndex, endIndex);

    if (displayedVaults.length === 0) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
            <p className="text-white text-lg mb-2">Aucun vault disponible</p>
            <p className="text-[#FFFFFF80] text-sm">Revenez plus tard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <table className="w-full text-sm text-white font-inter">
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
            {displayedVaults.map((vault) => (
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
        </table>
      </div>
    );
  };

  const getHeaderInfo = () => {
    if (activeTab === 'validators') {
      return {
        title: 'Validators',
        subtitle: `${stats.active} active of ${stats.total} validators`
      };
    } else {
      const openVaults = vaults.filter(vault => !vault.summary.isClosed).length;
      return {
        title: 'Vaults',
        subtitle: `${openVaults} open of ${vaults.length} vaults`
      };
    }
  };

  const headerInfo = getHeaderInfo();
  const totalItems = activeTab === 'validators' ? validators.length : vaults.length;

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 flex flex-col">
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
        <Button
          onClick={handleValidatorsClick}
          variant="ghost"
          size="sm"
          className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap uppercase font-bold
            ${activeTab === "validators"
              ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"}
          `}
        >
          VALIDATORS
        </Button>
        <Button
          onClick={handleVaultsClick}
          variant="ghost"
          size="sm"
          className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap uppercase font-bold
            ${activeTab === "vaults"
              ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"}
          `}
        >
          VAULTS
        </Button>
      </div>

      <div className="flex items-center justify-end mb-6">
        <div className="text-white text-sm">
          {headerInfo.subtitle}
        </div>
      </div>
      
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          {activeTab === 'validators' && <ValidatorsContent />}
          {activeTab === 'vaults' && <VaultsContent />}
        </div>
        <div className="mt-4">
          <Pagination
            total={totalItems}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>
    </Card>
  );
}
