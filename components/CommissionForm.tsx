"use client";
import { useSearchParams } from "next/navigation";
import LeadForm from "./LeadForm";
import { bySlug } from "@/lib/catalog";

export default function CommissionForm() {
  const sp = useSearchParams();
  const ref = sp.get("ref");
  const w = ref ? bySlug(ref) : undefined;
  return (
    <LeadForm
      dark
      formType="commission"
      submitLabel="Request a commission"
      extra={w ? { "Inspired by": w.name } : {}}
      fields={[
        { name: "name", label: "Name", required: true, half: true },
        { name: "phone", label: "Phone", type: "tel", required: true, half: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "size", label: "Approximate size or wall", half: true, placeholder: "e.g. 60 × 48 in., above a 9 ft sofa" },
        { name: "series", label: "Series or palette", half: true, placeholder: "Flower Power, Blue, White…", default: w ? `Something like ${w.name}` : "" },
        { name: "message", label: "About the room", textarea: true, required: true, placeholder: "Where it will hang, the light, the mood you want…" },
      ]}
      success={{ title: "Carol has your note.", text: "She will call to talk about the room, then send reference images within a few days." }}
    />
  );
}
