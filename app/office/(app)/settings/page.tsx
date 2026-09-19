import { getSettings } from "@/lib/studio/store";
import { PageHead } from "@/components/office/ui";
import SettingsForm from "@/components/office/SettingsForm";
import { logoutAction } from "@/app/office/actions";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHead kicker="Settings" title="A few things to set once." text="Where the website sends its emails, and how to sign out." />
      <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="o-card o-in-view p-4 sm:p-7">
          <p className="o-label mb-4">Email alerts</p>
          <SettingsForm initial={settings} />
        </section>
        <aside className="grid gap-5 lg:self-start">
          <section className="o-card o-in-view p-4 sm:p-6" style={{ animationDelay: "80ms" }}>
            <p className="o-label mb-3">This device</p>
            <p className="text-[0.95rem] text-[var(--o-soft)]">You stay signed in on this phone or computer for two months. Sign out here if it is not yours.</p>
            <form action={logoutAction} className="mt-5">
              <button type="submit" className="btn btn-line w-full">
                Sign out
              </button>
            </form>
          </section>
          <section className="o-card o-in-view p-4 sm:p-6" style={{ animationDelay: "120ms" }}>
            <p className="o-label mb-3">Your website</p>
            <p className="text-[0.95rem] text-[var(--o-soft)]">Everything you save here appears on the website within a minute.</p>
            <a href="/" target="_blank" rel="noopener" className="btn btn-ink mt-5 w-full">
              Open the website
            </a>
          </section>
        </aside>
      </div>
    </>
  );
}
