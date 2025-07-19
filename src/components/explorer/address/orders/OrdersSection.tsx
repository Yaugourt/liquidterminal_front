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
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm rounded-lg">
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