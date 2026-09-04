"use client";
import { useState } from "react";

export default function Newsletter({ dark = false }: { dark?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [email, setEmail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("sending");
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formType: "newsletter", email }) });
      setState(r.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done")
    return <p className={`mt-6 text-sm ${dark ? "text-gold-2" : "text-ink"}`}>Thank you. You are on the list for new work and studio events.</p>;

  return (
    <form onSubmit={submit} className="mt-6">
      <label htmlFor={`nl-${dark ? "d" : "l"}`} className={`label ${dark ? "text-white/60" : "text-muted"}`}>
        New work, first
      </label>
      <div className={`mt-2 flex overflow-hidden rounded-full border ${dark ? "border-white/25 bg-white/5" : "border-ink/15 bg-white"}`}>
        <input
          id={`nl-${dark ? "d" : "l"}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={`h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none ${dark ? "text-white placeholder:text-white/40" : "text-ink placeholder:text-ink/40"}`}
        />
        <button type="submit" disabled={state === "sending"} className={`px-4 text-sm font-semibold ${dark ? "text-gold-2" : "text-hibiscus"}`}>
          {state === "sending" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-coral">Something went wrong. Email {"Carol@carolcalicchioart.com"} instead.</p>}
    </form>
  );
}
