// Short tracking link from the shipped text: /t/<orderId> → the carrier's tracking page.
import { getOrder } from "@/lib/studio/store";
import { trackingLink } from "@/lib/studio/shipping";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOrder(id);
  const link = o ? trackingLink(o.carrier, o.tracking) : null;
  if (!link) return new Response("Not found", { status: 404 });
  return Response.redirect(link, 302);
}
