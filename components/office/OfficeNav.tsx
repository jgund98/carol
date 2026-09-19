"use client";
// Navigation. On a phone it works like the apps Carol already knows: five
// tabs along the bottom with a big + in the middle, and a small gear at the
// top for settings. On a desk it is a sidebar.
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sun, Inbox, ShoppingBag, Palette, Layers, Camera, Settings, ExternalLink, LogOut, Plus } from "lucide-react";
import { logoutAction } from "@/app/office/actions";

type Counts = { inquiries: number; orders: number };

const ITEMS = [
  { href: "/office/home", label: "Today", Icon: Sun },
  { href: "/office/inbox", label: "Inquiries", Icon: Inbox, badge: "inquiries" as const },
  { href: "/office/orders", label: "Orders", Icon: ShoppingBag, badge: "orders" as const },
  { href: "/office/artwork", label: "Artwork", Icon: Palette },
  { href: "/office/collections", label: "Collections", Icon: Layers },
  { href: "/office/guide", label: "Photo guide", Icon: Camera },
  { href: "/office/settings", label: "Settings", Icon: Settings },
];

export default function OfficeNav({ initial }: { initial: Counts }) {
  const path = usePathname();
  const [counts, setCounts] = useState<Counts>(initial);

  useEffect(() => setCounts(initial), [initial]);

  // Keep the badges honest while the office sits open.
  useEffect(() => {
    let dead = false;
    const check = async () => {
      try {
        const r = await fetch("/api/office/unread", { cache: "no-store" });
        const d = (await r.json().catch(() => null)) as Counts | null;
        if (!dead && d && typeof d.inquiries === "number") setCounts(d);
      } catch {}
    };
    const t = setInterval(() => void check(), 45000);
    const onVis = () => document.visibilityState === "visible" && void check();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      dead = true;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // The browser tab says how many things are waiting.
  useEffect(() => {
    const total = counts.inquiries + counts.orders;
    const apply = () => {
      const base = document.title.replace(/^\(\d+\)\s*/, "");
      document.title = total > 0 ? `(${total}) ${base}` : base;
    };
    apply();
    const t = setTimeout(apply, 400);
    return () => clearTimeout(t);
  }, [counts, path]);

  const active = (href: string) => path === href || path.startsWith(href + "/");
  const badgeOf = (b?: "inquiries" | "orders") => (b ? counts[b] : 0);
  const [today, inbox, orders, artwork] = ITEMS;
  const Tab = ({ href, label, Icon, badge }: (typeof ITEMS)[number]) => {
    const n = badgeOf(badge);
    return (
      <Link href={href} className="o-tab" data-active={active(href)}>
        <Icon className="h-6 w-6" strokeWidth={1.8} />
        {label}
        {n > 0 && <span className="o-tab-badge">{n}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Desk: the sidebar */}
      <aside className="hidden border-r border-[var(--o-hair)] bg-[var(--o-paper)] lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:px-5 lg:py-8">
        <Link href="/office/home" className="block px-3">
          <Image src="/brand/sig-ink.png" alt="Carol Calicchio" width={420} height={132} className="h-auto w-[170px]" priority />
          <span className="o-label mt-3 block">Studio office</span>
        </Link>
        <Link href="/office/artwork/new" className="btn btn-pink mt-7">
          <Plus className="h-4 w-4" /> Add a new piece
        </Link>
        <nav className="mt-6 grid gap-1" aria-label="Office">
          {ITEMS.map(({ href, label, Icon, badge }) => {
            const n = badgeOf(badge);
            return (
              <Link key={href} href={href} className="o-nav-item" data-active={active(href)}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
                {n > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--o-pink)] px-1.5 text-[0.72rem] font-extrabold text-white">{n}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-[var(--o-hair)] pt-5">
          <a href="/" target="_blank" rel="noopener" className="o-nav-item">
            <ExternalLink className="h-5 w-5" strokeWidth={1.8} /> See the website
          </a>
          <form action={logoutAction}>
            <button type="submit" className="o-nav-item w-full text-left">
              <LogOut className="h-5 w-5" strokeWidth={1.8} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Phone: top bar + bottom tabs */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--o-hair)] bg-[rgba(251,249,245,0.9)] px-3 py-1.5 backdrop-blur-xl lg:hidden">
        <Link href="/office/home" className="flex items-center gap-3 pl-1">
          <Image src="/brand/sig-ink.png" alt="Carol Calicchio" width={420} height={132} className="h-auto w-[104px]" priority />
        </Link>
        <div className="flex items-center gap-0.5">
          <Link href="/office/settings" className="grid h-10 w-10 place-items-center rounded-full text-[var(--o-soft)] hover:bg-[var(--o-hair)]" aria-label="Settings">
            <Settings className="h-5 w-5" strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      <nav className="o-tabbar lg:hidden" aria-label="Office">
        <Tab {...today} />
        <Tab {...inbox} />
        <Link href="/office/artwork/new" className="o-tab" aria-label="Add a new piece">
          <span className="grid h-12 w-12 -translate-y-2 place-items-center rounded-full bg-[var(--o-pink)] text-white shadow-[0_12px_28px_-10px_rgba(232,57,127,0.8)]">
            <Plus className="h-6 w-6" strokeWidth={2.2} />
          </span>
        </Link>
        <Tab {...orders} />
        <Tab {...artwork} />
      </nav>
    </>
  );
}
