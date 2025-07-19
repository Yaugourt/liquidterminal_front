import { Card } from "@/components/ui/card";
import { UserTwapTable } from "./UserTwapTable";
import { useUserTwapOrders } from "@/services/explorer/address";

interface TwapSectionProps {
  address: string;
}

export function TwapSection({ address }: TwapSectionProps) {
  // Hook pour récupérer les TWAP orders (logique métier intégrée)
  const { 
    orders: twapOrders, 
    isLoading: twapLoading, 
    error: twapError 
  } = useUserTwapOrders(address);

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm rounded-lg">
      <div className="p-4">
        <UserTwapTable
          twaps={twapOrders}
          isLoading={twapLoading}
          error={twapError}
        />
      </div>
    </Card>
  );
} 