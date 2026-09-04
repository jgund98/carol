"use client";
import { useEffect, useRef, type ReactNode, type ElementType } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  variant?: "rise" | "scale";
  once?: boolean;
  id?: string;
};

/** IntersectionObserver reveal. Threshold stays tiny so tall elements still fire. */
export default function Reveal({ children, className = "", delay = 0, as: Tag = "div", variant = "rise", once = true, id }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("in");
            if (once) io.unobserve(el);
          } else if (!once) el.classList.remove("in");
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  const base = variant === "scale" ? "rv-scale" : "rv";
  return (
    <Tag ref={ref} id={id} className={`${base} ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

/** Headline that rises word by word. Keeps words on natural wrap points. */
export function Rise({ text, className = "", as: Tag = "h2" }: { text: string; className?: string; as?: ElementType }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={`rise ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span className="w" key={i} aria-hidden>
          <span style={{ "--i": i } as React.CSSProperties}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
