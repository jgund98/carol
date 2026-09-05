"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";
import { collections } from "@/lib/content";
import { bySlug, img, inCollection } from "@/lib/catalog";
import { useCart } from "./cart/CartProvider";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { count, setOpen } = useCart();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMenu(false);
    setMega(false);
  }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menu]);

  const openMega = () => {
    if (closeT.current) clearTimeout(closeT.current);
    setMega(true);
  };
  const closeMega = () => {
    if (closeT.current) clearTimeout(closeT.current);
    closeT.current = setTimeout(() => setMega(false), 160);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled || mega ? "bg-gallery/90 backdrop-blur-xl shadow-[0_1px_0_rgba(18,23,43,0.08)]" : "bg-transparent"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        <div className="wrap flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="Carol Calicchio, home"
            className="relative block h-[44px] w-[150px] md:h-[52px] md:w-[176px]"
            onClick={(e) => {
              setMenu(false);
              if (pathname === "/") {
                e.preventDefault();
                window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.1 }) : window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <Image src="/brand/sig-ink.png" alt="Carol Calicchio" fill priority sizes="176px" className="object-contain object-left" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              const isColl = n.href === "/collections";
              return (
                <div key={n.href} className="relative" onMouseEnter={isColl ? openMega : undefined} onMouseLeave={isColl ? closeMega : undefined}>
                  <Link
                    href={n.href}
                    className="group relative inline-flex items-center gap-1.5 text-[0.86rem] font-semibold tracking-[0.04em] text-ink/75 transition-colors hover:text-ink"
                    aria-haspopup={isColl ? "true" : undefined}
                    aria-expanded={isColl ? mega : undefined}
                    onFocus={isColl ? openMega : undefined}
                  >
                    {n.label}
                    {isColl && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${mega ? "rotate-180" : ""}`} aria-hidden>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                    <span className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-hibiscus transition-all duration-400 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z" />
                <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-hibiscus px-1 text-[0.68rem] font-bold text-white">{count}</span>
              )}
            </button>
            <Link href="/shop" className="btn btn-sm btn-pink">
              <span className="sm:hidden">Shop</span>
              <span className="hidden sm:inline">Shop originals</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="grid h-11 w-11 place-items-center rounded-full text-ink lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label="Open menu"
            >
              <span className="relative block h-4 w-6">
                <span className="absolute left-0 top-0 h-[2px] w-6 rounded bg-current" />
                <span className="absolute left-0 top-[7px] h-[2px] w-6 rounded bg-current" />
                <span className="absolute left-0 top-[14px] h-[2px] w-6 rounded bg-current" />
              </span>
            </button>
          </div>
        </div>

        {/* Collections: the paintings themselves as the menu */}
        <div
          className={`absolute inset-x-0 top-full hidden border-t border-ink/10 bg-gallery/95 backdrop-blur-xl transition-[opacity,transform,visibility] duration-300 lg:block ${
            mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          aria-hidden={!mega}
        >
          <div className="wrap grid grid-cols-6 gap-6 py-7">
            {collections.map((c) => {
              const w = bySlug(c.hero)!;
              const n = inCollection(c.key).length;
              const a = w.iw / w.ih;
              return (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="group" tabIndex={mega ? 0 : -1}>
                  <div className="plaster flex aspect-[5/4] items-center justify-center overflow-hidden rounded-sm">
                    <div className="wrap-edge relative overflow-hidden transition-transform duration-500 group-hover:-translate-y-1" style={c.key === "surfboards" ? { width: "100%", height: "100%" } : { width: a >= 1.25 ? "84%" : `${Math.min(84, 68 * a)}%`, aspectRatio: `${w.iw} / ${w.ih}` }}>
                      <Image src={img(w, "sm")} alt="" fill sizes="200px" className="object-cover" />
                    </div>
                  </div>
                  <p className="display mt-3 text-[1.15rem] leading-none">{c.name}</p>
                  <p className="mt-1 text-[0.72rem] text-muted">
                    {c.kicker} · {n} piece{n === 1 ? "" : "s"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile menu: a full-screen sheet above the header, with its own top bar */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-0 z-[140] flex flex-col bg-gallery transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] lg:hidden ${menu ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!menu}
      >
        <div className="wrap flex items-center justify-between" style={{ height: "var(--header-h)" }}>
          <Link href="/" onClick={() => setMenu(false)} aria-label="Carol Calicchio, home" className="relative block h-[44px] w-[150px]">
            <Image src="/brand/sig-ink.png" alt="Carol Calicchio" fill sizes="150px" className="object-contain object-left" />
          </Link>
          <button type="button" onClick={() => setMenu(false)} className="grid h-11 w-11 place-items-center rounded-full bg-ink/5 text-ink" aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <nav className="wrap flex-1 overflow-y-auto pb-10 pt-4" aria-label="Mobile">
          <ul className="divide-y divide-ink/10 border-t border-ink/10">
            {nav.map((n, i) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <li key={n.href} style={{ transitionDelay: `${80 + i * 40}ms` }} className={`transition-[opacity,transform] duration-500 ${menu ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}>
                  <Link href={n.href} className="flex items-center justify-between py-4">
                    <span className={`display text-[2.1rem] leading-none ${active ? "text-hibiscus" : "text-ink"}`}>{n.label}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink/40"><path d="M9 6l6 6-6 6" /></svg>
                  </Link>
                  {n.href === "/collections" && (
                    <div className="rail -mx-1 flex gap-2 px-1 pb-4">
                      {collections.map((c) => (
                        <Link key={c.slug} href={`/collections/${c.slug}`} className="shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/75">
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-8 grid gap-3">
            <Link href="/shop" className="btn btn-pink w-full">
              Shop originals
            </Link>
            <Link href="/studio#visit" className="btn btn-line w-full">
              Visit the studio
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <a href={site.phoneHref} className="font-semibold text-ink">{site.phone}</a>
            <a href={site.social.instagram} target="_blank" rel="noopener" className="font-semibold text-ink">{site.social.instagramHandle}</a>
          </div>
          <p className="mt-3 text-xs text-muted">
            {site.studio.street}, {site.studio.city}, {site.studio.state} · {site.studio.note}
          </p>
        </nav>
      </div>
    </>
  );
}
