"use client";

import { usePathname } from "next/navigation";
import { ClosedBetaGuard } from "./ClosedBetaGuard";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <ClosedBetaGuard>
      <div className="lg:pl-[220px] relative">
        {children}
      </div>
    </ClosedBetaGuard>
  );
} 