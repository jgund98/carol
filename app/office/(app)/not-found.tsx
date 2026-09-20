import Link from "next/link";

export default function OfficeNotFound() {
  return (
    <div className="o-card mx-auto mt-10 max-w-md p-6 text-center sm:p-8">
      <p className="o-h2">That page is not here.</p>
      <p className="o-muted mt-2 text-[0.98rem]">It may have been removed, or the link is old.</p>
      <Link href="/office/home" className="btn btn-ink mt-6">
        Back to Today
      </Link>
    </div>
  );
}
