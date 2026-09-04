"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Work, Collection } from "@/lib/works";
import WorkCard from "./WorkCard";
import { collections } from "@/lib/content";

type Filter = "all" | Collection | "available";
type Sort = "featured" | "price-desc" | "price-asc" | "size";

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
          <div className="rail rail-fade flex flex-1 gap-2 pr-10">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                className={`h-9 shrink-0 snap-start rounded-full px-4 text-xs font-semibold transition-colors ${filter === c.key ? "bg-ink text-white" : "bg-ink/5 text-ink hover:bg-ink/10"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="hidden shrink-0 items-center gap-2 text-xs font-semibold text-muted sm:flex">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 rounded-full border border-ink/15 bg-white px-3 text-xs font-semibold text-ink">
              <option value="featured">Featured</option>
              <option value="price-desc">Price, high to low</option>
              <option value="price-asc">Price, low to high</option>
              <option value="size">Largest first</option>
            </select>
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
