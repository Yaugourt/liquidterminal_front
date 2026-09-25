"use client";

import { useEffect } from "react";
import { PrivyProvider, useLogin, useModalStatus, usePrivy } from "@privy-io/react-auth";
import { env } from "@/lib/env";
import { chartPalette } from "@/components/common";
import { privyBridge } from "./store";

/**
 * The only runtime importer of the Privy SDK. Loaded through `loadPrivy()`
 * and mounted by `<LazyPrivy />` next to the app (not around it).
 */

/** Mirrors the Privy state the app reads into the facade store. */
function PrivyBridge() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { isOpen } = useModalStatus();

  useLogin({ onComplete: privyBridge.emitLoginComplete });

  // Delegates before the snapshot: whoever sees `ready` may call them.
  useEffect(() => {
    privyBridge.setDelegates({ login, logout, getAccessToken });
  }, [login, logout, getAccessToken]);

  useEffect(() => {
    privyBridge.setSnapshot({ ready, authenticated, user, modalOpen: isOpen });
  }, [ready, authenticated, user, isOpen]);

  // Unmounted with the app shell (e.g. navigating to the landing): the next
  // mount starts from `ready: false`, like a fresh PrivyProvider.
  useEffect(() => privyBridge.reset, []);

  return null;
}

export default function PrivyRoot() {
  return (
    <PrivyProvider
      appId={env.NEXT_PUBLIC_PRIVY_AUDIENCE}
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
      <PrivyBridge />
    </PrivyProvider>
  );
}
