"use client";

import { useState, useEffect, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@/store/use-wallets";
import { Button } from "@/components/ui/button";
import { Plus, Check, LogIn } from "lucide-react";
import { toast } from "sonner";
import { showXpGainToast } from "@/components/xp";
import { handleWalletApiError } from "@/lib/toast-messages/wallet";

interface AddToTrackListButtonProps {
  address: string;
  className?: string;
}

/**
 * Button to add a wallet to user's track list
 * Shows login modal if not authenticated
 * Shows "Tracked" state if wallet already tracked
 */
export function AddToTrackListButton({ address, className = "" }: AddToTrackListButtonProps) {
  const { authenticated, login } = usePrivy();
  const { wallets, addWallet } = useWallets();
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if wallet is already tracked
  const isTracked = useMemo(() => {
    if (!authenticated || !wallets || !isMounted) return false;
    return wallets.some(w => w.address.toLowerCase() === address.toLowerCase());
  }, [authenticated, wallets, address, isMounted]);

  // Truncate address for display
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleAddToTrackList = async () => {
    if (!authenticated) {
      setShowLoginModal(true);
      return;
    }

    setIsAdding(true);
    try {
      const result = await addWallet(address, `Wallet ${truncatedAddress}`);
      toast.success("Wallet added to your track list");

      if (result?.xpGranted) {
        showXpGainToast(result.xpGranted, "Wallet tracked");
      }
    } catch (error) {
      handleWalletApiError(error);
    } finally {
      setIsAdding(false);
    }
  };

  // After login, automatically add wallet
  useEffect(() => {
    if (authenticated && showLoginModal && !isTracked) {
      setShowLoginModal(false);
      handleAddToTrackList();
    }
  }, [authenticated, showLoginModal, isTracked]);

  // If already tracked, show "Tracked" button
  if (isTracked) {
    return (
      <Button
        variant="outline"
        className={`border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 ${className}`}
        disabled
      >
        <Check className="w-4 h-4 mr-2" />
        Tracked
      </Button>
    );
  }

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-brand-secondary/80 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-6 max-w-md mx-4">
            <h2 className="text-lg font-semibold text-white mb-2">
              Login to Track Wallet
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Sign in to add this wallet to your track list
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => login()}
                className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-black font-semibold"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </Button>
              <Button
                onClick={() => setShowLoginModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <Button
        onClick={handleAddToTrackList}
        disabled={isAdding}
        className={`bg-brand-gold hover:bg-brand-gold/90 text-black font-semibold ${className}`}
      >
        <Plus className="w-4 h-4 mr-2" />
        {isAdding ? "Adding..." : "Add to Track List"}
      </Button>
    </>
  );
}
