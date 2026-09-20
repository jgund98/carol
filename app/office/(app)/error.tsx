"use client";
import Link from "next/link";

export default function OfficeError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="o-card mx-auto mt-10 max-w-md p-6 text-center sm:p-8">
      <p className="o-h2">Something went wrong.</p>
      <p className="o-muted mt-2 text-[0.98rem]">Nothing was changed. Try again, or go back to Today.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={reset} className="btn btn-ink">
          Try again
        </button>
        <Link href="/office/home" className="btn btn-line">
          Today
        </Link>
      </div>
    </div>
  );
}
