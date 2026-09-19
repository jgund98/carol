"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export default function ArtworkSearch({ initial, filter }: { initial: string; filter: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (filter !== "all") p.set("f", filter);
      if (q.trim()) p.set("q", q.trim());
      const qs = p.toString();
      router.replace(`/office/artwork${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [q, filter, router]);
  return (
    <label className="relative mb-4 block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--o-faint)]" />
      <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Find a piece by name…" className="o-in pl-12 pr-12" />
      {q && (
        <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full hover:bg-[var(--o-hair)]" aria-label="Clear search">
          <X className="h-4 w-4" />
        </button>
      )}
    </label>
  );
}
