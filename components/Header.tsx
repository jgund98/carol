"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";
import { useCart } from "./cart/CartProvider";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const dark = false;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menu]);

  const onDark = dark && !scrolled && !menu;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled && !menu ? "bg-gallery/85 backdrop-blur-xl shadow-[0_1px_0_rgba(18,23,43,0.08)]" : "bg-transparent"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        <div className="wrap flex h-full items-center justify-between gap-6">
          <Link href="/" aria-label="Carol Calicchio, home" className="relative block h-[44px] w-[150px] md:h-[52px] md:w-[176px]">
            <Image
              src={onDark ? "/brand/sig-white.png" : "/brand/sig-ink.png"}
              alt="Carol Calicchio"
              fill
              priority
              sizes="176px"
              className="object-contain object-left"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`group relative text-[0.86rem] font-semibold tracking-[0.04em] transition-colors ${
                    onDark ? "text-white/85 hover:text-white" : "text-ink/75 hover:text-ink"
                  }`}
                >
                  {n.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-hibiscus transition-all duration-400 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors ${
                onDark ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5"
              }`}
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z" />
                <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-hibiscus px-1 text-[0.68rem] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            <Link href="/studio#visit" className={`btn btn-sm hidden sm:inline-flex ${onDark ? "btn-white" : "btn-ink"}`}>
              Visit the studio
            </Link>
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${onDark ? "text-white" : "text-ink"}`}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
            >
              <span className="relative block h-4 w-6">
                <span className={`absolute left-0 top-0 h-[2px] w-6 rounded bg-current transition-transform duration-300 ${menu ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`absolute left-0 top-[7px] h-[2px] w-6 rounded bg-current transition-opacity duration-200 ${menu ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 top-[14px] h-[2px] w-6 rounded bg-current transition-transform duration-300 ${menu ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[110] flex flex-col bg-gallery transition-[opacity,visibility] duration-400 lg:hidden ${
          menu ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!menu}
      >
        <div className="wrap flex flex-1 flex-col justify-center gap-2 pt-24">
          {nav.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className="display border-b border-ink/10 py-4 text-[2.6rem] leading-none text-ink transition-transform duration-500"
              style={{ transitionDelay: `${i * 40}ms`, transform: menu ? "none" : "translateY(16px)" }}
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/studio#visit" className="btn btn-ink">
              Visit the studio
            </Link>
            <a href={site.phoneHref} className="btn btn-line">
              Call {site.phone}
            </a>
          </div>
          <p className="mt-8 text-sm text-muted">
            {site.studio.street}, {site.studio.city}, {site.studio.state} · {site.studio.note}
          </p>
        </div>
      </div>
    </>
  );
}
