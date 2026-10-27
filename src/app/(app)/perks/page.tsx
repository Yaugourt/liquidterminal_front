import { PageHeader } from "@/components/common";
import { PerksGrid } from "@/components/perks/PerksGrid";

/** Partner offers for Liquid Terminal users; members offers unlock on sign-in. */
export default function PerksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Perks"
        titleQualifier="Partner offers"
        description="Offers from Hyperliquid projects for Liquid Terminal users. Sign in to unlock the codes and links of members offers."
      />
      <PerksGrid />
    </div>
  );
}
