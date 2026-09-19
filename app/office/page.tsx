// Sign in. One password, one big button. Nothing else to figure out.
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { isSignedIn, studioPassword, usingDevPassword } from "@/lib/studio/auth";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OfficeLogin({ searchParams }: { searchParams: Promise<{ wrong?: string }> }) {
  if (await isSignedIn()) redirect("/office/home");
  const { wrong } = await searchParams;
  const noPassword = !studioPassword();

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center px-5 py-12">
      <div className="o-card o-in-view w-full max-w-[26rem] p-7 sm:p-10">
        <Image src="/brand/sig-ink.png" alt="Carol Calicchio" width={420} height={132} className="h-auto w-[190px]" priority />
        <p className="o-label mt-6">Studio office</p>
        <h1 className="o-h1 mt-2">Welcome back, Carol.</h1>
        <p className="o-muted mt-3 text-[1rem]">Your inquiries, orders and shop, in one quiet room.</p>

        {noPassword ? (
          <p className="mt-8 rounded-2xl bg-[rgba(201,162,74,0.14)] p-4 text-[0.95rem]">
            The office password has not been set on the server yet. Jordan sets <code className="font-semibold">STUDIO_PASSWORD</code> once and this screen comes alive.
          </p>
        ) : (
          <form action={loginAction} className="mt-8 grid gap-5">
            <label className="o-field">
              <span>Your password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--o-faint)]" />
                <input name="password" type="password" required autoFocus autoComplete="current-password" className="o-in pl-12" placeholder="••••••••" />
              </div>
              {wrong && <span className="mt-2 block text-[0.95rem] font-semibold text-[var(--o-red)]">That password did not match. Try once more.</span>}
              {usingDevPassword() && <span className="o-help">Local preview: the password is “studio”.</span>}
            </label>
            <label className="flex items-center gap-3 text-[0.98rem]">
              <input type="checkbox" name="remember" defaultChecked className="h-5 w-5 accent-[var(--o-ink)]" />
              Keep me signed in on this device
            </label>
            <button type="submit" className="btn btn-ink w-full">
              Open the office <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <p className="mt-8 text-[0.86rem] text-[var(--o-faint)]">
          Forgot the password? Call or text Jordan and he will reset it for you.
        </p>
      </div>
      <Link href="/" className="mt-8 text-[0.95rem] font-semibold text-[var(--o-soft)] hover:text-[var(--o-ink)]">
        ← Back to the website
      </Link>
    </div>
  );
}
