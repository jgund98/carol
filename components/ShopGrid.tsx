"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Work, Collection } from "@/lib/works";
import WorkCard from "./WorkCard";
import { collections } from "@/lib/content";

type Filter = "all" | Collection | "available";
type Sort = "featured" | "price-desc" | "price-asc" | "size" | "name";

export default function ShopGrid({ works }: { works: Work[] }) {
  const sp = useSearchParams();
  const initial = (sp.get("c") as Filter) || "all";
  const [filter, setFilter] = useState<Filter>(initial);
  const [sort, setSort] = useState<Sort>("featured");

  const list = useMemo(() => {
    let l = works;
    if (filter === "available") l = l.filter((w) => w.available && !w.sold);
    else if (filter !== "all") l = l.filter((w) => w.collections.includes(filter));
    const area = (w: Work) => (w.width && w.height ? w.width * w.height : 0);
    if (sort === "price-desc") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "price-asc") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "size") l = [...l].sort((a, b) => area(b) - area(a));
    if (sort === "name") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [works, filter, sort]);

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "Everything" },
    { key: "available", label: "Available now" },
    ...collections.map((c) => ({ key: c.key as Filter, label: c.name })),
  ];

  return (
    <div>
      <div className="sticky top-[var(--header-h)] z-40 -mx-[clamp(1.1rem,4vw,3.5rem)] bg-gallery/90 px-[clamp(1.1rem,4vw,3.5rem)] py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Desktop: chips */}
          <div className="rail rail-fade hidden flex-1 gap-2 pr-10 md:flex">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                className={`h-10 shrink-0 snap-start rounded-full px-4 text-xs font-semibold transition-colors ${filter === c.key ? "bg-ink text-white" : "bg-ink/5 text-ink hover:bg-ink/10"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {/* Phones: two dropdowns */}
          <label className="relative flex-1 md:hidden">
            <span className="sr-only">Category</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="h-11 w-full appearance-none rounded-full border border-ink/15 bg-white pl-4 pr-9 text-sm font-semibold text-ink">
              {chips.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <Chevron />
          </label>
          <label className="relative shrink-0">
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 appearance-none rounded-full border border-ink/15 bg-white pl-4 pr-9 text-sm font-semibold text-ink md:h-10 md:text-xs">
              <option value="featured">Sort: Featured</option>
              <option value="price-desc">Price, high to low</option>
              <option value="price-asc">Price, low to high</option>
              <option value="size">Largest first</option>
              <option value="name">A to Z</option>
            </select>
            <Chevron />
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        {list.length} piece{list.length === 1 ? "" : "s"}
      </p>
      <div className="mt-6 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((w, i) => (
          <WorkCard key={w.slug} work={w} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
