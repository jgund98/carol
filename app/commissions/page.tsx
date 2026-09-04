import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import CommissionForm from "@/components/CommissionForm";
import { quotes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Commissions | Custom Oversized Abstract Paintings",
  description: "Commission an original oversized painting by Carol Calicchio: abstract florals, seascapes or a White Series with embedded crystals, painted to your room and light in Delray Beach, FL.",
  alternates: { canonical: "/commissions" },
};

const steps = [
  { t: "The room", d: "Send a photo of the wall, its light, the sofa beneath it, and the colors already living there. Carol reads rooms; interior design was her first degree." },
  { t: "The conversation", d: "Size, series and palette. A 48 × 60 seascape, a 72 × 48 White Series, a metallic gold Botanical Bliss on a 74 × 96 canvas. You will see references and a sketch before a brush is loaded." },
  { t: "The painting", d: "Museum-quality Fredrix canvas, two coats of clear gesso, then weeks of loaded-brush work. Carol shares progress from the studio as it comes to life." },
  { t: "The hang", d: "Delivery and installation are arranged with you personally, so the first time you see it, it is already on the wall." },
];

export default function CommissionsPage() {
  return (
    <>
      <PageHero art={["the-provider", "golden-gardenia"]} kicker="Commissions" title="Painted for your wall." text="Oversized oil and acrylic canvases painted on a commission basis, for homes, hotels and offices. Tell Carol about the room and she will tell you what belongs on it." />

      <section className="wrap pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal variant="scale" className="grid grid-cols-[1fr_0.75fr] items-stretch gap-4">
            <div className="wrap-edge relative min-h-[420px] overflow-hidden bg-linen">
              <Image src="/photos/bedroom-install.jpg" alt="A Carol Calicchio painting installed above a bed in a collector's home" fill priority sizes="(min-width:1024px) 30vw, 60vw" className="object-cover object-[60%_50%]" />
            </div>
            <div className="grid gap-4">
              <div className="wrap-edge relative aspect-[3/4] overflow-hidden bg-linen">
                <Image src="/photos/white-series-gallery.jpg" alt="Two White Series paintings installed in a gallery" fill sizes="20vw" className="object-cover" />
              </div>
              <div className="wrap-edge relative aspect-[3/4] overflow-hidden bg-linen">
                <Image src="/art/midnight-bliss.jpg" alt="Midnight Bliss, 72 by 60 inches, acrylic and mixed media" fill sizes="(min-width:1024px) 22vw, 40vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
          <div>
            <ol className="space-y-8">
              {steps.map((s, i) => (
                <Reveal key={s.t} as="li" delay={i * 80} className="grid grid-cols-[48px_1fr] gap-4">
                  <span className="display text-[2rem] leading-none text-hibiscus">{i + 1}</span>
                  <div>
                    <h2 className="display text-[1.6rem] leading-tight">{s.t}</h2>
                    <p className="pretty mt-2 text-[0.98rem] leading-relaxed text-ink/75">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal className="mt-10 rounded-2xl bg-paper p-6">
              <p className="display-light text-[1.3rem] leading-snug">“{quotes[4].text}”</p>
              <p className="mt-3 text-sm font-semibold">{quotes[4].by}</p>
              <p className="text-xs text-muted">{quotes[4].source}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-midnight text-white">
        <div className="wrap section grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="display-light text-[1.05rem] italic text-gold-2">Start here</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.6rem)]">Tell Carol about the room.</h2>
            <p className="pretty mt-5 text-[1rem] leading-relaxed text-white/70">A few lines is enough. She will call to talk it through, and the first reference images follow within days.</p>
          </Reveal>
          <Reveal delay={100}>
            <Suspense>
              <CommissionForm />
            </Suspense>
          </Reveal>
        </div>
      </section>
    </>
  );
}
