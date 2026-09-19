import { getSettings, storeMode } from "@/lib/studio/store";
import { PageHead } from "@/components/office/ui";
import SettingsForm from "@/components/office/SettingsForm";
import { logoutAction } from "@/app/office/actions";

export default async function SettingsPage() {
  const [settings, mode] = await Promise.all([getSettings(), storeMode()]);
  const photos = process.env.BLOB_READ_WRITE_TOKEN ? "Connected" : process.env.VERCEL ? "Not connected yet" : "Local folder (development)";
  const email = process.env.BREVO_API_KEY ? "Connected" : "Not connected yet";
  return (
    <>
      <PageHead kicker="Settings" title="A few things to set once." text="Where the website sends its emails, and how to sign out." />
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="o-card o-in-view p-5 sm:p-7">
          <p className="o-label mb-4">Email alerts</p>
          <SettingsForm initial={settings} />
        </section>
        <aside className="grid gap-5 lg:self-start">
          <section className="o-card o-in-view p-5 sm:p-6" style={{ animationDelay: "80ms" }}>
            <p className="o-label mb-3">Behind the scenes</p>
            <dl className="grid gap-3 text-[0.95rem]">
              <Row k="Database" v={mode === "postgres" ? "Connected" : mode === "file" ? "Local file (development)" : "Not connected yet"} ok={mode !== "readonly"} />
              <Row k="Photo storage" v={photos} ok={photos !== "Not connected yet"} />
              <Row k="Email sending" v={email} ok={email === "Connected"} />
              <Row k="Card payments" v="Coming with Stripe" ok={false} />
            </dl>
            <p className="mt-4 text-[0.86rem] text-[var(--o-faint)]">Anything that says “not connected” is a one-time job for Jordan, not for you.</p>
          </section>
          <section className="o-card o-in-view p-5 sm:p-6" style={{ animationDelay: "120ms" }}>
            <p className="o-label mb-3">Your password</p>
            <p className="text-[0.95rem] text-[var(--o-soft)]">To change the office password, call or text Jordan. He changes it in one place and every device signs out.</p>
            <form action={logoutAction} className="mt-5">
              <button type="submit" className="btn btn-line w-full">
                Sign out of this device
              </button>
            </form>
          </section>
        </aside>
      </div>
    </>
  );
}

function Row({ k, v, ok }: { k: string; v: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--o-hair)] pb-3 last:border-0 last:pb-0">
      <dt className="text-[var(--o-soft)]">{k}</dt>
      <dd className="flex items-center gap-2 font-semibold">
        <span className={`h-2.5 w-2.5 rounded-full ${ok ? "bg-[var(--o-green)]" : "bg-[var(--o-gold)]"}`} />
        {v}
      </dd>
    </div>
  );
}
