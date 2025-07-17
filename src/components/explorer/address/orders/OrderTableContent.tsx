import { OpenOrdersList } from "./OpenOrdersList";
import { UserTwapTable } from "./UserTwapTable";
import { TwapTableData } from "@/services/explorer/address/types";
import { NumberFormatType } from "@/store/number-format.store";

type OrderSubTab = 'open' | 'twap';

interface OrderTableContentProps {
  activeSubTab: OrderSubTab;
  address: string;
  openOrdersData: {
    orders: any[];
    loading: boolean;
    error: Error | null;
  };
  twapOrdersData: {
    orders: TwapTableData[];
    loading: boolean;
    error: Error | null;
  };
  format: NumberFormatType;
}

export function OrderTableContent({ 
  activeSubTab, 
  address, 
  openOrdersData,
  twapOrdersData,
  format 
}: OrderTableContentProps) {
  if (activeSubTab === 'open') {
    return (
      <OpenOrdersList
        orders={openOrdersData.orders}
        isLoading={openOrdersData.loading}
        error={openOrdersData.error}
      />
    );
  }

  if (activeSubTab === 'twap') {
    return (
      <UserTwapTable
        twaps={twapOrdersData.orders}
        isLoading={twapOrdersData.loading}
        error={twapOrdersData.error}
      />
    );
  }

  return null;
} 