"use client";
// Phone only: a pinned Reserve button that stays until the booking form is on screen.
import { useEffect, useState } from "react";

export default function ReserveBar({ label }: { label: string }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const el = document.getElementById("reserve");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { rootMargin: "0px 0px -40% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className={`fixed inset-x-0 bottom-0 z-[110] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 sm:hidden ${show ? "translate-y-0" : "translate-y-full"}`} style={{ background: "linear-gradient(180deg, rgba(251,249,245,0) 0%, rgba(251,249,245,0.96) 35%)" }}>
      <a href="#reserve" className="btn btn-pink w-full shadow-[0_12px_30px_rgba(232,57,127,0.35)]">
        {label}
      </a>
    </div>
  );
}
