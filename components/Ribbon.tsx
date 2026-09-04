/** The press marquee as a tilted pink paint ribbon with ragged edges. */
export default function Ribbon({ items }: { items: readonly string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden bg-paper py-8 md:py-12" aria-label="Featured in">
      <div className="ribbon relative -rotate-[1.6deg] scale-x-[1.03] bg-hibiscus text-white shadow-[0_24px_50px_-24px_rgba(232,57,127,0.7)]">
        <div className="marquee items-center py-4 md:py-5">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-8 pr-8" aria-hidden={i >= items.length}>
              <span className="display whitespace-nowrap text-[1.1rem] md:text-[1.4rem]">{t}</span>
              <span className="h-2 w-2 rounded-full bg-white/70" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
