// Shown for the moment between a tap and the next screen, so taps always answer.
export default function Loading() {
  return (
    <div className="o-in-view" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-40 rounded-full bg-[rgba(18,23,43,0.06)]" />
      <div className="mt-3 h-9 w-72 max-w-full rounded-full bg-[rgba(18,23,43,0.08)]" />
      <div className="o-card mt-7 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="o-row">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(18,23,43,0.06)]" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-1/2 rounded-full bg-[rgba(18,23,43,0.07)]" />
              <div className="mt-2 h-3 w-4/5 rounded-full bg-[rgba(18,23,43,0.05)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
