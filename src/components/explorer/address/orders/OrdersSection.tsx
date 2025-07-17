import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { OrderTabButtons, OrderTableContent } from ".";
import { useOpenOrders, useUserTwapOrders } from "@/services/explorer/address";
import { useNumberFormat } from "@/store/number-format.store";

type OrderSubTab = 'open' | 'twap';

interface OrdersSectionProps {
  address: string;
}

export function OrdersSection({ address }: OrdersSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<OrderSubTab>('open');
  const { format } = useNumberFormat();
  
  // Hook pour récupérer les open orders (logique métier intégrée)
  const { 
    data: openOrders, 
    isLoading: openOrdersLoading, 
    error: openOrdersError 
  } = useOpenOrders(address);

  // Hook pour récupérer les TWAP orders (logique métier intégrée)
  const { 
    orders: twapOrders, 
    isLoading: twapLoading, 
    error: twapError 
  } = useUserTwapOrders(address);

  const handleSubTabChange = useCallback((subTab: OrderSubTab) => {
    setActiveSubTab(subTab);
  }, []);

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm rounded-lg">
      <div className="p-4 space-y-4">
        {/* Sous-tabs */}
        <OrderTabButtons 
          activeSubTab={activeSubTab} 
          onSubTabChange={handleSubTabChange}
        />

        {/* Contenu des sous-tabs */}
        <OrderTableContent
          activeSubTab={activeSubTab}
          address={address}
          openOrdersData={{
            orders: openOrders || [],
            loading: openOrdersLoading,
            error: openOrdersError
          }}
          twapOrdersData={{
            orders: twapOrders,
            loading: twapLoading,
            error: twapError
          }}
          format={format}
        />
      </div>
    </Card>
  );
} 