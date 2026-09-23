import { OpenOrdersList } from "./OpenOrdersList";
import { useOpenOrders } from "@/services/explorer/address";

interface OrdersSectionProps {
  address: string;
}

export function OrdersSection({ address }: OrdersSectionProps) {
  const {
    data: openOrders,
    isLoading: openOrdersLoading,
    error: openOrdersError
  } = useOpenOrders(address);

  return (
    <OpenOrdersList
      orders={openOrders || []}
      isLoading={openOrdersLoading}
      error={openOrdersError}
    />
  );
}
