// Prints every text message and subject line the studio can send, with the
// segment length of each text, so the wording can be reviewed in one place.
//   npx tsx scripts/notif-copy.ts
import { carol, buyer, smsLength } from "../lib/studio/texts";
import type { StudioOrder } from "../lib/studio/types";
import type { StudioInvoice } from "../lib/studio/invoice-shared";

const o: StudioOrder = {
  id: "ord_k3j2h1a9bc", ref: "CC-7Q2K1F", createdAt: "", updatedAt: "", name: "Jane Whitfield", email: "jane@example.com", phone: "561-555-0142",
  address: "", city: "", state: "", zip: "", payment: "Card", delivery: "Ship to me", message: "",
  items: [{ slug: "sunlit-study", name: "Sunlit Study", qty: 1, price: 4800, image: "", dims: "36 x 48 in" }],
  subtotal: 4800, status: "new", notes: null, paidAt: null, carrier: "UPS", tracking: "1Z999AA10123456784", shippedAt: null, deliveredAt: null,
  refundedAt: null, refundAmount: null, refundNote: null, stripeSessionId: null,
};
const two: StudioOrder = { ...o, items: [o.items[0], { slug: "coral-morning", name: "Coral Morning", qty: 1, price: 3200, image: "", dims: null }], subtotal: 8000 };
const inv: StudioInvoice = {
  id: "inv_p8d2m4c1xz", number: "INV-0007", token: "t", name: "Jane Whitfield", email: "jane@example.com", phone: "561-555-0142",
  items: [{ description: "Sunlit Study, 36 x 48 in", cents: 250000 }], totalCents: 250000, dueDate: "2026-09-12", note: "", status: "sent",
  createdAt: "", updatedAt: "", sentAt: null, emailedAt: null, textedAt: null, paidAt: null, paidHow: null, orderId: null, stripeSessionId: null,
};

const show = (title: string, t: { subject: string; sms: string }) => {
  console.log(`\n## ${title}`);
  console.log(`Email subject: ${t.subject}`);
  console.log(t.sms ? `SMS (${smsLength(t.sms)}): ${t.sms}` : "SMS: none (email only)");
};

console.log("=== TO CAROL ===");
show("New sale on the website (one piece)", carol.newSale(o));
show("New sale on the website (two pieces)", carol.newSale(two));
show("Invoice paid by card", carol.invoicePaid(inv));
show("Artwork inquiry", carol.inquiry("inquiry", "inq_a1b2c3d4ef", "Jane Whitfield", "Sunlit Study"));
show("Commission request", carol.inquiry("commission", "inq_a1b2c3d4ef", "Jane Whitfield"));
show("Studio visit request", carol.inquiry("visit", "inq_a1b2c3d4ef", "Jane Whitfield"));
show("Contact message", carol.inquiry("contact", "inq_a1b2c3d4ef", "Jane Whitfield"));
show("Newsletter signup", carol.newsletter("jane@example.com"));

console.log("\n=== TO THE BUYER ===");
show("Purchase receipt", buyer.receipt(o));
show("Purchase receipt (two pieces)", buyer.receipt(two));
show("Shipped, with tracking", buyer.shipped(o, true));
show("Shipped, carrier without a tracking page", buyer.shipped({ ...o, carrier: "Other" }, false));
show("Invoice sent", buyer.invoiceSent(inv));
show("Invoice paid (receipt)", buyer.invoicePaid(inv));
show("Invoice reminder", buyer.invoiceReminder(inv));
