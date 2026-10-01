import type { Metadata } from "next";
import { generateMetadata as seoMetadata, decodeEntityParam } from "@/lib/seo";

/**
 * One title per address, kept out of the index: any address is a valid URL
 * (an unbounded set of near-empty testnet pages), but links on it are followed.
 */
export async function generateMetadata({ params }: { params: Promise<{ address: string }> }): Promise<Metadata> {
  const address = decodeEntityParam((await params).address).toLowerCase();
  const short = `${address.slice(0, 8)}…${address.slice(-4)}`;
  return {
    ...seoMetadata({
      title: `Elysium Address ${short} - Balances & Activity`,
      description: `Elysium testnet address ${address}: HYPE and token balances, recent activity, bridge history and what the address does.`,
      path: `/elysium/address/${address}`,
    }),
    robots: { index: false, follow: true },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
