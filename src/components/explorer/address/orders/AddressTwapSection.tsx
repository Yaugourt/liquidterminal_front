import { Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SourceBadge, sourceStatus } from "@/components/common";
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
    <Card className="w-full overflow-hidden">
      {/* V4 card-head — the active TWAP feed is Hypurrscan `/twap/*`. */}
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Timer size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Active TWAP orders</h3>
        <SourceBadge source="hypurrscan" status={sourceStatus(twapError, twapLoading)} className="ml-auto" />
      </div>
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
