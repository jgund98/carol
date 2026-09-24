// Every text message and email subject the studio sends, in one place.
//
// Rules for the texts: professional, one sentence of fact, no fluff. Plain
// GSM-7 characters only and at most 160 of them, so a message is always one
// SMS segment and never falls back to MMS. Links are the site's short paths
// (/o /q /v for Carol's office, /i /t for buyers). Each builder tries a
// full wording first and steps down to a shorter one only if it would not fit.
import { fmtMoney, type StudioInvoice } from "./invoice-shared";
import { calendarDate } from "./time";
import type { InquiryKind, StudioOrder } from "./types";
import { CLASS, classShortDay, classStart, type StudioClass } from "@/lib/classes";

export const SMS_LIMIT = 160;
const STUDIO = "Carol Calicchio Art Studio";
const STOP = "Reply STOP to opt out.";

/* ───────── helpers ───────── */

export const siteHost = () => (process.env.OFFICE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://carol.epicdevsolutions.com").replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Short public link, host only (no https://) so it reads cleanly and stays short. */
export const shortLink = (path: string) => `${siteHost()}${path}`;

const GSM = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXT = "^{}\\[~]|€";
const SWAP: Record<string, string> = { "’": "'", "‘": "'", "‚": "'", "“": '"', "”": '"', "„": '"', "–": "-", "—": "-", "‑": "-", "…": "...", "·": "-", "•": "-", "×": "x", " ": " ", " ": " ", " ": " " };

/** Squeeze any string into the GSM-7 alphabet: smart quotes and dashes become plain, accents are dropped, the rest is removed. */
export function gsm(s: string): string {
  let out = "";
  for (const ch of s) {
    if (SWAP[ch] !== undefined) out += SWAP[ch];
    else if (GSM.includes(ch) || GSM_EXT.includes(ch)) out += ch;
    else {
      const plain = ch.normalize("NFKD").replace(/[̀-ͯ]/g, "");
      out += plain && GSM.includes(plain) ? plain : "";
    }
  }
  return out.replace(/[ \t]{2,}/g, " ").trim();
}

/** Segment length as carriers count it: extension characters cost two. */
export function smsLength(s: string): number {
  let n = 0;
  for (const ch of s) n += GSM_EXT.includes(ch) ? 2 : 1;
  return n;
}

/** First wording that fits one segment. The last option is the fallback and is always used if nothing else fits. */
function fit(...options: string[]): string {
  const clean = options.map(gsm);
  return clean.find((o) => smsLength(o) <= SMS_LIMIT) ?? clean[clean.length - 1];
}

const first = (name: string | null | undefined) => (name || "").trim().split(/\s+/)[0] || "";
const money = (n: number) => fmtMoney(Math.round(n * 100));
const piecesOf = (o: StudioOrder) => (o.items.length === 1 ? o.items[0].name : `${o.items.length} pieces`);
const phoneOf = (p: string | null | undefined) => {
  const d = (p || "").replace(/\D/g, "");
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d.length === 11 && d[0] === "1" ? `${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}` : p || "";
};

/* ───────── to Carol ───────── */

export const carol = {
  /** A piece was bought and paid for on the website. */
  newSale(o: StudioOrder) {
    const link = shortLink(`/o/${o.id}`);
    const who = [o.name, phoneOf(o.phone)].filter(Boolean).join(", ");
    return {
      subject: `New sale: ${piecesOf(o)}, ${money(o.subtotal)} (${o.name})`,
      sms: fit(`New sale: ${piecesOf(o)}, ${money(o.subtotal)}, paid by card. ${who}. ${link}`, `New sale: ${piecesOf(o)}, ${money(o.subtotal)}, paid by card. ${o.name}. ${link}`, `New sale, ${money(o.subtotal)}, paid by card. ${link}`),
    };
  },
  /** Seats at a class were reserved and paid on the website. */
  newBooking(o: StudioOrder, c: StudioClass, qty: number) {
    const link = shortLink(`/o/${o.id}`);
    const who = [o.name, phoneOf(o.phone)].filter(Boolean).join(", ");
    const seats = `${qty} ${qty === 1 ? "seat" : "seats"}`;
    return {
      subject: `Class booking: ${seats} for ${classShortDay(c)}, ${money(o.subtotal)} (${o.name})`,
      sms: fit(`New class booking: ${seats} for ${classShortDay(c)}, ${money(o.subtotal)} paid by card. ${who}. ${link}`, `New class booking: ${seats} for ${classShortDay(c)}, ${money(o.subtotal)}. ${o.name}. ${link}`, `New class booking, ${money(o.subtotal)}. ${link}`),
    };
  },
  /** An invoice was paid by card. */
  invoicePaid(inv: StudioInvoice) {
    const link = shortLink(`/v/${inv.id}`);
    return {
      subject: `Invoice ${inv.number} paid: ${fmtMoney(inv.totalCents)} (${inv.name})`,
      sms: fit(`Invoice ${inv.number} paid by card, ${fmtMoney(inv.totalCents)}. ${inv.name}. ${link}`, `Invoice ${inv.number} paid, ${fmtMoney(inv.totalCents)}. ${link}`),
    };
  },
  /** Any other form on the website. `about` is the artwork title, when the message is about one. */
  inquiry(kind: InquiryKind, id: string, name: string | null | undefined, about?: string | null) {
    const link = shortLink(`/q/${id}`);
    const who = (name || "").trim() || "a visitor";
    const what = kind === "inquiry" ? "artwork inquiry" : kind === "commission" ? "commission request" : kind === "visit" ? "studio visit request" : "message";
    const head = `New ${what} from ${who}`;
    return {
      subject: about ? `${head} about ${about}` : head,
      sms: fit(about ? `${head} about ${about}. ${link}` : `${head}. ${link}`, `${head}. ${link}`, `New ${what}. ${link}`),
    };
  },
  newsletter(email: string) {
    return { subject: `New mailing list signup: ${email}`, sms: "" };
  },
};

/* ───────── to buyers ───────── */

export const buyer = {
  receipt(o: StudioOrder) {
    const p = piecesOf(o);
    const amt = money(o.subtotal);
    return {
      subject: `Receipt ${o.ref}: ${amt}, ${p}`,
      sms: fit(`${STUDIO}: thank you, your payment of ${amt} for ${p} is received. Carol will call you to arrange delivery. ${STOP}`, `${STUDIO}: thank you, your payment of ${amt} is received. Carol will call you to arrange delivery. ${STOP}`),
    };
  },
  classConfirmed(o: StudioOrder, c: StudioClass, qty: number) {
    const seats = `${qty} ${qty === 1 ? "seat" : "seats"}`;
    const when = `${classShortDay(c)}, ${classStart(c)}`;
    return {
      subject: `You're in: ${c.title}, ${classShortDay(c)}`,
      sms: fit(`${STUDIO}: you're booked! ${c.title}, ${when}, ${CLASS.venue.short}. ${seats}. ${STOP}`, `${STUDIO}: you're booked! ${c.title}, ${when}, ${CLASS.venue.short}. ${seats}.`, `${STUDIO}: you're booked for ${when}. ${seats}. Details by email.`),
    };
  },
  shipped(o: StudioOrder, hasTrackingLink: boolean) {
    const p = piecesOf(o);
    const via = o.carrier ? ` via ${o.carrier}` : "";
    const track = hasTrackingLink ? ` Track: ${shortLink(`/t/${o.id}`)}` : "";
    return {
      subject: `${p} is on its way`,
      sms: fit(`${STUDIO}: ${p} has shipped${via}. Tracking ${o.tracking}.${track}`, `${STUDIO}: your piece has shipped${via}. Tracking ${o.tracking}.${track}`, `${STUDIO}: your piece has shipped${via}. Tracking ${o.tracking}.`),
    };
  },
  invoiceSent(inv: StudioInvoice) {
    const link = shortLink(`/i/${inv.id}`);
    return {
      subject: `Invoice ${inv.number} from ${STUDIO}: ${fmtMoney(inv.totalCents)}`,
      sms: fit(`${STUDIO}: invoice ${inv.number} for ${fmtMoney(inv.totalCents)} is ready. View and pay: ${link} ${STOP}`, `${STUDIO}: invoice ${inv.number} for ${fmtMoney(inv.totalCents)}. View and pay: ${link}`),
    };
  },
  invoicePaid(inv: StudioInvoice) {
    const link = shortLink(`/i/${inv.id}`);
    return {
      subject: `Receipt for invoice ${inv.number}: ${fmtMoney(inv.totalCents)} paid`,
      sms: fit(`${STUDIO}: payment of ${fmtMoney(inv.totalCents)} received for invoice ${inv.number}, thank you. Receipt: ${link}`, `${STUDIO}: payment of ${fmtMoney(inv.totalCents)} received, thank you. Receipt: ${link}`),
    };
  },
  invoiceReminder(inv: StudioInvoice) {
    const link = shortLink(`/i/${inv.id}`);
    const due = inv.dueDate ? calendarDate(inv.dueDate).replace(/,\s*\d{4}$/, "") : null;
    const when = due ? `was due ${due}` : "is still open";
    return {
      subject: `Reminder: invoice ${inv.number} (${fmtMoney(inv.totalCents)}) ${due ? `was due ${due}` : "is open"}`,
      sms: fit(`${STUDIO}: a reminder that invoice ${inv.number} for ${fmtMoney(inv.totalCents)} ${when}. View and pay: ${link}`, `${STUDIO}: invoice ${inv.number} (${fmtMoney(inv.totalCents)}) ${when}. Pay: ${link}`),
    };
  },
};
