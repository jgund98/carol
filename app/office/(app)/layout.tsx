// The signed-in shell: sidebar on a desk, bottom tabs on a phone.
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/studio/auth";
import { listInquiries, listOrders, storeMode } from "@/lib/studio/store";
import OfficeNav from "@/components/office/OfficeNav";
import { ToastProvider } from "@/components/office/Toast";
import { NOT_CONNECTED } from "@/lib/studio/docstore";

export const dynamic = "force-dynamic";

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  if (!(await isSignedIn())) redirect("/login");
  const [inq, ord, mode] = await Promise.all([listInquiries(), listOrders(), storeMode()]);
  const counts = { inquiries: inq.filter((i) => i.status === "new").length, orders: ord.filter((o) => o.status === "new").length };

  return (
    <ToastProvider>
      <div className="lg:grid lg:min-h-[100svh] lg:grid-cols-[17rem_1fr]">
        <OfficeNav initial={counts} />
        <div className="min-w-0">
          {mode === "readonly" && (
            <div className="bg-[var(--o-ink)] px-5 py-3 text-center text-[0.9rem] text-white/85">
              <span className="font-semibold text-[var(--o-gold-2)]">Preview only.</span> {NOT_CONNECTED}
            </div>
          )}
          <main className="mx-auto w-full max-w-[68rem] px-5 pb-[calc(var(--o-tab-h)+2.5rem)] pt-5 sm:px-8 lg:px-12 lg:pb-16 lg:pt-12">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
