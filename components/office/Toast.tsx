"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, AlertTriangle } from "lucide-react";

type Tone = "ok" | "error";
type Toast = { id: number; text: string; tone: Tone; link?: { href: string; label: string } };
const Ctx = createContext<{ show: (text: string, tone?: Tone, link?: Toast["link"]) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string, tone: Tone = "ok", link?: Toast["link"]) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), text, tone, link });
    timer.current = setTimeout(() => setToast(null), tone === "error" ? 7000 : 4200);
  }, []);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {toast && (
        <div key={toast.id} className="o-toast" data-tone={toast.tone} role="status">
          {toast.tone === "ok" ? <Check className="h-4 w-4 shrink-0 text-[var(--o-gold-2)]" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span>{toast.text}</span>
          {toast.link && (
            <a href={toast.link.href} target="_blank" rel="noopener" className="underline underline-offset-4">
              {toast.link.label}
            </a>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast outside ToastProvider");
  return c.show;
}
