"use client";

import { AuthProvider } from "@/contexts/auth.context";
import { Toaster } from "@/components/ui/sonner";
import { XpNotificationProvider } from "@/components/xp";
import { XpProvider } from "@/services/xp";
import { LazyPrivy } from "@/services/auth/privy";

// NOTE: the app Sidebar is mounted by `src/app/(app)/layout.tsx` (single
// source of truth). It used to be duplicated here, which stacked two fixed
// sidebars on every page and leaked one onto routes without the app shell.


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>
        <XpProvider>
          <XpNotificationProvider>
            {children}
            <Toaster />
          </XpNotificationProvider>
        </XpProvider>
      </AuthProvider>
      {/* The Privy SDK is loaded on demand and mounted next to the tree, not
          around it: the app reads auth through `@/services/auth/privy`. */}
      <LazyPrivy />
    </>
  );
}
