// How many new things are waiting. The office nav polls this so the badges
// light up wherever Carol is, and the browser tab shows the count.
import { isSignedIn } from "@/lib/studio/auth";
import { listInquiries, listOrders } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isSignedIn())) return Response.json({ inquiries: 0, orders: 0 }, { status: 401 });
  const [inq, ord] = await Promise.all([listInquiries(), listOrders()]);
  return Response.json({
    inquiries: inq.filter((i) => i.status === "new").length,
    orders: ord.filter((o) => o.status === "new").length,
  });
}
