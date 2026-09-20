// Where a tracking number can be followed, by carrier. Client-safe.
export function trackingLink(carrier: string | null | undefined, n: string | null | undefined): string | null {
  const num = (n || "").replace(/\s+/g, "");
  if (!num) return null;
  const c = carrier || "";
  if (/ups/i.test(c)) return `https://www.ups.com/track?tracknum=${encodeURIComponent(num)}`;
  if (/fedex/i.test(c)) return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(num)}`;
  if (/usps/i.test(c)) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(num)}`;
  if (/dhl/i.test(c)) return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(num)}`;
  return null;
}
