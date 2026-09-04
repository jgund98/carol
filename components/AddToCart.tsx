"use client";
import Link from "next/link";
import { useCart } from "./cart/CartProvider";
import type { Work } from "@/lib/works";

export default function AddToCart({ work }: { work: Work }) {
  const { add, has, setOpen } = useCart();
  if (work.sold)
    return (
      <div className="flex flex-wrap gap-3">
        <span className="btn btn-line cursor-default">Sold</span>
        <Link href={`/commissions?ref=${work.slug}`} className="btn btn-ink">
          Commission a similar piece
        </Link>
      </div>
    );
  if (!work.available)
    return (
      <div className="flex flex-wrap gap-3">
        <span className="btn btn-line cursor-default">Currently unavailable</span>
        <Link href={`/contact?about=${work.slug}`} className="btn btn-ink">
          Ask about availability
        </Link>
      </div>
    );
  const inCart = has(work.slug);
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => (inCart ? setOpen(true) : add(work.slug))} className="btn btn-pink">
        {inCart ? "In your selection" : "Acquire this piece"}
      </button>
      <Link href={`/contact?about=${work.slug}`} className="btn btn-line">
        Inquire
      </Link>
    </div>
  );
}
