import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | Carol Calicchio Art Studio, Delray Beach",
  description: "Contact Carol Calicchio about a painting, a commission or a studio visit. 2559 Webb Avenue, Delray Beach, FL. Call 561-400-0678 or email Carol@carolcalicchioart.com.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero kicker="Contact" title="Talk to Carol." text="About a painting, a commission, a workshop, or simply to come and see the work. She answers personally." />
      <section className="wrap pb-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="wrap-edge relative aspect-[4/5] overflow-hidden bg-linen">
              <Image src="/photos/carol-studio-seated.jpg" alt="Carol Calicchio in her studio" fill sizes="(min-width:1024px) 35vw, 100vw" className="object-cover" />
            </div>
            <dl className="mt-8 space-y-5 text-[0.98rem]">
              <div>
                <dt className="label text-muted">Studio</dt>
                <dd className="mt-1">
                  {site.studio.name}
                  <br />
                  {site.studio.street}, {site.studio.city}, {site.studio.state} {site.studio.zip}
                  <br />
                  <span className="text-muted">{site.studio.note}</span>
                </dd>
              </div>
              <div>
                <dt className="label text-muted">Phone</dt>
                <dd className="mt-1"><a href={site.phoneHref} className="font-semibold">{site.phone}</a></dd>
              </div>
              <div>
                <dt className="label text-muted">Email</dt>
                <dd className="mt-1"><a href={`mailto:${site.email}`} className="font-semibold">{site.email}</a></dd>
              </div>
              <div>
                <dt className="label text-muted">Instagram</dt>
                <dd className="mt-1"><a href={site.social.instagram} target="_blank" rel="noopener" className="font-semibold">{site.social.instagramHandle}</a></dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={100} className="rounded-2xl bg-paper p-6 md:p-10">
            <Suspense>
              <ContactForm />
            </Suspense>
          </Reveal>
        </div>
      </section>
    </>
  );
}
