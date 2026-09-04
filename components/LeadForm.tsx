"use client";
import { useState } from "react";
import { site } from "@/lib/site";

type Field = { name: string; label: string; type?: string; required?: boolean; placeholder?: string; textarea?: boolean; half?: boolean; default?: string };

export default function LeadForm({
  formType,
  subject,
  fields,
  submitLabel = "Send",
  extra = {},
  success,
  dark = false,
}: {
  formType: string;
  subject?: string;
  fields: Field[];
  submitLabel?: string;
  extra?: Record<string, string>;
  success: { title: string; text: string };
  dark?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [t0] = useState(() => Date.now());

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("_honey")) return; // bot
    if (Date.now() - t0 < 2500) return; // too fast to be a person
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

  if (state === "done")
    return (
      <div id="form-success" className={`rounded-2xl p-8 text-center ${dark ? "bg-white/10 text-white" : "bg-white shadow-sm"}`}>
        <p className="display text-3xl">{success.title}</p>
        <p className={`pretty mx-auto mt-3 max-w-md ${dark ? "text-white/75" : "text-muted"}`}>{success.text}</p>
        <a href={site.phoneHref} className={`btn mt-6 ${dark ? "btn-white" : "btn-ink"}`}>
          Or call {site.phone}
        </a>
      </div>
    );

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {fields.map((f) => (
        <label key={f.name} className={`block ${f.half ? "" : "sm:col-span-2"}`}>
          <span className={`label mb-2 block ${dark ? "text-white/60" : "text-muted"}`}>
            {f.label}
            {f.required ? "" : " · optional"}
          </span>
          {f.textarea ? (
            <textarea name={f.name} required={f.required} placeholder={f.placeholder} rows={4} className="field resize-y" defaultValue={f.default} />
          ) : (
            <input name={f.name} type={f.type || "text"} required={f.required} placeholder={f.placeholder} className="field" defaultValue={f.default} autoComplete={f.name === "email" ? "email" : f.name === "phone" ? "tel" : f.name === "name" ? "name" : undefined} />
          )}
        </label>
      ))}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className={`btn ${dark ? "btn-white" : "btn-pink"}`}>
          {state === "sending" ? "Sending…" : submitLabel}
        </button>
        <span className={`text-xs ${dark ? "text-white/60" : "text-muted"}`}>Carol replies personally. Nothing is shared.</span>
      </div>
      {state === "error" && (
        <p className="sm:col-span-2 text-sm text-coral">
          That did not go through. Email <a className="underline" href={`mailto:${site.email}`}>{site.email}</a> or call {site.phone}.
        </p>
      )}
    </form>
  );
}
