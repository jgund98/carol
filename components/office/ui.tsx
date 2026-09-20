// Small shared pieces for the office. No client state here, so any page can use them.
import Link from "next/link";
import { stockLabel } from "@/lib/works";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import type { Inquiry, InquiryKind, OrderStatus } from "@/lib/studio/types";
import { INQUIRY_KINDS } from "@/lib/studio/types";
import type { Work } from "@/lib/works";
import { img } from "@/lib/catalog";

export function PageHead({ kicker, title, text, action, back }: { kicker?: string; title: string; text?: string; action?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="o-in-view mb-4 sm:mb-8">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-[0.95rem] font-semibold text-[var(--o-soft)] hover:text-[var(--o-ink)]">
          <ChevronLeft className="h-4 w-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4 sm:flex-nowrap">
        <div className="min-w-0 flex-1">
          {kicker && <p className="o-kicker">{kicker}</p>}
          <h1 className="o-h1 mt-1">{title}</h1>
          {text && <p className="o-muted mt-3 hidden max-w-2xl text-[1rem] sm:block">{text}</p>}
        </div>
        {action && <div className="w-full shrink-0 sm:w-auto sm:pt-2">{action}</div>}
      </div>
    </header>
  );
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="o-card-soft grid place-items-center px-6 py-14 text-center">
      <p className="o-h2">{title}</p>
      {text && <p className="o-muted mt-2 max-w-md">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ───── time (studio time, see lib/studio/time.ts) ───── */
export { timeAgo, fullDate } from "@/lib/studio/time";

/* ───── chips ───── */

const KIND_TONE: Record<InquiryKind, string> = {
  contact: "o-chip-ink",
  inquiry: "o-chip-ocean",
  commission: "o-chip-gold",
  visit: "o-chip-green",
  newsletter: "o-chip-muted",
  other: "o-chip-muted",
};

export function KindChip({ kind }: { kind: InquiryKind }) {
  return <span className={`o-chip ${KIND_TONE[kind] ?? "o-chip-muted"}`}>{INQUIRY_KINDS[kind]?.label ?? "Message"}</span>;
}

export function OrderChip() {
  return <span className="o-chip o-chip-pink">Order</span>;
}

const ORDER_TONE: Record<OrderStatus, string> = {
  new: "o-chip-gold",
  contacted: "o-chip-ocean",
  paid: "o-chip-green",
  shipped: "o-chip-ocean",
  delivered: "o-chip-ink",
  cancelled: "o-chip-red",
  refunded: "o-chip-red",
};
const ORDER_LABEL: Record<OrderStatus, string> = { new: "New", contacted: "In conversation", paid: "Paid", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded" };

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <span className={`o-chip ${ORDER_TONE[status]}`}>{ORDER_LABEL[status]}</span>;
}

export function WorkStatusChip({ work }: { work: Pick<Work, "hidden" | "sold" | "available" | "stock"> }) {
  if (work.hidden) return <span className="o-chip o-chip-muted">Hidden</span>;
  if (work.sold) return <span className="o-chip o-chip-ink">Sold</span>;
  if (!work.available) return <span className="o-chip o-chip-gold">On hold</span>;
  const left = stockLabel(work);
  return <span className="o-chip o-chip-green">{left ? `For sale · ${left}` : "For sale"}</span>;
}

export function NewDot({ on }: { on: boolean }) {
  return on ? <span className="o-new shrink-0" aria-label="New" /> : <span className="inline-block h-[0.65rem] w-[0.65rem] shrink-0 rounded-full bg-[var(--o-hair-2)]" />;
}

/* ───── list rows: one dot, a bold name, the time on the right, one quiet line ───── */

export function Row({ href, isNew = false, tone = "gold", flash = false, thumb, title, meta, time, amount }: { href: string; isNew?: boolean; tone?: "gold" | "pink"; flash?: boolean; thumb?: ReactNode; title: string; meta: ReactNode; time: string; amount?: string }) {
  return (
    <Link href={href} className={`o-row ${flash ? "o-flash" : ""}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${isNew ? (tone === "pink" ? "bg-[var(--o-pink)]" : "bg-[var(--o-gold)]") : "bg-transparent"}`} aria-label={isNew ? "New" : undefined} />
      {thumb}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className={`truncate text-[1.02rem] leading-snug ${isNew ? "font-bold" : "font-medium"}`}>{title}</p>
          <span className="shrink-0 text-[0.78rem] text-[var(--o-faint)]">{time}</span>
        </div>
        <p className="mt-0.5 truncate text-[0.88rem] text-[var(--o-soft)]">{meta}</p>
      </div>
      {amount && <span className="o-num hidden shrink-0 text-[1.15rem] sm:block">{amount}</span>}
    </Link>
  );
}

/* ───── thumbnails ───── */

export function Thumb({ work, size = 64, className = "" }: { work: Pick<Work, "imageSm" | "iw" | "ih" | "name" | "kind"> & Partial<Work>; size?: number; className?: string }) {
  const a = work.iw / work.ih;
  const board = work.kind === "surfboard";
  const w = board ? size : a >= 1 ? size * 0.82 : size * 0.82 * a;
  const h = board ? size : w / a;
  return (
    <div className={`o-thumb shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={work.imageSm || (work as Work).image} alt="" width={Math.round(w)} height={Math.round(h)} style={{ width: w, height: h, objectFit: "cover" }} draggable={false} />
    </div>
  );
}

/* ───── contact buttons ───── */

export function ContactButtons({ name, phone, email, subject }: { name?: string | null; phone?: string | null; email?: string | null; subject?: string }) {
  const tel = phone ? phone.replace(/[^\d+]/g, "") : "";
  return (
    <div className="flex flex-wrap gap-2.5">
      {tel && (
        <a href={`tel:${tel}`} className="btn btn-ink btn-sm">
          Call {name ? name.split(" ")[0] : ""}
        </a>
      )}
      {tel && (
        <a href={`sms:${tel}`} className="btn btn-line btn-sm">
          Text
        </a>
      )}
      {email && (
        <a href={`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`} className="btn btn-line btn-sm">
          Email
        </a>
      )}
    </div>
  );
}

export function personLine(i: Pick<Inquiry, "name" | "email" | "phone">): string {
  return i.name || i.email || i.phone || "Someone";
}

export const imgOf = img;
