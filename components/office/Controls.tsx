"use client";
// The small interactive bits detail pages share: a two-step delete, an action
// button, a notes box, a status stepper. Server pages pass the server action
// and its arguments (functions cannot cross the server/client line as
// closures); each control calls it and reports back through the toast.
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useToast } from "./Toast";
import type { Result } from "@/app/office/actions";
import { ORDER_STATUS, type OrderStatus } from "@/lib/studio/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action<R extends Result = Result> = (...args: any[]) => Promise<R>;

export function ConfirmButton({ label, question, confirmLabel = "Yes, remove it", action, args, afterHref, children }: { label: string; question: string; confirmLabel?: string; action: Action; args: unknown[]; afterHref?: string; children?: ReactNode }) {
  const [arm, setArm] = useState(false);
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  if (!arm)
    return (
      <button type="button" onClick={() => setArm(true)} className="btn btn-danger btn-sm">
        {children ?? label}
      </button>
    );
  return (
    <div className="o-card-soft flex flex-wrap items-center gap-3 p-4">
      <p className="flex-1 text-[0.98rem] font-semibold">{question}</p>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          start(async () => {
            const r = await action(...args);
            if (r.ok) {
              toast("Removed.");
              if (afterHref) router.push(afterHref);
              else router.refresh();
            } else toast(r.error, "error");
          })
        }
        className="btn btn-sm bg-[var(--o-red)] text-white"
      >
        {busy ? "Removing…" : confirmLabel}
      </button>
      <button type="button" onClick={() => setArm(false)} className="btn btn-line btn-sm">
        Keep it
      </button>
    </div>
  );
}

export function ActionButton({ className = "btn btn-ink", done, action, args, children }: { className?: string; done?: string; action: Action; args: unknown[]; children: ReactNode }) {
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={busy}
      className={className}
      onClick={() =>
        start(async () => {
          const r = await action(...args);
          if (r.ok) {
            if (done) toast(done);
            router.refresh();
          } else toast(r.error, "error");
        })
      }
    >
      {busy ? "One moment…" : children}
    </button>
  );
}

export function NotesBox({ initial, action, id, placeholder = "Anything you want to remember about this. Only you see it." }: { initial: string | null; action: Action; id: string; placeholder?: string }) {
  const [v, setV] = useState(initial ?? "");
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const dirty = v !== (initial ?? "");
  return (
    <div className="grid gap-3">
      <textarea value={v} onChange={(e) => setV(e.target.value)} rows={3} className="o-in" placeholder={placeholder} />
      {dirty && (
        <button
          type="button"
          disabled={busy}
          className="btn btn-ink btn-sm w-max"
          onClick={() =>
            start(async () => {
              const r = await action(id, v);
              if (r.ok) {
                toast("Note saved.");
                router.refresh();
              } else toast(r.error, "error");
            })
          }
        >
          {busy ? "Saving…" : "Save note"}
        </button>
      )}
    </div>
  );
}

export function OrderStatusStepper({ current, action, id }: { current: OrderStatus; action: Action; id: string }) {
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const idx = ORDER_STATUS.findIndex((s) => s.key === current);
  return (
    <div className="grid gap-2">
      {ORDER_STATUS.filter((s) => s.key !== "refunded" || current === "refunded").map((s, i) => {
        const on = s.key === current;
        const past = i < idx && current !== "cancelled" && current !== "refunded";
        return (
          <button
            key={s.key}
            type="button"
            disabled={busy || on || s.key === "refunded"}
            onClick={() =>
              start(async () => {
                const r = await action(id, s.key);
                if (r.ok) {
                  toast(`Marked as ${s.label.toLowerCase()}.`);
                  router.refresh();
                } else toast(r.error, "error");
              })
            }
            className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
              on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-hair-2)] bg-[var(--o-paper)] hover:border-[var(--o-ink)]"
            } ${s.key === "cancelled" && !on ? "opacity-70" : ""}`}
          >
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${on ? "border-white/40 bg-white/15" : past ? "border-[var(--o-green)] bg-[var(--o-green)] text-white" : "border-[var(--o-hair-2)]"}`}>
              {past || on ? <Check className="h-4 w-4" /> : <span className="text-[0.8rem] font-bold">{i + 1}</span>}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{s.label}</span>
              <span className={`block text-[0.86rem] ${on ? "text-white/70" : "text-[var(--o-faint)]"}`}>{s.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
