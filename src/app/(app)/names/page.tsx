import { PageHeader } from "@/components/common";
import { ClaimHlName } from "@/components/names/ClaimHlName";

/**
 * Get a .hl name (Hyperliquid Names), minted from the user's wallet without
 * leaving Liquid Terminal. `?name=` pre-fills the search (links from wallet
 * pages and the Telegram bot).
 */
export default async function NamesPage({ searchParams }: { searchParams: Promise<{ name?: string | string[] }> }) {
  const { name } = await searchParams;
  const initial = (Array.isArray(name) ? name[0] : name)?.slice(0, 40) ?? "";
  return (
    <div className="space-y-6">
      <PageHeader
        title="Get a .hl name"
        titleQualifier="Hyperliquid Names"
        description="One readable name for your Hyperliquid wallet, shown instead of 0x… on Liquid Terminal, in your Telegram alerts and across the ecosystem."
      />
      <ClaimHlName initial={initial} />
    </div>
  );
}
