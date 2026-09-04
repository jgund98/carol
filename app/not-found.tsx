import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[100svh] place-items-center pt-[var(--header-h)]">
      <div className="wrap max-w-xl py-16 text-center">
        <p className="label text-hibiscus">404</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4.6rem)]">This wall is empty.</h1>
        <p className="mt-4 text-ink/70">The page you were after has moved or was never hung.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-ink">See the collection</Link>
          <Link href="/" className="btn btn-line">Home</Link>
        </div>
      </div>
    </section>
  );
}
