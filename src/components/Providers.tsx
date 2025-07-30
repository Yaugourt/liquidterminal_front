"use client";

import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "@/contexts/auth.context";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";


export function Providers({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
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
        },
        loginMethods: ["twitter"],
        embeddedWallets: {
          createOnLogin: "off",
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      <AuthProvider>
        {!isHomePage && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}
        {children}
        <Toaster />
      </AuthProvider>
    </PrivyProvider>
  );
}
