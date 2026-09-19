"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import type { CollectionDef } from "@/lib/studio/types";
import type { Kind } from "@/lib/works";
import { Thumb } from "./ui";
import { ConfirmButton } from "./Controls";
import { useToast } from "./Toast";
import { deleteCollectionAction, moveCollectionAction, saveCollectionAction, type CollectionInput } from "@/app/office/actions";

type Slim = { slug: string; name: string; imageSm: string; iw: number; ih: number; kind: Kind; collections: string[]; hidden: boolean };

export default function CollectionsManager({ collections, works }: { collections: CollectionDef[]; works: Slim[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const router = useRouter();
  const toast = useToast();
  const [busy, start] = useTransition();

  const heroOf = (c: CollectionDef) => works.find((w) => w.slug === c.hero) ?? works.find((w) => w.collections.includes(c.id)) ?? null;

  function move(id: string, dir: "up" | "down") {
    start(async () => {
      const r = await moveCollectionAction(id, dir);
      if (!r.ok) toast(r.error, "error");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      {editing !== "new" ? (
        <button type="button" onClick={() => setEditing("new")} className="btn btn-pink w-full sm:w-max">
          <Plus className="h-4 w-4" /> Add a collection
        </button>
      ) : (
        <CollectionForm works={works} onClose={() => setEditing(null)} />
      )}

      <div className="o-card o-in-view overflow-hidden">
        {collections.length === 0 && <p className="o-muted p-6">No collections yet.</p>}
        {collections.map((c, i) => {
          const hero = heroOf(c);
          const n = works.filter((w) => w.collections.includes(c.id)).length;
          const open = editing === c.id;
          return (
            <div key={c.id} className="border-b border-[var(--o-hair)] last:border-0">
              <div className="o-row flex-wrap sm:flex-nowrap">
                {hero ? <Thumb work={hero} size={64} /> : <div className="o-thumb h-16 w-16" />}
                <div className="min-w-0 flex-1 basis-[calc(100%-5rem)] sm:basis-auto">
                  <p className="truncate text-[1.1rem] font-semibold leading-tight">{c.name}</p>
                  <p className="truncate text-[0.88rem] text-[var(--o-soft)]">
                    {c.kicker ? `${c.kicker} · ` : ""}
                    <Link href={`/office/artwork?f=c:${c.id}`} className="underline-offset-4 hover:underline">
                      {n} piece{n === 1 ? "" : "s"}
                    </Link>
                  </p>
                </div>
                <div className="flex w-full shrink-0 items-center justify-end gap-1 sm:w-auto">
                  <button type="button" disabled={busy || i === 0} onClick={() => move(c.id, "up")} className="grid h-11 w-11 place-items-center rounded-full hover:bg-[var(--o-hair)] disabled:opacity-30" aria-label="Move up">
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  <button type="button" disabled={busy || i === collections.length - 1} onClick={() => move(c.id, "down")} className="grid h-11 w-11 place-items-center rounded-full hover:bg-[var(--o-hair)] disabled:opacity-30" aria-label="Move down">
                    <ArrowDown className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => setEditing(open ? null : c.id)} className="btn btn-line btn-sm ml-1">
                    <Pencil className="h-3.5 w-3.5" /> {open ? "Close" : "Edit"}
                  </button>
                </div>
              </div>
              {open && (
                <div className="bg-[var(--o-paper)] px-4 pb-5 pt-2 sm:px-6">
                  <CollectionForm collection={c} works={works} onClose={() => setEditing(null)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[0.88rem] text-[var(--o-faint)]">The order here is the order on the website. Removing a collection never removes its pieces; they simply stop wearing that label.</p>
    </div>
  );
}

function CollectionForm({ collection: c, works, onClose }: { collection?: CollectionDef; works: Slim[]; onClose: () => void }) {
  const [f, setF] = useState<CollectionInput>({ id: c?.id, name: c?.name ?? "", kicker: c?.kicker ?? "", blurb: c?.blurb ?? "", hero: c?.hero ?? null });
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const candidates = c ? [...works.filter((w) => w.collections.includes(c.id)), ...works.filter((w) => !w.collections.includes(c.id))] : works;

  return (
    <form
      className={`grid gap-4 ${c ? "" : "o-card o-in-view p-5 sm:p-7"}`}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveCollectionAction(f);
          if (r.ok) {
            toast(c ? "Saved. The website is updated." : "Collection added. It is in the website's menu now.");
            onClose();
            router.refresh();
          } else toast(r.error, "error");
        });
      }}
    >
      {!c && <h2 className="o-h2">A new collection</h2>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="o-field">
          <span>Name</span>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="o-in" placeholder="Golden Hour" required />
        </label>
        <label className="o-field">
          <span>Short line above the name</span>
          <input value={f.kicker} onChange={(e) => setF({ ...f, kicker: e.target.value })} className="o-in" placeholder="New for 2027" />
        </label>
      </div>
      <label className="o-field">
        <span>A sentence or two about it</span>
        <textarea value={f.blurb} onChange={(e) => setF({ ...f, blurb: e.target.value })} rows={3} className="o-in" placeholder="What ties these paintings together, in your words." />
      </label>
      <label className="o-field">
        <span>The piece that represents it</span>
        <select value={f.hero ?? ""} onChange={(e) => setF({ ...f, hero: e.target.value || null })} className="o-in">
          <option value="">Pick one (or the first piece in it is used)</option>
          {candidates.map((w) => (
            <option key={w.slug} value={w.slug}>
              {w.name}
              {c && w.collections.includes(c.id) ? "" : " (not in this collection)"}
            </option>
          ))}
        </select>
        <span className="o-help">This is the picture shown in the menu and on the Collections page.</span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy || !f.name.trim()} className="btn btn-ink">
          {busy ? "Saving…" : c ? "Save" : "Add it"}
        </button>
        <button type="button" onClick={onClose} className="btn btn-line">
          Cancel
        </button>
        {c && (
          <div className="sm:ml-auto">
            <ConfirmButton label="Remove this collection" question={`Remove the “${c.name}” collection? Its pieces stay in the shop.`} action={deleteCollectionAction} args={[c.id]} />
          </div>
        )}
      </div>
    </form>
  );
}
