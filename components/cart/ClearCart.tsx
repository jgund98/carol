"use client";
import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Empties the selection once a purchase is confirmed. Renders nothing. */
export default function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
