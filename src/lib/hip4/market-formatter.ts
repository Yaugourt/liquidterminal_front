import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function parseExpiry(expiry: string): Date | null {
  const m = expiry.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/);
  if (!m) return null;
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00Z`);
}

function formatExpiryDate(expiry: string): string {
  const m = expiry.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/);
  if (!m) return expiry;
  const month = MONTHS[parseInt(m[2]) - 1];
  const day = parseInt(m[3]);
  const hh = parseInt(m[4]);
  const mm = m[5];
  const ampm = hh < 12 ? "AM" : "PM";
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  const time = mm === "00" ? `${h12}:00 ${ampm}` : `${h12}:${mm} ${ampm}`;
  return `${month} ${day} at ${time} UTC`;
}

export function formatMarketTitle(market: Hip4MarketEnrichedRow): string {
  const { class: cls, underlying, target_price, expiry } = market;
  if (
    cls === "priceBinary" &&
    underlying &&
    target_price != null &&
    expiry
  ) {
    const price =
      target_price >= 1000
        ? target_price.toLocaleString("en-US", { maximumFractionDigits: 0 })
        : String(target_price);
    return `${underlying} above ${price} on ${formatExpiryDate(expiry)}?`;
  }
  return market.display_name || market.coin || "Unknown market";
}

export function formatExpiryCountdown(expiry: string | null): string | null {
  if (!expiry) return null;
  const expiryDate = parseExpiry(expiry);
  if (!expiryDate) return null;
  const diffMs = expiryDate.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) {
    const diffM = Math.floor(diffMs / 60_000);
    return `Expires in ${diffM}m`;
  }
  if (diffH < 24) return `Expires in ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Expires in ${diffD}d`;
}
