// Seat counts for the classes, read from paid orders. Server only.
import { listOrders } from "./store";
import { CLASSES, classSlug, upcomingClasses, type StudioClass } from "@/lib/classes";

const COUNTS = new Set(["paid", "shipped", "delivered"]);

/** Seats already sold per class id, across paid bookings. */
export async function seatsTaken(): Promise<Record<string, number>> {
  const taken: Record<string, number> = {};
  for (const c of CLASSES) taken[c.id] = 0;
  for (const o of await listOrders()) {
    if (!COUNTS.has(o.status)) continue;
    for (const it of o.items) {
      const c = CLASSES.find((x) => classSlug(x) === it.slug);
      if (c) taken[c.id] += it.qty;
    }
  }
  return taken;
}

export type ClassAvailability = StudioClass & { taken: number; left: number };

/** Upcoming dates with how many seats remain, soonest first. */
export async function classAvailability(): Promise<ClassAvailability[]> {
  const taken = await seatsTaken();
  return upcomingClasses().map((c) => ({ ...c, taken: taken[c.id] ?? 0, left: Math.max(0, c.seats - (taken[c.id] ?? 0)) }));
}
