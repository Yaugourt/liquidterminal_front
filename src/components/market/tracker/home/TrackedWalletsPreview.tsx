"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallets } from "@/store/use-wallets";
import { useAuthContext } from "@/contexts/auth.context";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet, LogIn, ArrowRight, TrendingUp, BarChart3, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Composant preview des wallets suivis pour la home page du tracker
 * Affiche différent contenu selon l'état d'authentification
 */
export function TrackedWalletsPreview() {
  const { login } = useAuthContext();
  const { ready: privyReady, authenticated } = usePrivy();
  const { wallets, getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthenticated = isMounted && privyReady && authenticated;

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-gold/10 rounded-lg">
            <Wallet className="h-5 w-5 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Your Wallets</h2>
            <p className="text-text-muted text-sm">Track and monitor</p>
          </div>
        </div>
        {isAuthenticated && wallets.length > 0 && (
          <Link href="/market/tracker/my-wallets">
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10"
            >
              Manage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Non-authenticated state */}
        {!isAuthenticated && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="p-4 bg-brand-gold/10 rounded-2xl mb-4">
              <Wallet className="h-12 w-12 text-brand-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Track Your Favorite Wallets
            </h3>
            <p className="text-text-secondary text-sm mb-6 max-w-md">
              Login to track wallet performance, monitor trades, and organize wallets into lists
            </p>

            {/* Features list */}
            <div className="grid grid-cols-1 gap-3 mb-6 text-left">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <TrendingUp className="h-4 w-4 text-brand-accent" />
                <span>Real-time portfolio tracking</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <ListChecks className="h-4 w-4 text-brand-accent" />
                <span>Custom wallet lists</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <BarChart3 className="h-4 w-4 text-brand-accent" />
                <span>Performance analytics</span>
              </div>
            </div>

            <Button
              onClick={() => login()}
              className="bg-brand-gold hover:bg-brand-gold/90 text-black font-semibold"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login to Get Started
            </Button>
          </div>
        )}

        {/* Authenticated state - No wallets */}
        {isAuthenticated && wallets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="p-4 bg-brand-gold/10 rounded-2xl mb-4">
              <Wallet className="h-12 w-12 text-brand-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Wallets Tracked Yet
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Start tracking wallets to monitor their performance
            </p>
            <Link href="/market/tracker/my-wallets">
              <Button className="bg-brand-accent hover:bg-brand-accent/90 text-black font-semibold">
                <Wallet className="mr-2 h-4 w-4" />
                Add Your First Wallet
              </Button>
            </Link>
          </div>
        )}

        {/* Authenticated state - Has wallets */}
        {isAuthenticated && wallets.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-secondary/40 backdrop-blur-sm rounded-xl p-4 border border-border-subtle">
                <p className="text-text-muted text-sm mb-1">Tracked Wallets</p>
                <p className="text-2xl font-bold text-white">{wallets.length}</p>
              </div>
              <div className="bg-brand-secondary/40 backdrop-blur-sm rounded-xl p-4 border border-border-subtle">
                <p className="text-text-muted text-sm mb-1">Active Wallet</p>
                <p className="text-sm font-mono text-brand-accent truncate">
                  {activeWallet ? `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}` : 'None'}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-border-subtle">
              <Link href="/market/tracker/my-wallets">
                <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-black font-semibold">
                  Go to My Wallets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
