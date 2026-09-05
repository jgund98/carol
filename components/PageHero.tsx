import { Rise } from "./Reveal";
import PaintBlob from "./PaintBlob";

type Props = {
  kicker: string;
  title: string;
  text?: string;
  dark?: boolean;
  children?: React.ReactNode;
  /** two work slugs whose paint floats behind the title */
  art?: [string, string];
};

export default function PageHero({ kicker, title, text, dark = false, children, art = ["celestial-moonlight", "gardenia-goddess"] }: Props) {
  return (
    <section className={`relative overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-12 md:pt-[calc(var(--header-h)+5rem)] md:pb-16 ${dark ? "bg-midnight text-white" : ""}`}>
      <PaintBlob of={art[0]} shape={1} size="clamp(120px,18vw,300px)" className="-right-[12%] -top-[2%] md:-right-[6%]" focus={[0.5, 0.4]} speed={0.35} base={14} />
      <PaintBlob of={art[1]} shape={3} size="clamp(80px,10vw,160px)" className="right-[8%] bottom-[-6%] hidden md:block" focus={[0.5, 0.5]} speed={0.55} base={-20} />
      <div className="wrap relative">
        <p className={`display-light text-[1.05rem] italic ${dark ? "text-gold-2" : "text-ink/60"}`}>{kicker}</p>
        <Rise as="h1" text={title} className="display mt-4 max-w-4xl text-[clamp(2.6rem,6vw,5.4rem)]" />
        {text && <p className={`pretty mt-6 max-w-2xl text-[1.05rem] leading-relaxed md:text-[1.15rem] ${dark ? "text-white/70" : "text-ink/70"}`}>{text}</p>}
        {children}
      </div>
    </section>
  );
}
