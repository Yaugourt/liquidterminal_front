import { Card } from "@/components/ui/card";
import { UserTwapTable } from "./UserTwapTable";
import { useUserTwapOrders } from "@/services/explorer/address";

interface AddressTwapSectionProps {
  address: string;
}

export function AddressTwapSection({ address }: AddressTwapSectionProps) {
  // Hook pour récupérer les TWAP orders (logique métier intégrée)
  const {
    orders: twapOrders,
    isLoading: twapLoading,
    error: twapError
  } = useUserTwapOrders(address);

  return (
    <Card className="w-full">
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