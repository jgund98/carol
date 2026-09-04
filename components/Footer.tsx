import Link from "next/link";
import Image from "next/image";
import { site, nav } from "@/lib/site";
import { collections } from "@/lib/content";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="relative bg-midnight text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="wrap section">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Image src="/brand/sig-white.png" alt="Carol Calicchio" width={260} height={82} className="h-auto w-[240px]" />
            <p className="pretty mt-6 max-w-sm text-[0.98rem] leading-relaxed text-white/70">{site.tagline}</p>
            <div className="mt-6 flex gap-3">
              <a href={site.social.instagram} target="_blank" rel="noopener" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white/10" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href={site.social.facebookPage} target="_blank" rel="noopener" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white/10" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.4V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.3v3h2.4v7h2.8Z" /></svg>
              </a>
              <a href={site.social.artsy} target="_blank" rel="noopener" className="grid h-11 place-items-center rounded-full border border-white/20 px-4 text-xs font-semibold tracking-[0.18em] transition-colors hover:bg-white/10" aria-label="Artsy">
                ARTSY
              </a>
            </div>
          </div>

          <div>
            <p className="label text-gold-2">Explore</p>
            <ul className="mt-5 space-y-3 text-[0.95rem] text-white/80">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="transition-colors hover:text-white">{n.label}</Link>
                </li>
              ))}
              <li><Link href="/exhibitions" className="transition-colors hover:text-white">Exhibitions</Link></li>
              <li><Link href="/press" className="transition-colors hover:text-white">Press</Link></li>
              <li><Link href="/policies" className="transition-colors hover:text-white">Store policy</Link></li>
            </ul>
          </div>

          <div>
            <p className="label text-gold-2">Collections</p>
            <ul className="mt-5 space-y-3 text-[0.95rem] text-white/80">
              {collections.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className="transition-colors hover:text-white">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-gold-2">The studio</p>
            <address className="mt-5 not-italic text-[0.95rem] leading-relaxed text-white/80">
              {site.studio.name}
              <br />
              {site.studio.street}
              <br />
              {site.studio.city}, {site.studio.state} {site.studio.zip}
              <br />
              <span className="text-white/55">{site.studio.note}</span>
            </address>
            <p className="mt-4 text-[0.95rem] leading-relaxed">
              <a href={site.phoneHref} className="text-white/85 hover:text-white">{site.phone}</a>
              <br />
              <a href={`mailto:${site.email}`} className="text-white/85 hover:text-white">{site.email}</a>
            </p>
            <Newsletter dark />
          </div>
        </div>

        <p className="pretty mt-14 max-w-4xl text-[0.82rem] leading-relaxed text-white/45">
          Original abstract paintings collected across {site.areaServed.slice(0, 9).join(", ")} and beyond. Studio visits in Delray Beach by appointment.
        </p>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[0.8rem] text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Carol Calicchio. All artwork © the artist.</p>
          <a href={site.epic.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 opacity-80 transition-opacity hover:opacity-100">
            <span>Site by</span>
            <Image src="/brand/epic-logo-white.webp" alt={site.epic.name} width={116} height={28} className="h-7 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
