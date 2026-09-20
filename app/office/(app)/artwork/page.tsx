// Artwork: everything in the shop, as cards you can tap to edit.
import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { listAllWorks, listCollections } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { dims, shopOrder } from "@/lib/catalog";
import { Empty, PageHead } from "@/components/office/ui";
import ArtworkGrid from "@/components/office/ArtworkGrid";
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
        text="Tap any piece to change its photo, price, size, words or collections. Use Select to hide or mark several at once. New pieces go to the top of the shop."
        action={
          <span className="hidden sm:block">
            <Link href="/office/artwork/new" className="btn btn-pink">
              <Plus className="h-4 w-4" /> Add a new piece
            </Link>
          </span>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <ArtworkSearch initial={q} filter={f} />
        </div>
        <Link href="/office/collections" className="btn btn-line btn-sm mb-3 shrink-0 sm:mb-4">
          <Layers className="h-4 w-4" /> Collections
        </Link>
      </div>

      <nav className="rail -mx-4 mb-4 flex gap-2 px-4 sm:mx-0 sm:mb-6 sm:flex-wrap sm:px-0" aria-label="Filter">
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
        <ArtworkGrid list={list.map((w) => ({ slug: w.slug, name: w.name, price: w.price, sold: w.sold, hidden: w.hidden, available: w.available, stock: w.stock ?? null, kind: w.kind, iw: w.iw, ih: w.ih, imageSm: w.imageSm, medium: w.medium, line: dims(w) ?? w.medium ?? w.kind }))} />
      )}

    </>
  );
}
