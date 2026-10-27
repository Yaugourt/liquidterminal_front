import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Hyperliquid Names logo ("logo blue eyes", from their docs at
 * hyperliquid-names.gitbook.io). Sized by `className` (w-/h- classes), so it
 * also fits where the sidebar expects an icon component.
 */
export function HlNamesLogo({ className }: { className?: string }) {
  return <Image src="/partners/hlnames.svg" alt="" width={64} height={64} className={cn("h-4 w-4 shrink-0", className)} />;
}
