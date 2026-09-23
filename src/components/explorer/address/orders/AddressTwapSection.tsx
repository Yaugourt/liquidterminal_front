import { SourceBadge, sourceStatus } from "@/components/common";
import { UserTwapTable } from "./UserTwapTable";
import { useUserTwapOrders } from "@/services/explorer/address";

interface AddressTwapSectionProps {
  address: string;
}

export function AddressTwapSection({ address }: AddressTwapSectionProps) {
  const {
    orders: twapOrders,
    isLoading: twapLoading,
    error: twapError
  } = useUserTwapOrders(address);

  // The active TWAP feed is Hypurrscan `/twap/*`.
  return (
    <UserTwapTable
      title="Active TWAP orders"
      headerAction={<SourceBadge source="hypurrscan" status={sourceStatus(twapError, twapLoading)} />}
      twaps={twapOrders}
      isLoading={twapLoading}
      error={twapError}
    />
  );
}
