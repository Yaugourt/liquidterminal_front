
"use client";

import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { useCallback } from "react";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
import { VaultTableContent } from ".";


export function VaultSection() {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange
  } = usePagination({ initialRowsPerPage: 10 });

  const { vaults, totalCount, isLoading, error, updateParams } = useVaults({
    page: page + 1,
    limit: rowsPerPage,
    sortBy: 'tvl'
  });

  const { format } = useNumberFormat();

  const handlePageChange = useCallback((newPage: number) => {
    onPageChange(newPage);
    updateParams({ page: newPage + 1 });
  }, [updateParams, onPageChange]);

  const handleRowsPerPageChange = useCallback((newRows: number) => {
    onRowsPerPageChange(newRows);
    updateParams({ limit: newRows, page: 1 });
  }, [updateParams, onRowsPerPageChange]);

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <VaultTableContent
            vaults={vaults}
            isLoading={isLoading}
            error={error}
            format={format}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <Pagination
            total={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
} 