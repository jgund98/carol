"use client";
// The slim strip above the header announcing the next class. Dismissable
// once per date; hides itself on the class page and in the office. While
// shown it grows --header-h so every page's hero starts below it.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classDay, classShort, upcomingClasses, CLASS } from "@/lib/classes";

export const BANNER_H = 42;

export default function ClassBanner() {
  const pathname = usePathname();
  const next = upcomingClasses()[0];
  const [show, setShow] = useState(false);

  const allowed = Boolean(next) && !pathname.startsWith("/classes") && !pathname.startsWith("/office") && !pathname.startsWith("/checkout") && !pathname.startsWith("/invoice");

  useEffect(() => {
    if (!next || !allowed) {
      setShow(false);
      return;
    }
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(`cc_banner_${next.id}`) === "1";
    } catch {}
    setShow(!dismissed);
  }, [next, allowed]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--header-h", show ? `calc(var(--header-base) + ${BANNER_H}px)` : "var(--header-base)");
    return () => root.style.setProperty("--header-h", "var(--header-base)");
  }, [show]);

  if (!next || !show) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(`cc_banner_${next.id}`, "1");
    } catch {}
    setShow(false);
  };

  return (
    <div className="relative z-[121] flex items-center bg-hibiscus text-white" style={{ height: BANNER_H }} role="region" aria-label="Upcoming class">
      <Link href="/classes" className="wrap flex h-full items-center justify-center gap-3 pr-12 text-center text-[0.86rem] font-semibold tracking-[0.01em] transition-opacity hover:opacity-90 sm:text-[0.92rem]">
        <span aria-hidden className="hidden sm:inline">✦</span>
        <span className="hidden sm:inline">
          {CLASS.title} with Carol, {classDay(next)}.
        </span>
        <span className="sm:hidden">Paint with Carol, {classShort(next)}.</span>
        <span className="underline decoration-white/60 underline-offset-4 whitespace-nowrap">Reserve a seat →</span>
      </Link>
      <button type="button" onClick={dismiss} aria-label="Hide this notice" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}
