import type { Work } from "@/lib/works";
export type { Work, Kind } from "@/lib/works";

/** A collection (series) of works: Flower Power, Blue Series, … Carol manages these herself. */
export type CollectionDef = {
  /** stable id, also the key stored on each work's `collections` */
  id: string;
  /** URL: /collections/<slug> */
  slug: string;
  name: string;
  /** short line above the name ("Recent work", "14 x 14 in.") */
  kicker: string;
  blurb: string;
  /** slug of the piece whose image represents the collection */
  hero: string | null;
  position: number;
};

export type InquiryKind = "contact" | "inquiry" | "commission" | "visit" | "newsletter" | "other";

export type Inquiry = {
  id: string;
  createdAt: string;
  kind: InquiryKind;
  subject: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  /** the rest of what the form sent, label → value */
  fields: Record<string, string>;
  /** the piece this is about, when it is about one */
  workSlug: string | null;
  status: "new" | "handled";
  notes: string | null;
  handledAt: string | null;
};

export type OrderItem = { slug: string; name: string; qty: number; price: number; image: string; dims: string | null };

export type OrderStatus = "new" | "contacted" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";

export type StudioOrder = {
  id: string;
  /** the reference the buyer saw on the thank-you page, e.g. CC-7Q2K1F */
  ref: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  payment: string;
  delivery: string;
  message: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  notes: string | null;
  paidAt: string | null;
  /** shipping, when she sends it */
  carrier: string | null;
  tracking: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  /** a refund she recorded */
  refundedAt: string | null;
  refundAmount: number | null;
  refundNote: string | null;
  /** payment-processor reference, when there is one */
  stripeSessionId: string | null;
};

export type Settings = {
  /** where new inquiries and orders are emailed */
  notifyEmail: string;
  /** an optional second inbox */
  notifyEmail2: string;
  /** text alerts */
  notifyPhone: string;
  notifyPhone2: string;
  textAlerts: boolean;
  /** shown on invoices: how buyers can pay */
  payInstructions: string;
};

export type Catalog = { works: Work[]; collections: CollectionDef[] };

export const ORDER_STATUS: { key: OrderStatus; label: string; hint: string }[] = [
  { key: "new", label: "New", hint: "Just came in. Nobody has spoken to them yet." },
  { key: "contacted", label: "In conversation", hint: "You have reached out and are settling payment and delivery." },
  { key: "paid", label: "Paid", hint: "Payment received. Delivery or pick-up is next." },
  { key: "shipped", label: "Shipped", hint: "On its way. Add the carrier and tracking number below." },
  { key: "delivered", label: "Delivered", hint: "The piece is on their wall." },
  { key: "cancelled", label: "Cancelled", hint: "It did not go ahead." },
  { key: "refunded", label: "Refunded", hint: "Money returned to the buyer." },
];

export const CARRIERS = ["UPS", "FedEx", "USPS", "DHL", "White-glove art shipper", "Delivered by Carol", "Picked up at the studio", "Other"];

export const INQUIRY_KINDS: Record<InquiryKind, { label: string; plural: string }> = {
  contact: { label: "Message", plural: "Messages" },
  inquiry: { label: "Artwork inquiry", plural: "Artwork inquiries" },
  commission: { label: "Commission request", plural: "Commission requests" },
  visit: { label: "Studio visit", plural: "Studio visits" },
  newsletter: { label: "Newsletter signup", plural: "Newsletter signups" },
  other: { label: "Other", plural: "Other" },
};
