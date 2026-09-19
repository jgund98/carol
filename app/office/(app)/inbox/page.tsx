// Inquiries: every message the website has sent, newest first.
import { listInquiries } from "@/lib/studio/store";
import { INQUIRY_KINDS, type InquiryKind } from "@/lib/studio/types";
import { Empty, KindChip, PageHead, Row, timeAgo, personLine } from "@/components/office/ui";
import { SelectFilter, Tabs } from "@/components/office/Tabs";

const KINDS = ["inquiry", "commission", "visit", "contact", "newsletter"] as const;

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ f?: string; type?: string }> }) {
  const { f = "new", type = "all" } = await searchParams;
  const all = await listInquiries();
  const byType = type === "all" ? all : all.filter((i) => i.kind === (type as InquiryKind));
  const newOnes = byType.filter((i) => i.status === "new");
  const handled = byType.filter((i) => i.status === "handled");
  const list = f === "new" ? newOnes : f === "handled" ? handled : byType;
  const base = type === "all" ? "" : `&type=${type}`;
  const newCount = all.filter((i) => i.status === "new").length;

  return (
    <>
      <PageHead kicker="Inquiries" title={newCount ? `${newCount} waiting for a reply.` : "Everything people have sent you."} text="Messages, artwork questions, commission requests and studio-visit requests from the website. Tap one to see everything they wrote and to call, text or email them back." />

      <Tabs
        current={f}
        tabs={[
          { key: "new", label: "New", count: newOnes.length, href: `/office/inbox?f=new${base}` },
          { key: "handled", label: "Handled", count: handled.length, href: `/office/inbox?f=handled${base}` },
          { key: "all", label: "All", count: byType.length, href: `/office/inbox?f=all${base}` },
        ]}
      />
      <div className="mb-3 flex justify-end">
        <SelectFilter label="Show" param="type" value={type} base={`/office/inbox?f=${f}`} options={[{ key: "all", label: "All types" }, ...KINDS.map((k) => ({ key: k, label: INQUIRY_KINDS[k].plural }))]} />
      </div>

      {list.length === 0 ? (
        <Empty
          title={all.length === 0 ? "No inquiries yet." : f === "new" ? "Nothing new." : "Nothing here."}
          text={all.length === 0 ? "When someone writes to you from the website it will appear here, and you will get an email." : f === "new" ? "Everything has been replied to. Older ones are under Handled." : "Try another tab, or All types."}
        />
      ) : (
        <div className="o-card o-in-view overflow-hidden">
          {list.map((i) => (
            <Row key={i.id} href={`/office/inbox/${i.id}`} isNew={i.status === "new"} title={personLine(i)} meta={<><KindChip kind={i.kind} /> · {i.fields["Artwork"] ? `About ${i.fields["Artwork"]}` : i.message || i.email || ""}</>} time={timeAgo(i.createdAt)} />
          ))}
        </div>
      )}
    </>
  );
}
