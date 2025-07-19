import { useWallets } from "@/store/use-wallets";
import { TwapSection } from "@/components/explorer/address/orders/TwapSection";

export function WalletTwapSection() {
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();

  if (!activeWallet?.address) {
    return (
      <div className="bg-[#051728] border-2 border-[#83E9FF4D] rounded-lg p-8 text-center">
        <h3 className="text-white text-lg font-medium mb-2">TWAP</h3>
        <p className="text-[#FFFFFF80] text-sm">No wallet selected</p>
      </div>
    );
  }

  return <TwapSection address={activeWallet.address} />;
} 