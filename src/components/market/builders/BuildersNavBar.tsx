"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Overview", href: "/market/builders" },
  { label: "Intelligence", href: "/market/builders/intelligence" },
];

const ETH_ADDRESS = /^\/market\/builders\/0x[a-fA-F0-9]{40}/i;

export function BuildersNavBar() {
  const pathname = usePathname();

  if (ETH_ADDRESS.test(pathname)) return null;

  return (
    <nav className="flex gap-1 bg-brand-secondary/60 border border-border-subtle p-1 rounded-xl w-fit">
      {NAV.map(({ label, href }) => {
        const isActive =
          href === "/market/builders"
            ? pathname === "/market/builders"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-brand-accent/20 text-brand-accent"
                : "text-text-secondary hover:bg-white/5 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
