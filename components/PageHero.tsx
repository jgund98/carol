import { Rise } from "./Reveal";

export default function PageHero({ kicker, title, text, dark = false, children }: { kicker: string; title: string; text?: string; dark?: boolean; children?: React.ReactNode }) {
  return (
    <section className={`pt-[calc(var(--header-h)+3rem)] pb-12 md:pt-[calc(var(--header-h)+5rem)] md:pb-16 ${dark ? "bg-midnight text-white" : ""}`}>
      <div className="wrap">
        <p className={`label ${dark ? "text-gold-2" : "text-hibiscus"}`}>{kicker}</p>
        <Rise as="h1" text={title} className="display mt-4 max-w-4xl text-[clamp(2.6rem,6vw,5.4rem)]" />
        {text && <p className={`pretty mt-6 max-w-2xl text-[1.05rem] leading-relaxed md:text-[1.15rem] ${dark ? "text-white/70" : "text-ink/70"}`}>{text}</p>}
        {children}
      </div>
    </section>
  );
}
