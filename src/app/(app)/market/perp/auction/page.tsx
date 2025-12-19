import { generateMetadata, seoConfig } from "@/lib/seo";
import { PerpAuctionContent } from "./PerpAuctionContent";

export const metadata = generateMetadata(seoConfig.perpAuction);

export default function PerpAuctionPage() {
  return <PerpAuctionContent />;
}
