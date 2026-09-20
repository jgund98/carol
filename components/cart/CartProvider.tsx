"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { maxQty, type Work } from "@/lib/works";

export type CartLine = { slug: string; qty: number };

type Ctx = {
  lines: CartLine[];
  items: { work: Work; qty: number }[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "cc-cart-v1";

export function CartProvider({ children, works }: { children: ReactNode; works: Work[] }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((slug: string) => {
    setLines((ls) => {
      const w = works.find((x) => x.slug === slug);
      if (!w) return ls;
      const ex = ls.find((l) => l.slug === slug);
      // Quantity is capped by what the studio has: one for an original, the stock count otherwise.
      const cap = maxQty(w);
      if (ex) return ls.map((l) => (l.slug === slug ? { ...l, qty: Math.min(cap, l.qty + 1) } : l));
      return [...ls, { slug, qty: 1 }];
    });
    setOpen(true);
  }, [works]);
  const remove = useCallback((slug: string) => setLines((ls) => ls.filter((l) => l.slug !== slug)), []);
  const setQty = useCallback((slug: string, qty: number) => setLines((ls) => ls.map((l) => { if (l.slug !== slug) return l; const w = works.find((x) => x.slug === slug); return { ...l, qty: Math.min(w ? maxQty(w) : 1, Math.max(1, Math.floor(qty) || 1)) }; })), [works]);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Ctx>(() => {
    const items = lines.map((l) => ({ work: works.find((w) => w.slug === l.slug)!, qty: l.qty })).filter((i) => i.work);
    return {
      lines,
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.work.price, 0),
      open,
      setOpen,
      add,
      remove,
      setQty,
      clear,
      has: (slug) => lines.some((l) => l.slug === slug),
    };
  }, [lines, open, add, remove, setQty, clear, works]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};
