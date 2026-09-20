// Sign in. A painting on the wall, her signature, a name and a password.
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Lock, User } from "lucide-react";
import { isSignedIn } from "@/lib/studio/auth";
import { loginAction } from "@/app/office/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ wrong?: string; next?: string }> }) {
  if (await isSignedIn()) redirect("/office/home");
  const { wrong, next } = await searchParams;

  return (
    <div className="office">
      <div className="relative min-h-[100svh] lg:grid lg:grid-cols-[1.1fr_1fr]">
        {/* the wall: a canvas hung in gallery light (desk only) */}
        <aside className="plaster relative hidden overflow-hidden lg:block">
          <div className="spot pointer-events-none absolute -top-[20%] left-1/2 h-[70%] w-[140%] -translate-x-1/2 opacity-80" />
          <div className="absolute inset-0 grid place-items-center p-16">
            <div className="wrap-edge relative w-[min(70%,560px)] overflow-hidden" style={{ aspectRatio: "1201 / 1600" }}>
              <Image src="/art/celestial-moonlight.jpg" alt="Celestial Moonlight by Carol Calicchio" fill priority sizes="40vw" className="object-cover" />
            </div>
          </div>
          <p className="display-light absolute bottom-10 left-12 max-w-sm text-[1.25rem] italic leading-snug text-ink/70">
            &ldquo;Art that changes the energy of a room.&rdquo;
          </p>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(18,23,43,0.08))]" />
        </aside>

        {/* the form */}
        <main className="flex min-h-[100svh] flex-col items-center justify-center px-4 py-5 sm:px-10 sm:py-10">
          <div className="o-card o-in-view w-full max-w-[26rem] overflow-hidden">
            {/* phones: a strip of the painting above the form */}
            <div className="relative h-24 overflow-hidden lg:hidden">
              <Image src="/art/celestial-moonlight.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[50%_35%]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,23,43,0)_40%,rgba(255,255,255,0.92))]" />
            </div>
            <div className="p-5 sm:p-10 lg:pt-10">
              <Image src="/brand/sig-ink.png" alt="Carol Calicchio" width={420} height={132} className="-mt-1 h-auto w-[150px] sm:w-[200px] lg:mt-0" priority />
              <p className="o-label mt-3 sm:mt-5">Studio office</p>
              <h1 className="o-h1 mt-1">Sign in.</h1>

              <form action={loginAction} className="mt-4 grid gap-3.5 sm:mt-7 sm:gap-5">
                {next && next.startsWith("/office/") && <input type="hidden" name="next" value={next} />}
                <label className="o-field">
                  <span>Name</span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--o-faint)]" />
                    <input name="user" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} className="o-in o-in-icon" placeholder="Your name" />
                  </div>
                </label>
                <label className="o-field">
                  <span>Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--o-faint)]" />
                    <input name="password" type="password" required autoComplete="current-password" className="o-in o-in-icon" placeholder="••••••••" />
                  </div>
                  {wrong && <span className="mt-2 block text-[0.95rem] font-semibold text-[var(--o-red)]">That did not match. Check the name and password and try once more.</span>}
                </label>
                <label className="flex items-center gap-3 text-[0.98rem]">
                  <input type="checkbox" name="remember" defaultChecked className="h-5 w-5 accent-[var(--o-ink)]" />
                  Keep me signed in on this device
                </label>
                <button type="submit" className="btn btn-pink w-full">
                  Open the office <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
          <Link href="/" className="mt-5 text-[0.95rem] font-semibold text-[var(--o-soft)] hover:text-[var(--o-ink)]">
            ← Back to the website
          </Link>
        </main>
      </div>
    </div>
  );
}
