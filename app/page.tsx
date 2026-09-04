import Link from "next/link";
import Image from "next/image";
import Easel from "@/components/Easel";
import Reveal, { Rise } from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import BrushReveal from "@/components/BrushReveal";
import LightReveal from "@/components/LightReveal";
import GalleryWall from "@/components/GalleryWall";
import VideoPlayer from "@/components/VideoPlayer";
import WorkCard from "@/components/WorkCard";
import { site } from "@/lib/site";
import { bySlug, heroSlugs, wallSlugs, inCollection, img } from "@/lib/catalog";
import { collections, quotes, statement, process as processSteps, books } from "@/lib/content";

export default function Home() {
  const hero = heroSlugs.map(bySlug).filter(Boolean) as NonNullable<ReturnType<typeof bySlug>>[];
  const wall = wallSlugs.map(bySlug).filter(Boolean) as NonNullable<ReturnType<typeof bySlug>>[];
  const recent = inCollection("recent").filter((w) => !w.sold).slice(0, 4);
  const celestial = bySlug("celestial-moonlight")!;
  const featured = collections.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[radial-gradient(90%_70%_at_70%_20%,#fff_0%,#fbf9f5_55%,#f4efe7_100%)] pt-[var(--header-h)]" aria-label="Carol Calicchio">
        <div className="wrap grid min-h-[calc(100svh-var(--header-h))] grid-cols-1 content-center gap-y-5 py-6 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-10 lg:py-6">
          <div className="lg:col-start-1 lg:self-end">
            <p className="label text-hibiscus">Abstract artist · Palm Beach, Florida</p>
            <h1 className="display mt-3 text-[clamp(2.9rem,7.2vw,6.4rem)] leading-[0.98] lg:mt-4">
              Light,<br className="hidden lg:block" /> <em>in bloom.</em>
            </h1>
          </div>
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Easel works={hero} className="mx-auto w-full max-w-[min(100%,300px)] sm:max-w-[420px] lg:max-w-[560px]" />
          </div>
          <div className="lg:col-start-1 lg:self-start">
            <p className="pretty max-w-[34rem] text-[1.02rem] leading-relaxed text-ink/75 md:text-[1.15rem]">
              Original abstract florals and seascapes painted in Delray Beach and collected from Palm Beach to New York. Turn the canvas to read its label. Hover to see it breathe.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-ink">
                Explore the collection
              </Link>
              <Link href="/studio#visit" className="btn btn-line">
                Visit the new studio
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] text-muted">
              <span>Flower Power · Blue Series · White Series</span>
              <span className="hidden h-1 w-1 rounded-full bg-hibiscus sm:block" />
              <span>Two published volumes</span>
              <span className="hidden h-1 w-1 rounded-full bg-hibiscus sm:block" />
              <span>Studio visits by appointment</span>
            </div>
          </div>
        </div>
      </section>

      <Marquee label="Featured in" items={[...site.featuredIn.map((f) => `Featured in ${f}`), ...site.onView.map((v) => `On view at ${v}`)]} />

      {/* COLLECTIONS */}
      <section className="section">
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="label text-hibiscus">The collections</p>
              <Rise text="Three ways into the light." className="display mt-3 text-[clamp(2.3rem,5vw,4.4rem)]" />
            </div>
            <Link href="/collections" className="btn btn-line self-start lg:self-auto">
              All collections
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featured.map((c, i) => {
              const w = bySlug(c.hero)!;
              return (
                <Reveal key={c.slug} delay={i * 120}>
                  <Link href={`/collections/${c.slug}`} className="group block" data-cursor="Enter" data-cursor-color={w.color}>
                    <div className="wrap-edge overflow-hidden bg-linen" style={{ aspectRatio: "4 / 5" }}>
                      <BrushReveal src={img(w)} alt={`${w.name}, from the ${c.name} collection`} className="h-full w-full transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]" />
                    </div>
                    <p className="label mt-6 text-muted">{c.kicker}</p>
                    <h3 className="display mt-2 text-[2rem] leading-none">{c.name}</h3>
                    <p className="pretty mt-3 text-[0.95rem] leading-relaxed text-ink/70">{c.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      Enter the series
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIGHT */}
      <section className="relative bg-[#0b1226] text-white">
        <div className="wrap section grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="label text-gold-2">Her philosophy on light</p>
            <blockquote className="display-light mt-5 text-[clamp(1.7rem,3.2vw,2.8rem)] leading-[1.15] text-white">“{statement.quote}”</blockquote>
            <p className="mt-5 text-sm text-white/60">{statement.by}</p>
            <p className="pretty mt-8 max-w-md text-[0.98rem] leading-relaxed text-white/70">
              Move your hand across <em className="text-white">{celestial.name}</em>. Painted the morning after a midsummer walk on the beach, it became the cover of Dan&rsquo;s Papers. In the dark the flowers wait. In the light they float.
            </p>
            <Link href={`/shop/${celestial.slug}`} className="btn btn-line-white mt-8">
              See {celestial.name}
            </Link>
          </Reveal>
          <Reveal variant="scale" className="mx-auto w-full max-w-[640px]">
            <LightReveal work={celestial} className="wrap-edge" />
            <p className="mt-3 text-center text-xs text-white/45">Touch or hover to bring the light</p>
          </Reveal>
        </div>
      </section>

      {/* WALL */}
      <section className="bg-paper">
        <GalleryWall works={wall} />
      </section>

      {/* STUDIO */}
      <section className="section">
        <div className="wrap grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal className="order-2 lg:order-1">
            <div className="grid grid-cols-[1fr_0.7fr] gap-4">
              <VideoPlayer src="studio-tour" sound className="wrap-edge aspect-[9/16] rounded-sm" caption="Studio tour, August 2026" />
              <div className="grid gap-4">
                <div className="wrap-edge relative aspect-[4/5] overflow-hidden">
                  <Image src="/photos/carol-easel-portrait.jpg" alt="Carol Calicchio beside a painting on her easel" fill sizes="(min-width:1024px) 20vw, 35vw" className="object-cover" />
                </div>
                <VideoPlayer src="paint-close" className="wrap-edge aspect-[4/5]" />
              </div>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="label text-hibiscus">The new studio · Delray Beach</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]">A gallery of her own, finished this summer.</h2>
            <p className="pretty mt-5 text-[1.02rem] leading-relaxed text-ink/75">
              In August 2026 Carol opened Carol Calicchio Art Studio at {site.studio.street}, {site.studio.city}: a white, light-filled gallery with Ketra lighting in the ceiling tracks, a working studio behind it, and room to hang the oversized canvases the way they are meant to be seen.
            </p>
            <p className="pretty mt-4 text-[1.02rem] leading-relaxed text-ink/75">
              Collectors, designers and art enthusiasts are welcome by appointment. Bring the room in your head; Carol will show you what changes it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/studio#visit" className="btn btn-ink">
                Book a private viewing
              </Link>
              <a href={site.phoneHref} className="btn btn-line">
                Call {site.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-midnight text-white">
        <div className="wrap section">
          <div className="max-w-2xl">
            <p className="label text-gold-2">In the studio</p>
            <Rise text="Thick paint, loaded brush, healing stones." className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]" />
            <p className="pretty mt-5 text-[1rem] leading-relaxed text-white/70">
              The White Series is sculpted rather than painted: gardenias and butterflies built in impasto with rose quartz and amethyst set into the surface. The florals are a loaded brush over museum-quality Fredrix canvas. Watch how a canvas comes to life.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {processSteps.map((p, i) => (
              <Reveal key={p.video} delay={i * 100}>
                <VideoPlayer src={p.video} sound={p.video === "loaded-brush"} className="aspect-[9/16] rounded-md" />
                <h3 className="display mt-5 text-[1.5rem]">{p.title}</h3>
                <p className="pretty mt-2 text-[0.95rem] leading-relaxed text-white/65">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT WORK */}
      <section className="section">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label text-hibiscus">Recent work</p>
              <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]">Fresh off the easel.</h2>
            </div>
            <Link href="/collections/recent-work" className="btn btn-line">
              See all recent work
            </Link>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((w, i) => (
              <Reveal key={w.slug} delay={i * 90}>
                <WorkCard work={w} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SURFBOARDS + BOOKS */}
      <section className="bg-paper">
        <div className="wrap section grid gap-14 lg:grid-cols-2">
          <Reveal className="grid gap-6 sm:grid-cols-[0.8fr_1fr] sm:items-center">
            <VideoPlayer src="breakers" sound className="wrap-edge aspect-[9/16] rounded-sm" caption="The Breakers, Palm Beach" />
            <div>
              <p className="label text-hibiscus">Surfboards · with Nomad Surf Shop</p>
              <h2 className="display mt-3 text-[clamp(2rem,3.4vw,3rem)]">Paintings you can ride.</h2>
              <p className="pretty mt-4 text-[0.98rem] leading-relaxed text-ink/75">
                Limited-edition boards made with Boynton Beach&rsquo;s Nomad Surf Shop, open since 1968, printed from the Flower Power paintings. Displayed at The Shops at The Breakers this past season, and built to be surfed by anyone who prefers a chic and stylish ride.
              </p>
              <Link href="/surfboards" className="btn btn-ink mt-6">
                The surfboards
              </Link>
            </div>
          </Reveal>
          <Reveal className="grid gap-6 sm:grid-cols-[0.8fr_1fr] sm:items-center" delay={120}>
            <div className="relative aspect-[9/16]">
              <div className="wrap-edge absolute left-0 top-[8%] w-[72%] rotate-[-6deg] overflow-hidden bg-linen" style={{ aspectRatio: "1" }}>
                <Image src={img(bySlug(books[0].slug)!)} alt="Flower Power, the paintings of Carol Calicchio" fill sizes="30vw" className="object-cover" />
              </div>
              <div className="wrap-edge absolute bottom-[8%] right-0 w-[72%] rotate-[5deg] overflow-hidden bg-linen" style={{ aspectRatio: "1" }}>
                <Image src={img(bySlug(books[1].slug)!)} alt="Ocean Power, the paintings of Carol Calicchio" fill sizes="30vw" className="object-cover" />
              </div>
            </div>
            <div>
              <p className="label text-hibiscus">Two volumes</p>
              <h2 className="display mt-3 text-[clamp(2rem,3.4vw,3rem)]">Flower Power &amp; Ocean Power.</h2>
              <p className="pretty mt-4 text-[0.98rem] leading-relaxed text-ink/75">
                Hardcover monographs written by Bruce Helander with essays by British critic Anthony Haden-Guest and Elizabeth Sobieski, published with the Historical Society of Palm Beach County. The Palm Beach signing sold out.
              </p>
              <Link href="/books" className="btn btn-ink mt-6">
                The books
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WORDS */}
      <section className="section">
        <div className="wrap">
          <p className="label text-center text-hibiscus">In their words</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[quotes[2], quotes[4], quotes[0]].map((q, i) => (
              <Reveal key={i} delay={i * 100} className="border-t border-ink/15 pt-6">
                <p className="display-light text-[1.35rem] leading-snug">“{q.text}”</p>
                <p className="mt-4 text-sm font-semibold">{q.by}</p>
                <p className="text-xs text-muted">{q.source}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMMISSION BAND */}
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src="/photos/carol-living-room.jpg" alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,23,43,0.95),rgba(18,23,43,0.6))]" />
        <div className="wrap section relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="label text-gold-2">Commissions</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]">The painting your wall has been waiting for.</h2>
            <p className="pretty mt-5 max-w-xl text-[1.02rem] leading-relaxed text-white/75">
              Oversized oil and acrylic canvases painted to your room, your light and your palette, from 48 inches to a 74 × 96 in. Fredrix canvas. Recent commissions include Wave of Time, a 48 × 60 seascape, and HOME, a 72 × 48 White Series with embedded amethyst and rose quartz.
            </p>
          </Reveal>
          <Reveal delay={120} className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/commissions" className="btn btn-pink">
              Start a commission
            </Link>
            <Link href="/contact" className="btn btn-line-white">
              Talk to Carol
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
