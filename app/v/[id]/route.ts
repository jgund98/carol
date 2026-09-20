// Short link from Carol's texts: /v/<id> → the invoice in the Studio Office (via login if needed).
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dest = `/office/invoices/${encodeURIComponent(id)}`;
  redirect((await isSignedIn()) ? dest : `/login?next=${encodeURIComponent(dest)}`);
}
