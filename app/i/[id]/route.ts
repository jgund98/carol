// Short, text-message-friendly link to an invoice: /i/<id> → the full page with its token.
import { redirect } from "next/navigation";
import { getInvoice } from "@/lib/studio/invoices";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await getInvoice(id);
  if (!inv) return new Response("Not found", { status: 404 });
  redirect(`/invoice/${inv.id}?k=${inv.token}`);
}
