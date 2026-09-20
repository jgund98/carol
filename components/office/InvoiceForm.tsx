"use client";
// Write an invoice: who, what, how much. Saves as a draft; sending is the next screen.
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createInvoiceAction, type InvoiceInput } from "@/app/office/actions";
import { fmtMoney } from "@/lib/studio/invoice-shared";
import { useToast } from "./Toast";

type Row = { description: string; amount: string };

export default function InvoiceForm({ initial }: { initial?: Partial<InvoiceInput> & { rows?: Row[] } }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [due, setDue] = useState(initial?.dueDate ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [rows, setRows] = useState<Row[]>(initial?.rows?.length ? initial.rows : [{ description: "", amount: "" }]);
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const cents = (s: string) => Math.round((parseFloat(s.replace(/[^\d.]/g, "")) || 0) * 100);
  const total = rows.reduce((n, r) => n + cents(r.amount), 0);
  const phoneDigits = phone.replace(/D/g, "");
  const phoneShort = phone.trim() !== "" && phoneDigits.length < 10;
  const hasLine = rows.some((r) => r.description.trim() && cents(r.amount) > 0);
  const missing = !name.trim() ? "Add their name." : !(email.trim() || phone.trim()) ? "Add an email or a mobile number so it can be sent." : phoneShort ? "That mobile number is too short. It needs 10 digits." : !hasLine ? "Add what the invoice is for and the amount, below." : "";
  const ready = !missing;
  const linesRef = useRef<HTMLElement>(null);

  return (
    <form
      className="grid gap-3 sm:gap-5 lg:grid-cols-[1.25fr_0.85fr] lg:items-start"
      onSubmit={(e) => {
        e.preventDefault();
        if (missing) {
          toast(missing, "error");
          if (!hasLine && name.trim()) linesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        start(async () => {
          const r = await createInvoiceAction({
            name,
            email,
            phone,
            dueDate: due || null,
            note,
            orderId: initial?.orderId ?? null,
            items: rows.filter((x) => x.description.trim() && cents(x.amount) > 0).map((x) => ({ description: x.description.trim(), cents: cents(x.amount) })),
          });
          if (r.ok) {
            toast(r.sent.length ? `Invoice ${r.sent.join(" and ")} to ${name.trim().split(/\s+/)[0]}.` : "Invoice saved. It could not be sent automatically, use the buttons on the next screen.");
            router.push(`/office/invoices/${r.id}${r.sent.length ? `?sent=${r.sent.join(",")}` : ""}`);
          } else toast(r.error, "error");
        });
      }}
    >
      <div className="grid gap-3 sm:gap-5">
        <section className="o-card p-4 sm:p-7">
          <h2 className="o-h2 mb-4">Who it is for</h2>
          <div className="grid gap-4">
            <label className="o-field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="o-in" placeholder="Susan Bellamy" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="o-field">
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="o-in" placeholder="susan@example.com" />
              </label>
              <label className="o-field">
                <span>Mobile · for a text</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="o-in" placeholder="561-555-0199" />
              </label>
            </div>
          </div>
        </section>

        <section ref={linesRef} className="o-card scroll-mt-24 p-4 sm:p-7">
          <h2 className="o-h2 mb-4">What it is for</h2>
          <div className="grid gap-3">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_7.5rem_2.5rem] items-center gap-2">
                <input value={r.description} onChange={(e) => setRow(i, { description: e.target.value })} className="o-in" placeholder={i === 0 ? "Celestial Moonlight, 60 × 48 in." : "Delivery and installation"} />
                <div className="o-money">
                  <input value={r.amount} onChange={(e) => setRow(i, { amount: e.target.value })} inputMode="decimal" className="o-in !min-h-[3.1rem] !text-[1.15rem]" placeholder="0" />
                </div>
                <button type="button" onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, k) => k !== i) : rs))} className="grid h-10 w-10 place-items-center rounded-full text-[var(--o-faint)] hover:bg-[var(--o-hair)]" aria-label="Remove line">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setRows((rs) => [...rs, { description: "", amount: "" }])} className="btn btn-line btn-sm w-max">
              <Plus className="h-4 w-4" /> Add a line
            </button>
          </div>
          <div className="mt-5 flex items-baseline justify-between border-t border-[var(--o-hair)] pt-4">
            <span className="text-[var(--o-soft)]">Total</span>
            <span className="o-num text-[2rem]">{fmtMoney(total)}</span>
          </div>
        </section>

        <section className="o-card p-4 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="o-field">
              <span>Due · optional</span>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="o-in" />
            </label>
          </div>
          <label className="o-field mt-4">
            <span>A note on the invoice · optional</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="o-in" placeholder="Thank you, Susan. Delivery is included." />
          </label>
        </section>
        <div className="h-20 lg:hidden" />
      </div>

      <aside className="hidden lg:sticky lg:top-12 lg:block">
        <div className="o-card p-5">
          <button type="submit" disabled={busy} className={`btn btn-pink w-full ${ready ? "" : "opacity-70"}`}>
            {busy ? "Sending…" : "Save and send"}
          </button>
          {!ready && <p className="o-muted mt-2 text-center text-[0.9rem]">{missing}</p>}
        </div>
      </aside>
      <div className="fixed inset-x-0 bottom-[calc(var(--o-tab-h)+env(safe-area-inset-bottom))] z-50 border-t border-[var(--o-hair)] bg-[rgba(251,249,245,0.94)] px-4 py-3 backdrop-blur-xl lg:hidden">
        {!ready && <p className="o-muted mb-2 text-center text-[0.88rem]">{missing}</p>}
        <button type="submit" disabled={busy} className={`btn btn-pink w-full ${ready ? "" : "opacity-70"}`}>
          {busy ? "Sending…" : "Save and send"}
        </button>
      </div>
    </form>
  );
}
