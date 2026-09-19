import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiry, getWorkBySlug } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { dims } from "@/lib/catalog";
import { ContactButtons, KindChip, PageHead, Thumb, fullDate, personLine } from "@/components/office/ui";
import { ActionButton, NotesBox } from "@/components/office/Controls";
import { saveInquiryNotesAction, setInquiryStatusAction } from "@/app/office/actions";

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = await getInquiry(id);
  if (!i) notFound();
  const work = i.workSlug ? await getWorkBySlug(i.workSlug) : null;
  const extra = Object.entries(i.fields).filter(([k]) => k !== "Artwork");

  return (
    <>
      <PageHead back={{ href: "/office/inbox", label: "All inquiries" }} kicker={fullDate(i.createdAt)} title={personLine(i)} />

      <div className="grid min-w-0 gap-3 sm:gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="grid min-w-0 gap-3 sm:gap-5">
          <section className="o-card o-in-view p-4 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <KindChip kind={i.kind} />
              {i.status === "new" ? <span className="o-chip o-chip-gold">New</span> : <span className="o-chip o-chip-green">Handled</span>}
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {i.email && (
                <div>
                  <dt className="o-label">Email</dt>
                  <dd className="mt-1 break-all text-[1.02rem] font-semibold">
                    <a href={`mailto:${i.email}`}>{i.email}</a>
                  </dd>
                </div>
              )}
              {i.phone && (
                <div>
                  <dt className="o-label">Phone</dt>
                  <dd className="mt-1 text-[1.02rem] font-semibold">
                    <a href={`tel:${i.phone.replace(/[^\d+]/g, "")}`}>{i.phone}</a>
                  </dd>
                </div>
              )}
              {extra.map(([k, v]) => (
                <div key={k} className={v.length > 60 ? "sm:col-span-2" : ""}>
                  <dt className="o-label">{k}</dt>
                  <dd className="mt-1 whitespace-pre-line text-[1rem]">{v}</dd>
                </div>
              ))}
            </dl>
            {i.message && (
              <blockquote className="mt-6 border-l-2 border-[var(--o-pink)] pl-5">
                <p className="o-label mb-2">Their message</p>
                <p className="whitespace-pre-line text-[1.08rem] leading-[1.65]">{i.message}</p>
              </blockquote>
            )}
            <div className="mt-7">
              <ContactButtons name={i.name} phone={i.phone} email={i.email} subject={`Re: your note to Carol Calicchio Art`} />
            </div>
          </section>

          {work && (
            <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "80ms" }}>
              <p className="o-label mb-3">The piece they asked about</p>
              <div className="flex items-center gap-4">
                <Thumb work={work} size={80} />
                <div className="min-w-0 flex-1">
                  <p className="o-h2">{work.name}</p>
                  <p className="text-[0.9rem] text-[var(--o-soft)]">
                    {[dims(work), work.medium].filter(Boolean).join(" · ")} · {work.sold ? "Sold" : money(work.price)}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href={`/office/artwork/${work.slug}`} className="btn btn-line btn-sm">
                  Edit this piece
                </Link>
                <a href={`/shop/${work.slug}`} target="_blank" rel="noopener" className="btn btn-line btn-sm">
                  See it on the website
                </a>
              </div>
            </section>
          )}
          {i.workSlug && !work && <p className="o-muted text-[0.9rem]">They asked about a piece that has since been removed from the shop ({i.workSlug}).</p>}
        </div>

        <aside className="grid gap-3 sm:gap-5 lg:sticky lg:top-12 lg:self-start">
          <section className="o-card o-in-view p-4 sm:p-6" style={{ animationDelay: "120ms" }}>
            <p className="o-label mb-3">Where this stands</p>
            {i.status === "new" ? (
              <>
                <p className="mb-4 text-[0.98rem]">Once you have replied, mark it handled so it leaves your list.</p>
                <ActionButton className="btn btn-ink w-full" done="Marked as handled." action={setInquiryStatusAction} args={[i.id, "handled"]}>
                  I have handled this
                </ActionButton>
              </>
            ) : (
              <>
                <p className="mb-4 text-[0.98rem] text-[var(--o-soft)]">Handled{i.handledAt ? ` on ${fullDate(i.handledAt)}` : ""}.</p>
                <ActionButton className="btn btn-line w-full" done="Back in your list." action={setInquiryStatusAction} args={[i.id, "new"]}>
                  Put it back in my list
                </ActionButton>
              </>
            )}
          </section>
          <section className="o-card o-in-view p-4 sm:p-6" style={{ animationDelay: "160ms" }}>
            <p className="o-label mb-3">Your notes</p>
            <NotesBox initial={i.notes} action={saveInquiryNotesAction} id={i.id} />
          </section>
        </aside>
      </div>
    </>
  );
}
