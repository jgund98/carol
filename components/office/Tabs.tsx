"use client";
// Three or four plain tabs across the full width, with counts. No scrolling
// rails: what she can tap is always all on screen.
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Tabs({ tabs, current }: { tabs: { key: string; label: string; count?: number; href: string }[]; current: string }) {
  return (
    <nav className="mb-4 grid gap-1 rounded-full bg-[rgba(18,23,43,0.06)] p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }} aria-label="Filter">
      {tabs.map((t) => {
        const on = t.key === current;
        return (
          <Link key={t.key} href={t.href} className={`flex min-h-[2.6rem] items-center justify-center gap-1.5 rounded-full px-2 text-[0.92rem] font-semibold transition-colors ${on ? "bg-[var(--o-ink)] text-white shadow-[0_6px_16px_-8px_rgba(18,23,43,0.5)]" : "text-[var(--o-soft)] hover:text-[var(--o-ink)]"}`} aria-current={on ? "page" : undefined}>
            {t.label}
            {typeof t.count === "number" && t.count > 0 && <span className={`rounded-full px-1.5 text-[0.72rem] font-bold ${on ? "bg-white/20 text-white" : "bg-[rgba(18,23,43,0.08)] text-[var(--o-ink)]"}`}>{t.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** A plain dropdown for a secondary filter; changes the URL, nothing else to learn. */
export function SelectFilter({ value, options, base, param, label }: { value: string; options: { key: string; label: string }[]; base: string; param: string; label: string }) {
  const router = useRouter();
  return (
    <label className="inline-flex items-center gap-2 text-[0.88rem] text-[var(--o-soft)]">
      {label}
      <select
        value={value}
        onChange={(e) => {
          const url = new URL(base, window.location.origin);
          if (e.target.value !== "all") url.searchParams.set(param, e.target.value);
          router.push(url.pathname + url.search);
        }}
        className="o-in !min-h-[2.4rem] !w-auto !py-1 !pl-3 !pr-9 !text-[0.9rem]"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
