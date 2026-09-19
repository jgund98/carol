// The buyer's view of an invoice. Private link (id + token), no login, prints cleanly.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvoice } from "@/lib/studio/invoices";
import { getSettings } from "@/lib/studio/store";
import InvoiceDocument from "@/components/office/InvoiceDocument";
import PrintButton from "@/components/office/PrintButton";
import "../../office/office.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Invoice · Carol Calicchio Art Studio" }, robots: { index: false, follow: false } };

export default async function PublicInvoice({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> }) {
  const [{ id }, { k }] = await Promise.all([params, searchParams]);
  const inv = await getInvoice(id);
  if (!inv || !k || k !== inv.token) notFound();
  const settings = await getSettings();
  return (
    <div className="office">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-14 print:p-0">
        <InvoiceDocument inv={inv} payInstructions={settings.payInstructions} />
        <div className="mt-6 flex justify-center print:hidden">
          <PrintButton />
        </div>
      </main>
    </div>
  );
}
