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
    <Card className="w-full glass-panel">
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