"use client";
import { useState } from "react";
import Image from "next/image";
import { site } from "@/lib/site";

type Field = { name: string; label: string; type?: string; required?: boolean; placeholder?: string; textarea?: boolean; half?: boolean; default?: string };

/**
 * The studio's form language: a sheet of paper, hand-set italic labels, one ink line per answer,
 * and Carol's signature at the bottom. No boxes.
 */
export default function LeadForm({
  formType,
  subject,
  fields,
  submitLabel = "Send",
  extra = {},
  success,
  dark = false,
  note = "Carol reads every note herself and replies personally.",
}: {
  formType: string;
  subject?: string;
  fields: Field[];
  submitLabel?: string;
  extra?: Record<string, string>;
  success: { title: string; text: string };
  dark?: boolean;
  note?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [t0] = useState(() => Date.now());

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("_honey")) return;
    if (Date.now() - t0 < 2500) return;
    setState("sending");
    const body: Record<string, unknown> = { formType, subject, fields: { ...extra } };
    for (const f of fields) {
      const v = String(fd.get(f.name) || "");
      if (["name", "email", "phone", "message", "company"].includes(f.name)) body[f.name] = v;
      else (body.fields as Record<string, string>)[f.label] = v;
    }
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setState(r.ok ? "done" : "error");
      if (r.ok) document.getElementById("form-success")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      setState("error");
    }
  }

  const ink = dark ? "text-white" : "text-ink";
  const soft = dark ? "text-white/60" : "text-ink/55";

  if (state === "done")
    return (
      <div id="form-success" className="py-10 text-center">
        <Image src={dark ? "/brand/sig-white.png" : "/brand/sig-ink.png"} alt="" aria-hidden width={220} height={70} className="mx-auto h-auto w-[180px] opacity-90" />
        <p className={`display mt-6 text-3xl ${ink}`}>{success.title}</p>
        <p className={`pretty mx-auto mt-3 max-w-md ${soft}`}>{success.text}</p>
        <a href={site.phoneHref} className={`btn mt-6 ${dark ? "btn-white" : "btn-ink"}`}>
          Or call {site.phone}
        </a>
      </div>
    );

  return (
    <form onSubmit={submit} className={`sheet grid gap-x-10 gap-y-7 sm:grid-cols-2 ${dark ? "sheet-dark" : ""}`}>
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {fields.map((f) => (
        <label key={f.name} className={`block ${f.half ? "" : "sm:col-span-2"}`}>
          <span className={`display-light block text-[1.05rem] italic ${soft}`}>
            {f.label}
            {f.required ? "" : <span className="not-italic text-[0.72rem]"> · optional</span>}
          </span>
          {f.textarea ? (
            <textarea name={f.name} required={f.required} placeholder={f.placeholder} rows={3} className={`line resize-none ${ink}`} defaultValue={f.default} />
          ) : (
            <input
              name={f.name}
              type={f.type || "text"}
              required={f.required}
              placeholder={f.placeholder}
              className={`line ${ink}`}
              defaultValue={f.default}
              autoComplete={f.name === "email" ? "email" : f.name === "phone" ? "tel" : f.name === "name" ? "name" : undefined}
            />
          )}
        </label>
      ))}
      <div className="sm:col-span-2 mt-2 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button type="submit" disabled={state === "sending"} className={`btn ${dark ? "btn-white" : "btn-ink"}`}>
            {state === "sending" ? "Sending…" : submitLabel}
          </button>
          <span className={`max-w-[16rem] text-xs leading-snug ${soft}`}>{note}</span>
        </div>
        <Image src={dark ? "/brand/sig-white.png" : "/brand/sig-ink.png"} alt="Carol Calicchio" width={200} height={63} className="h-auto w-[150px] opacity-80" />
      </div>
      {state === "error" && (
        <p className="sm:col-span-2 text-sm text-coral">
          That did not go through. Email <a className="underline" href={`mailto:${site.email}`}>{site.email}</a> or call {site.phone}.
        </p>
      )}
    </form>
  );
}
