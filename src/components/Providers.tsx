"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "@/contexts/auth.context";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import { XpNotificationProvider } from "@/components/xp";
import { XpProvider } from "@/services/xp";
import { chartPalette } from "@/components/common";

// NOTE: the app Sidebar is mounted by `src/app/(app)/layout.tsx` (single
// source of truth). It used to be duplicated here, which stacked two fixed
// sidebars on every page and leaked one onto routes without the app shell.


export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = env.NEXT_PUBLIC_PRIVY_AUDIENCE;

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          accentColor: chartPalette.accent,
          theme: chartPalette.brandTertiary,
          showWalletLoginFirst: false,
          logo: "/logo.svg",
        },
        loginMethods: ["twitter"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off",
          },
          showWalletUIs: false,
        },
      }}
    >
      <AuthProvider>
        <XpProvider>
          <XpNotificationProvider>
            {children}
            <Toaster />
          </XpNotificationProvider>
        </XpProvider>
      </AuthProvider>
    </PrivyProvider>
  );
}
