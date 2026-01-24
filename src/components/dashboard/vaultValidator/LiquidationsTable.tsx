import { memo, useMemo } from "react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { TypedDataTable as DataTable, Column } from "@/components/common/DataTable";
import { useNumberFormat } from "@/store/number-format.store";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { Liquidation } from "@/services/explorer/liquidation";

interface LiquidationsTableProps {
  liquidations: Liquidation[];
  isLoading: boolean;
  error: Error | null;
  paginationDisabled?: boolean;
  hidePageNavigation?: boolean;
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  showPagination?: boolean;
}

const LiquidationsTableComponent = ({
  liquidations,
  isLoading,
  error,
  paginationDisabled = false,
  hidePageNavigation = false,
  ...paginationProps
}: LiquidationsTableProps) => {
  const { format } = useNumberFormat();

  const columns = useMemo(() => [
    {
      header: "Coin",
      accessor: (item: Liquidation) => (
        <span className="text-brand-accent font-medium">{item.coin}</span>
      ),
      align: "left",
      className: "w-[80px] px-4"
    },
    {
      header: "Side",
      accessor: (item: Liquidation) => (
        <StatusBadge variant={item.liq_dir === 'Long' ? 'success' : 'error'}>
          {item.liq_dir}
        </StatusBadge>
      ),
      align: "left",
      className: "w-[80px] px-4"
    },
    {
      header: "Notional",
      accessor: (item: Liquidation) => (
        <span className="text-white font-medium">
          ${formatNumber(item.notional_total, format, { maximumFractionDigits: 0 })}
        </span>
      ),
      align: "right",
      className: "w-[100px] px-4"
    },
    {
      header: "User",
      accessor: (item: Liquidation) => (
        <AddressDisplay address={item.liquidated_user} />
      ),
      align: "left",
      className: "w-[140px] px-4"
    },
  ] as Column<Liquidation>[], [format]);

  return (
    <DataTable
      data={liquidations}
      columns={columns}
      isLoading={isLoading}
      error={error}
      paginationDisabled={paginationDisabled}
      hidePageNavigation={hidePageNavigation}
      {...paginationProps}
    />
  );
};

export const LiquidationsTable = memo(LiquidationsTableComponent);
LiquidationsTable.displayName = 'LiquidationsTable';
