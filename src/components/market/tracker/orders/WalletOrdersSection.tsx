import { useWallets } from "@/store/use-wallets";
import { OrdersSection } from "@/components/explorer/address/orders/OrdersSection";

export function WalletOrdersSection() {
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();

  if (!activeWallet?.address) {
    return (
      <div className="bg-brand-tertiary border-2 border-[#83E9FF4D] rounded-lg p-8 text-center">
        <h3 className="text-white text-lg font-medium mb-2">Orders</h3>
        <p className="text-[#FFFFFF80] text-sm">No wallet selected</p>
      </div>
    );
  }

  return <OrdersSection address={activeWallet.address} />;
} 