import { Card } from "@/components/ui/card";
import { OpenOrdersList } from "./OpenOrdersList";
import { useOpenOrders } from "@/services/explorer/address";

interface OrdersSectionProps {
  address: string;
}

export function OrdersSection({ address }: OrdersSectionProps) {
  // Hook pour récupérer les open orders (logique métier intégrée)
  const {
    data: openOrders,
    isLoading: openOrdersLoading,
    error: openOrdersError
  } = useOpenOrders(address);

  return (
    <Card className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20">
      <div className="p-4">
        <OpenOrdersList
          orders={openOrders || []}
          isLoading={openOrdersLoading}
          error={openOrdersError}
        />
      </div>
    </Card>
  );
} 