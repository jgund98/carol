import { getOrder } from "@/lib/studio/store";
import { dims } from "@/lib/catalog";
import { PageHead } from "@/components/office/ui";
import InvoiceForm from "@/components/office/InvoiceForm";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const o = order ? await getOrder(order) : null;
  const initial = o
    ? {
        name: o.name,
        email: o.email,
        phone: o.phone,
        orderId: o.id,
        rows: o.items.map((it) => ({ description: `${it.name}${it.dims ? `, ${it.dims}` : ""}${it.qty > 1 ? ` × ${it.qty}` : ""}`, amount: String((it.price * it.qty).toFixed(0)) })),
      }
    : undefined;
  void dims;
  return (
    <>
      <PageHead back={{ href: o ? `/office/orders/${o.id}` : "/office/invoices", label: o ? "Back to the order" : "All invoices" }} kicker="New invoice" title={o ? `Invoice for ${o.name}` : "Write an invoice."} />
      <InvoiceForm initial={initial} />
    </>
  );
}
