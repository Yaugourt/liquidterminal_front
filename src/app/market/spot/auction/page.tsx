import { generateMetadata, seoConfig } from "@/lib/seo";
import { SpotAuctionContent } from "./SpotAuctionContent";

export const metadata = generateMetadata(seoConfig.spotAuction);

export default function SpotAuctionPage() {
  return <SpotAuctionContent />;
}
