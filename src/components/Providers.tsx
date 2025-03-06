"use client";

import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { PrivyProvider } from "@privy-io/react-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar();
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_AUDIENCE || "";

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          accentColor: "#83E9FF",
          theme: "#051728",
          showWalletLoginFirst: false,
          logo: "/logo.svg",
          walletChainType: "ethereum-only",
          walletList: ["detected_ethereum_wallets"],
        },
        loginMethods: ["farcaster", "github", "twitter"],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
        embeddedWallets: {
          createOnLogin: "off",
          requireUserPasswordOnCreate: false,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {children}
    </PrivyProvider>
  );
}
