"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePrivy, useModalStatus } from "@privy-io/react-auth";
import { useWallets } from "@/store/use-wallets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  // Privy's own modal open-state — used to hand off focus cleanly (see below).
  const { isOpen: privyModalOpen } = useModalStatus();
  const { wallets, addWallet } = useWallets();
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Set when the user clicks "Login" from the modal. The dialog is hidden while
  // Privy's modal is open (so Radix's focus trap doesn't fight Privy), so the
  // intent is tracked on a ref to survive that close and still auto-add.
  const awaitingLoginRef = useRef(false);

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

  const handleAddToTrackList = useCallback(async () => {
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
  }, [authenticated, addWallet, address, truncatedAddress]);

  // After the user logs in via the modal, automatically add the wallet.
  useEffect(() => {
    if (authenticated && awaitingLoginRef.current && !isTracked) {
      awaitingLoginRef.current = false;
      setShowLoginModal(false);
      void handleAddToTrackList();
    }
  }, [authenticated, isTracked, handleAddToTrackList]);

  // If already tracked, show "Tracked" button
  if (isTracked) {
    return (
      <Button
        variant="outline"
        className={`border-success/50 text-success hover:bg-success/10 ${className}`}
        disabled
      >
        <Check className="w-4 h-4 mr-2" />
        Tracked
      </Button>
    );
  }

  return (
    <>
      {/* Login modal — shown when an unauthenticated user tries to track.
          Hidden while Privy's own modal is open so the two focus traps don't
          fight; it reappears if the user dismisses Privy without logging in. */}
      <Dialog open={showLoginModal && !privyModalOpen} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login to Track Wallet</DialogTitle>
            <DialogDescription>
              Sign in to add this wallet to your track list
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLoginModal(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={() => {
                awaitingLoginRef.current = true;
                login();
              }}
              className="bg-brand hover:bg-brand/90 text-black font-semibold"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Button */}
      <Button
        onClick={handleAddToTrackList}
        disabled={isAdding}
        className={`bg-gold hover:bg-gold/90 text-black font-semibold ${className}`}
      >
        <Plus className="w-4 h-4 mr-2" />
        {isAdding ? "Adding..." : "Add to Track List"}
      </Button>
    </>
  );
}
