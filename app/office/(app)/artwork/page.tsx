// Artwork: everything in the shop, as cards you can tap to edit.
import Link from "next/link";
import { Plus } from "lucide-react";
import { listAllWorks, listCollections } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { dims, shopOrder } from "@/lib/catalog";
import { Empty, PageHead, WorkStatusChip } from "@/components/office/ui";
import ArtworkSearch from "@/components/office/ArtworkSearch";

export default async function ArtworkPage({ searchParams }: { searchParams: Promise<{ f?: string; q?: string }> }) {
  const { f = "all", q = "" } = await searchParams;
  const [works, collections] = await Promise.all([listAllWorks(), listCollections()]);
  const needle = q.trim().toLowerCase();
  const list = shopOrder(works, collections).filter((w) => {
    if (needle && !`${w.name} ${w.medium ?? ""} ${w.description}`.toLowerCase().includes(needle)) return false;
    if (f === "sale") return !w.hidden && !w.sold && w.available;
    if (f === "sold") return w.sold;
    if (f === "hidden") return w.hidden;
    if (f === "hold") return !w.available && !w.sold && !w.hidden;
    if (f.startsWith("c:")) return w.collections.includes(f.slice(2));
    return true;
  });
  const filters = [
    { key: "all", label: `Everything · ${works.length}` },
    { key: "sale", label: `For sale · ${works.filter((w) => !w.hidden && !w.sold && w.available).length}` },
    { key: "sold", label: `Sold · ${works.filter((w) => w.sold).length}` },
    { key: "hidden", label: `Hidden · ${works.filter((w) => w.hidden).length}` },
    ...collections.map((c) => ({ key: `c:${c.id}`, label: c.name })),
  ];
  const href = (key: string) => `/office/artwork?${new URLSearchParams({ ...(key !== "all" ? { f: key } : {}), ...(q ? { q } : {}) })}`.replace(/\?$/, "");

  return (
    <>
      <PageHead
        kicker="Your shop"
        title={`${works.length} pieces.`}
        text="Tap any piece to change its photo, price, size, words or collections, or to mark it sold. New pieces go to the top of the shop."
        action={
          <Link href="/office/artwork/new" className="btn btn-pink w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Add a new piece
          </Link>
        }
      />

      <ArtworkSearch initial={q} filter={f} />

      <nav className="rail -mx-5 mb-6 flex gap-2 px-5 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter">
        {filters.map((x) => (
          <Link key={x.key} href={href(x.key)} className="o-choice shrink-0" data-on={f === x.key}>
            {x.label}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <Empty
          title={needle ? `Nothing called “${q}”.` : "Nothing here yet."}
          text={needle ? "Check the spelling, or clear the search." : "Add your first piece and it will appear on the website right away."}
          action={
            <Link href="/office/artwork/new" className="btn btn-pink">
              <Plus className="h-4 w-4" /> Add a new piece
            </Link>
          }
        />
      ) : (
        <div className="o-in-view grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {list.map((w) => {
            const a = w.iw / w.ih;
            const board = w.kind === "surfboard";
            const widthPct = board ? 100 : a >= 0.8 ? 84 : 105 * a;
            return (
              <Link key={w.slug} href={`/office/artwork/${w.slug}`} className="o-card group overflow-hidden transition-transform hover:-translate-y-0.5">
                <div className="o-thumb relative flex aspect-[4/5] w-full items-center justify-center rounded-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.imageSm} alt={w.name} className="object-cover" style={board ? { width: "100%", height: "100%" } : { width: `${widthPct}%`, aspectRatio: `${w.iw} / ${w.ih}` }} loading="lazy" />
                  <span className="absolute left-3 top-3">
                    <WorkStatusChip work={w} />
                  </span>
                </div>
                <div className="p-3.5 sm:p-4">
                  <p className="truncate text-[1rem] font-semibold leading-tight sm:text-[1.05rem]">{w.name}</p>
                  <p className="mt-1 truncate text-[0.82rem] text-[var(--o-soft)]">{dims(w) ?? w.medium ?? w.kind}</p>
                  <p className="o-num mt-2 text-[1.15rem]">{w.sold ? "Sold" : money(w.price)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link href="/office/artwork/new" className="fixed bottom-[calc(var(--o-tab-h)+env(safe-area-inset-bottom)+1rem)] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[var(--o-pink)] text-white shadow-[0_16px_40px_-12px_rgba(232,57,127,0.7)] lg:hidden" aria-label="Add a new piece">
        <Plus className="h-6 w-6" />
      </Link>
    </>
  );
}
