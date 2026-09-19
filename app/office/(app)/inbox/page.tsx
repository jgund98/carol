// Inquiries: every message the website has sent, newest first.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listInquiries } from "@/lib/studio/store";
import { INQUIRY_KINDS, type InquiryKind } from "@/lib/studio/types";
import { Empty, KindChip, NewDot, PageHead, timeAgo, personLine } from "@/components/office/ui";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "new", label: "New" },
  { key: "inquiry", label: INQUIRY_KINDS.inquiry.plural },
  { key: "commission", label: INQUIRY_KINDS.commission.plural },
  { key: "visit", label: INQUIRY_KINDS.visit.plural },
  { key: "contact", label: INQUIRY_KINDS.contact.plural },
  { key: "newsletter", label: INQUIRY_KINDS.newsletter.plural },
  { key: "handled", label: "Handled" },
];

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "all" } = await searchParams;
  const all = await listInquiries();
  const list = all.filter((i) => (f === "all" ? true : f === "new" || f === "handled" ? i.status === f : i.kind === (f as InquiryKind)));
  const newCount = all.filter((i) => i.status === "new").length;

  return (
    <>
      <PageHead kicker="Inquiries" title={newCount ? `${newCount} waiting for a reply.` : "Everything people have sent you."} text="Messages, artwork questions, commission requests and studio-visit requests from the website. Tap one to see everything they wrote and to call, text or email them back." />

      <nav className="rail -mx-5 mb-5 flex gap-2 px-5 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter">
        {FILTERS.map((x) => (
          <Link key={x.key} href={x.key === "all" ? "/office/inbox" : `/office/inbox?f=${x.key}`} className="o-choice shrink-0" data-on={f === x.key}>
            {x.label}
            {x.key === "new" && newCount > 0 && <span className="rounded-full bg-[var(--o-pink)] px-1.5 text-[0.7rem] font-extrabold text-white">{newCount}</span>}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <Empty title={f === "all" ? "No inquiries yet." : "Nothing here."} text={f === "all" ? "When someone writes to you from the website it will appear here, and you will get an email." : "Try a different filter above."} />
      ) : (
        <div className="o-card o-in-view overflow-hidden">
          {list.map((i) => (
            <Link key={i.id} href={`/office/inbox/${i.id}`} className="o-row">
              <NewDot on={i.status === "new"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <KindChip kind={i.kind} />
                  <span className="text-[0.82rem] text-[var(--o-faint)]">{timeAgo(i.createdAt)}</span>
                </div>
                <p className={`mt-1 truncate text-[1.05rem] ${i.status === "new" ? "font-semibold" : ""}`}>{personLine(i)}</p>
                <p className="truncate text-[0.9rem] text-[var(--o-soft)]">{i.fields["Artwork"] ? `About ${i.fields["Artwork"]}` : i.message || i.email || ""}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-[var(--o-faint)]" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
