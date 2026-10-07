import type { Metadata } from "next";
import { generateMetadata as seoMetadata, decodeEntityParam } from "@/lib/seo";

/**
 * One title per transaction, kept out of the index (an unbounded set of
 * testnet pages), but links on it are followed.
 */
export async function generateMetadata({ params }: { params: Promise<{ hash: string }> }): Promise<Metadata> {
  const hash = decodeEntityParam((await params).hash).toLowerCase();
  const short = `${hash.slice(0, 10)}…${hash.slice(-6)}`;
  return {
    ...seoMetadata({
      title: `Elysium Transaction ${short} - Decoded`,
      description: `Elysium testnet transaction ${hash}: status, fee split between execution and HyperEVM posting, decoded call, balance changes, token movements and events.`,
      path: `/elysium/tx/${hash}`,
    }),
    robots: { index: false, follow: true },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
