"use client";
// One invitation, once per class date: appears a few seconds into a visit,
// never on the class page itself, the checkout or the office. Built for a
// phone first: one picture, one line, one button, all above the fold.
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CLASS, classDay, classStart, upcomingClasses } from "@/lib/classes";

const DELAY = 6500;

export default function ClassPopup() {
  const pathname = usePathname();
  const next = upcomingClasses()[0];
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  const allowed = Boolean(next) && !/^\/(classes|checkout|cart|office|invoice|login|i\/|o\/|q\/|v\/)/.test(pathname);

  useEffect(() => {
    if (!next || !allowed) return;
    try {
      if (localStorage.getItem(`cc_popup_${next.id}`) === "1") return;
    } catch {}
    const t = setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => setShown(true));
    }, DELAY);
    return () => clearTimeout(t);
  }, [next, allowed]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!next || !open) return null;
  const close = () => {
    try {
      localStorage.setItem(`cc_popup_${next.id}`, "1");
    } catch {}
    setShown(false);
    setTimeout(() => setOpen(false), 260);
  };

  return (
    <div className={`fixed inset-0 z-[150] grid place-items-center p-5 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`} role="dialog" aria-modal="true" aria-labelledby="class-popup-title">
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" />
      <div className={`relative w-full max-w-[420px] overflow-hidden rounded-3xl bg-gallery shadow-[0_40px_120px_rgba(18,23,43,0.35)] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] sm:max-w-[760px] sm:grid sm:grid-cols-[0.95fr_1.05fr] ${shown ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"}`}>
        <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[420px]">
          <Image src={CLASS.photo} alt="Carol Calicchio in her Delray Beach studio" fill sizes="(min-width:640px) 40vw, 100vw" className="object-cover object-[50%_42%] sm:object-[50%_18%]" priority />
        </div>
        <div className="p-6 sm:flex sm:flex-col sm:justify-center sm:p-10">
          <p className="display-light text-[0.98rem] italic text-ink/60">You&rsquo;re invited</p>
          <h2 id="class-popup-title" className="display mt-1.5 text-[2.1rem] leading-[1] sm:text-[2.6rem]">
            An Evening in the Studio.
          </h2>
          <p className="pretty mt-3 text-[0.98rem] leading-relaxed text-ink/72">Paint your own abstract floral beside Carol, and take it home the same night.</p>
          <p className="mt-4 text-[0.95rem] font-semibold">
            {classDay(next)} · {classStart(next)} · Delray Beach
          </p>
          <p className="mt-0.5 text-[0.9rem] text-ink/65">${CLASS.price} a seat. Everything included.</p>
          <Link href="/classes#reserve" onClick={close} className="btn btn-pink mt-5 w-full sm:w-auto">
            Reserve my seat
          </Link>
          <button type="button" onClick={close} className="mt-3 text-[0.88rem] font-semibold text-ink/55 underline-offset-4 hover:text-ink hover:underline sm:w-max">
            Not this time
          </button>
        </div>
      </div>
    </div>
  );
}
