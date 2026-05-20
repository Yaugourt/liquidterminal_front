"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Overview", href: "/market/builders" },
  { label: "Analytics", href: "/market/builders/intelligence" },
];

const ETH_ADDRESS = /^\/market\/builders\/0x[a-fA-F0-9]{40}/i;

export function BuildersNavBar() {
  const pathname = usePathname();

  if (ETH_ADDRESS.test(pathname)) return null;

  return (
    <nav className="flex gap-0.5 bg-surface-2 border border-border-subtle p-0.5 rounded-md w-fit">
      {NAV.map(({ label, href }) => {
        const isActive =
          href === "/market/builders"
            ? pathname === "/market/builders"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isActive
                ? "bg-brand text-brand-text-on"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
