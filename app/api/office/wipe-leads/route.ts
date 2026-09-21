// ONE-OFF: wipe every inquiry, order and invoice so the office starts clean.
// Signed-in only. Returns the deleted rows so they can be kept as a backup.
// Remove this route after use.
import { isSignedIn } from "@/lib/studio/auth";
import { store } from "@/lib/studio/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isSignedIn())) return new Response("Unauthorized", { status: 401 });
  if (req.headers.get("x-confirm") !== "wipe-leads") return new Response("Missing confirmation", { status: 400 });
  const s = await store();
  const tables = ["inquiry", "order", "invoice"] as const;
  const backup: Record<string, unknown[]> = {};
  const deleted: Record<string, number> = {};
  for (const t of tables) {
    const rows = await s.list<{ id: string }>(t);
    backup[t] = rows;
    for (const r of rows) await s.del(t, r.id);
    deleted[t] = rows.length;
  }
  const left = { work: await s.count("work"), collection: await s.count("collection") };
  return Response.json({ ok: true, deleted, left, backup });
}
