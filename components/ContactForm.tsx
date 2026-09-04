"use client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import LeadForm from "./LeadForm";
import { bySlug, dims, img } from "@/lib/catalog";
import { money } from "@/lib/site";

export default function ContactForm() {
  const sp = useSearchParams();
  const about = sp.get("about");
  const w = about ? bySlug(about) : undefined;
  return (
    <div>
      {w && (
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm">
          <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded bg-linen">
            <Image src={img(w, "sm")} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div>
            <p className="label text-muted">Asking about</p>
            <p className="display text-lg leading-tight">{w.name}</p>
            <p className="text-xs text-muted">{[dims(w), w.sold ? "Sold" : money(w.price)].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
      )}
      <LeadForm
        formType={w ? "inquiry" : "contact"}
        subject={w ? `New Artwork Inquiry · ${w.name}` : undefined}
        extra={w ? { Artwork: `${w.name} (${dims(w) ?? ""}) ${w.sold ? "SOLD" : money(w.price)}` } : {}}
        submitLabel={w ? "Send inquiry" : "Send"}
        fields={[
          { name: "name", label: "Name", required: true, half: true, placeholder: "First name is fine" },
          { name: "phone", label: "Phone", type: "tel", half: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "message", label: "Message", textarea: true, required: true, placeholder: w ? `I'd love to know more about ${w.name}…` : "A painting, a commission, a visit…" },
        ]}
        success={{ title: "Thank you.", text: "Carol will be in touch personally, usually within one business day." }}
      />
    </div>
  );
}
