"use client";

import { Card } from "@/components/ui/card";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { useState, useCallback } from "react";
import { Pagination } from "@/components/common/pagination";
import { VaultTableContent } from ".";
import { formatNumber } from "@/lib/numberFormatting";

export function VaultSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const { vaults, totalTvl, totalCount, isLoading, error, updateParams } = useVaults({ 
    page: currentPage + 1,
    limit: rowsPerPage,
    sortBy: 'tvl'
  });
  
  const { format } = useNumberFormat();

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    updateParams({ page: newPage + 1 });
  }, [updateParams]);

  const handleRowsPerPageChange = useCallback((newRows: number) => {
    setRowsPerPage(newRows);
    setCurrentPage(0);
    updateParams({ limit: newRows, page: 1 });
  }, [updateParams]);

  return (
    <div className="w-full">
      <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 flex flex-col">

        
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            <VaultTableContent
              vaults={vaults}
              isLoading={isLoading}
              error={error}
              format={format}
            />
          </div>
          <div className="mt-4">
            <Pagination
              total={totalCount}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
} 