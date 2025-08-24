"use client";

import { usePathname } from "next/navigation";

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
    <div className="lg:pl-[220px] relative">
      {children}
    </div>
  );
} 