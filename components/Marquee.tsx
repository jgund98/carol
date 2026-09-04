export default function Marquee({ items, label, dark = false }: { items: readonly string[]; label?: string; dark?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y ${dark ? "border-white/10" : "border-ink/10"}`} aria-label={label}>
      <div className="marquee items-center py-5">
        {row.map((t, i) => (
          <span key={i} className={`flex items-center gap-8 pr-8 ${dark ? "text-white/80" : "text-ink/75"}`} aria-hidden={i >= items.length}>
            <span className="display whitespace-nowrap text-[1.15rem] md:text-[1.35rem]">{t}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-gold-2" : "bg-hibiscus"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
