import Link from "next/link";
import Image from "next/image";
import Easel from "@/components/Easel";
import Reveal, { Rise } from "@/components/Reveal";
import Ribbon from "@/components/Ribbon";
import BrushReveal from "@/components/BrushReveal";
import LightReveal from "@/components/LightReveal";
import GalleryWall from "@/components/GalleryWall";
import VideoPlayer from "@/components/VideoPlayer";
import WorkCard from "@/components/WorkCard";
import PaintBlob from "@/components/PaintBlob";
import Scribble from "@/components/Scribble";
import HeroTitle from "@/components/HeroTitle";
import { site, money } from "@/lib/site";
import { bySlug, heroSlugs, wallSlugs, inCollection, img, dims } from "@/lib/catalog";
import { collections, quotes, statement, process as processSteps, books } from "@/lib/content";

export default function Home() {
  const hero = heroSlugs.map(bySlug).filter(Boolean) as NonNullable<ReturnType<typeof bySlug>>[];
  const wall = wallSlugs.map(bySlug).filter(Boolean) as NonNullable<ReturnType<typeof bySlug>>[];
  const recent = inCollection("recent").filter((w) => !w.sold).slice(0, 5);
  const celestial = bySlug("celestial-moonlight")!;
  const featured = collections.slice(0, 3);
  const leans = [
    { rot: -6, y: "lg:mt-16", w: "lg:w-[30%]" },
    { rot: 3, y: "lg:-mt-6", w: "lg:w-[34%]" },
    { rot: -2.5, y: "lg:mt-24", w: "lg:w-[30%]" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[radial-gradient(90%_70%_at_70%_20%,#fff_0%,#fbf9f5_55%,#f4efe7_100%)] pt-[var(--header-h)]" aria-label="Carol Calicchio">
        <PaintBlob of="crystal" shape={1} size="clamp(120px,16vw,250px)" className="-right-[10%] top-[30%] lg:-right-[3%] lg:top-[9%]" focus={[0.3, 0.4]} speed={0.35} base={12} />
        <PaintBlob of="hummingbirds" shape={2} size="clamp(110px,14vw,220px)" className="hidden lg:block lg:left-[40%] lg:bottom-[8%]" focus={[0.6, 0.5]} speed={0.55} rotate={-0.6} base={-14} />
        <PaintBlob of="galaxy-of-love" shape={3} size="clamp(70px,8vw,120px)" className="left-[50%] top-[9%] hidden lg:block" focus={[0.5, 0.5]} speed={0.7} base={30} opacity={0.95} />
        <div className="wrap relative grid min-h-[calc(100svh-var(--header-h))] grid-cols-1 content-center gap-y-4 py-6 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-10 lg:py-6">
          <div className="lg:col-start-1 lg:self-end">
            <p className="display-light text-[1.05rem] italic text-ink/60">Carol Calicchio Art Studio, Delray Beach</p>
            <HeroTitle />
          </div>
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Easel works={hero} className="mx-auto w-full max-w-[min(100%,300px)] sm:max-w-[420px] lg:max-w-[560px]" />
          </div>
          <div className="lg:col-start-1 lg:self-start">
            <p className="pretty max-w-[33rem] text-[1.02rem] leading-relaxed text-ink/75 md:text-[1.12rem]">
              Abstract florals and seascapes from Delray Beach. Thick paint, big canvases, South Florida light. The one on the easel is real. Turn&nbsp;it&nbsp;around.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/shop" className="btn btn-ink">
                See the collection
              </Link>
              <Link href="/studio#visit" className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
                Book a studio visit
                <span className="h-px w-8 bg-ink/40 transition-all group-hover:w-12 group-hover:bg-ink" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Ribbon items={[...site.featuredIn.map((f) => `Featured in ${f}`), ...site.onView.map((v) => `On view at ${v}`)]} />

      {/* MEET CAROL */}
      <section className="relative overflow-hidden bg-paper">
        <PaintBlob of="palm-beach-blooms" shape={0} size="clamp(160px,22vw,340px)" className="-right-[8%] -top-[6%]" focus={[0.4, 0.3]} speed={0.3} base={-8} />
        <PaintBlob of="morning-white" shape={2} size="clamp(90px,12vw,180px)" className="left-[-4%] bottom-[8%] hidden md:block" focus={[0.5, 0.6]} speed={0.5} base={20} />
        <div className="wrap section relative grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal variant="scale" className="relative mx-auto w-full max-w-[420px]">
            <div className="rotate-[-2deg]">
              <VideoPlayer src="carol-talks" sound className="wrap-edge aspect-[4/5]" />
            </div>
            <p className="mt-4 text-center text-xs text-muted">Carol in the studio, loading the brush. Tap for sound.</p>
          </Reveal>
          <Reveal delay={100}>
            <Image src="/brand/sig-ink.png" alt="Carol Calicchio" width={420} height={132} className="h-auto w-[260px] md:w-[340px]" priority />
            <p className="pretty mt-6 max-w-[38rem] text-[1.08rem] leading-[1.7] text-ink/80 md:text-[1.18rem]">
              A Fairfield County native and one of South Florida&rsquo;s leading contemporary artists. Carol studied interior design at the New York School of Interior Design, then painting and drawing at the School of Visual Arts, and found her real subject in the art she had been curating for other people&rsquo;s homes. Her paintings hang in private collections from Palm Beach to Nantucket and New York.
            </p>
            <blockquote className="mt-8 border-l-2 border-hibiscus pl-5">
              <p className="display-light text-[clamp(1.3rem,2.2vw,1.7rem)] leading-snug">&ldquo;{quotes[0].text}&rdquo;</p>
              <p className="mt-2 text-xs text-muted">Carol, in Dan&rsquo;s Papers</p>
            </blockquote>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/about" className="btn btn-line">
                Her story
              </Link>
              <a href={site.social.instagram} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
                {site.social.instagramHandle}
                <span className="h-px w-8 bg-ink/40 transition-all group-hover:w-12 group-hover:bg-ink" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COLLECTIONS: canvases leaning against the wall */}
      <section className="relative overflow-hidden">
        <PaintBlob of="the-provider" shape={3} size="clamp(110px,16vw,240px)" className="-right-[8%] top-[1%] md:right-[2%] md:top-[4%]" focus={[0.5, 0.4]} speed={0.45} base={16} />
        <div className="wrap section relative">
          <div className="max-w-3xl">
            <p className="display-light text-[1.05rem] italic text-ink/60">The collections</p>
            <h2 className="display mt-3 text-[clamp(2.3rem,5vw,4.4rem)]">
              Three ways into the <Scribble>light.</Scribble>
            </h2>
            <p className="pretty mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink/70">Leaning against the studio wall, the way they wait between shows. Pick one up.</p>
          </div>

          <div className="mt-14 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-0">
            {featured.map((c, i) => {
              const w = bySlug(c.hero)!;
              const L = leans[i];
              return (
                <Reveal key={c.slug} delay={i * 140} className={`${L.w} ${L.y}`}>
                  <Link href={`/collections/${c.slug}`} className="lean group block" style={{ transform: `rotate(${L.rot}deg)` }} data-cursor="Enter" data-cursor-color={w.color}>
                    <div className="wrap-edge overflow-hidden bg-linen" style={{ aspectRatio: "4 / 5" }}>
                      <BrushReveal src={img(w)} alt={`${w.name}, from the ${c.name} collection`} className="h-full w-full" />
                    </div>
                    <div className="mt-5 flex items-baseline justify-between gap-3">
                      <h3 className="display text-[2rem] leading-none">{c.name}</h3>
                      <span className="text-xs font-semibold tracking-[0.16em] text-muted">{c.kicker.toUpperCase()}</span>
                    </div>
                    <p className="pretty mt-3 text-[0.95rem] leading-relaxed text-ink/70">{c.blurb}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIGHT */}
      <section className="relative overflow-hidden bg-[#0b1226] text-white">
        <PaintBlob of="celestial-seasons" shape={1} size="clamp(140px,18vw,300px)" className="-left-[6%] -bottom-[6%]" focus={[0.5, 0.5]} speed={0.35} base={-18} opacity={0.9} />
        <div className="wrap section relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="display-light text-[1.05rem] italic text-gold-2">Her philosophy on light</p>
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
            <p className="mt-3 text-center text-xs text-white/45">Drag a finger across the painting to bring the light</p>
          </Reveal>
        </div>
      </section>

      {/* WALL */}
      <section className="bg-paper">
        <GalleryWall works={wall} />
      </section>

      {/* STUDIO */}
      <section className="relative overflow-hidden">
        <PaintBlob of="southern-cross" shape={0} size="clamp(120px,16vw,260px)" className="-right-[5%] top-[10%]" focus={[0.5, 0.3]} speed={0.4} base={8} />
        <div className="wrap section relative grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal className="order-2 lg:order-1">
            <div className="grid grid-cols-[1fr_0.7fr] gap-4">
              <div className="rotate-[-1.5deg]">
                <VideoPlayer src="studio-tour" sound className="wrap-edge aspect-[9/16] rounded-sm" caption="Studio tour" />
              </div>
              <div className="grid gap-4 pt-8">
                <div className="wrap-edge relative aspect-[4/5] rotate-[2deg] overflow-hidden">
                  <Image src="/photos/carol-easel-portrait.jpg" alt="Carol Calicchio beside a painting on her easel" fill sizes="(min-width:1024px) 20vw, 35vw" className="object-cover" />
                </div>
                <div className="rotate-[-2deg]">
                  <VideoPlayer src="paint-close" className="wrap-edge aspect-[4/5]" />
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="display-light text-[1.05rem] italic text-ink/60">The studio, Delray Beach</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]">
A gallery of <Scribble>her own.</Scribble>
            </h2>
            <p className="pretty mt-5 text-[1.02rem] leading-relaxed text-ink/75">
              Carol Calicchio Art Studio, {site.studio.street}, {site.studio.city}: a white, light-filled gallery with Ketra lighting in the ceiling tracks, a working studio behind it, and room to hang the oversized canvases the way they are meant to be seen.
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
      <section className="relative overflow-hidden bg-midnight text-white">
        <PaintBlob of="golden-gardenia" shape={2} size="clamp(120px,15vw,240px)" className="-right-[6%] -bottom-[10%]" focus={[0.5, 0.5]} speed={0.4} base={-10} />
        <div className="wrap section relative">
          <div className="max-w-2xl">
            <p className="display-light text-[1.05rem] italic text-gold-2">In the studio</p>
            <Rise text="Thick paint, loaded brush, healing stones." className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]" />
            <p className="pretty mt-5 text-[1rem] leading-relaxed text-white/70">
              The White Series is sculpted rather than painted: gardenias and butterflies built in impasto with rose quartz and amethyst set into the surface. The florals are a loaded brush over museum-quality Fredrix canvas. Watch how a canvas comes to life.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {processSteps.map((p, i) => (
              <Reveal key={p.video} delay={i * 100} className={i === 1 ? "md:mt-12" : ""}>
                <div style={{ transform: `rotate(${[-1.5, 1.2, -1][i]}deg)` }}>
                  <VideoPlayer src={p.video} sound={p.video === "loaded-brush"} className="wrap-edge aspect-[9/16] rounded-md" />
                </div>
                <h3 className="display mt-6 text-[1.5rem]">{p.title}</h3>
                <p className="pretty mt-2 text-[0.95rem] leading-relaxed text-white/65">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT WORK: broken grid */}
      <section className="relative overflow-hidden">
        <PaintBlob of="alluring-light" shape={3} size="clamp(110px,14vw,220px)" className="-left-[5%] top-[30%]" focus={[0.5, 0.4]} speed={0.5} base={22} />
        <div className="wrap section relative">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="display-light text-[1.05rem] italic text-ink/60">Recent work</p>
              <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]">
                Fresh off the <Scribble>easel.</Scribble>
              </h2>
            </div>
            <Link href="/collections/recent-work" className="btn btn-line">
              See all recent work
            </Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-12 md:gap-x-8 md:gap-y-4">
            {recent[0] && (
              <Reveal className="md:col-span-7 md:row-span-2">
                <Link href={`/shop/${recent[0].slug}`} className="group block" data-cursor="View" data-cursor-color={recent[0].color}>
                  <div className="wrap-edge relative overflow-hidden bg-linen" style={{ aspectRatio: `${recent[0].iw} / ${recent[0].ih}` }}>
                    <Image src={img(recent[0])} alt={`${recent[0].name} by Carol Calicchio`} fill sizes="(min-width:768px) 55vw, 100vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <p className="display text-[1.6rem] leading-tight">{recent[0].name}</p>
                    <p className="text-sm font-semibold">{money(recent[0].price)}</p>
                  </div>
                  <p className="text-xs text-muted">
                    {dims(recent[0])} · {recent[0].medium}
                  </p>
                </Link>
              </Reveal>
            )}
            {recent.slice(1, 5).map((w, i) => (
              <Reveal key={w.slug} delay={i * 90} className={`md:col-span-5 ${i === 0 ? "md:mt-16" : i === 2 ? "md:-mt-10" : ""} ${i % 2 === 1 ? "md:ml-12" : "md:mr-12"}`}>
                <WorkCard work={w} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SURFBOARDS + BOOKS */}
      <section className="relative overflow-hidden bg-paper">
        <div className="wrap section relative grid gap-14 lg:grid-cols-2">
          <Reveal className="grid gap-6 sm:grid-cols-[0.8fr_1fr] sm:items-center">
            <div className="rotate-[-2deg]">
              <VideoPlayer src="breakers" sound className="wrap-edge aspect-[9/16] rounded-sm" caption="The Breakers, Palm Beach" />
            </div>
            <div>
              <p className="display-light text-[1.05rem] italic text-ink/60">Surfboards, with Nomad Surf Shop</p>
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
              <p className="display-light text-[1.05rem] italic text-ink/60">Two volumes</p>
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
      <section className="relative overflow-hidden">
        <PaintBlob of="hummingbird-bliss" shape={0} size="clamp(140px,18vw,280px)" className="-right-[6%] -top-[4%]" focus={[0.5, 0.5]} speed={0.35} base={-12} />
        <PaintBlob of="crystal" shape={2} size="clamp(90px,11vw,170px)" className="left-[3%] bottom-[6%]" focus={[0.4, 0.6]} speed={0.55} base={24} />
        <div className="wrap section relative">
          <p className="display-light text-center text-[1.05rem] italic text-ink/60">In their words</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[quotes[2], quotes[4], quotes[0]].map((q, i) => (
              <Reveal key={i} delay={i * 100} className={`rounded-sm bg-white/70 p-7 shadow-[0_20px_50px_-30px_rgba(18,23,43,0.35)] backdrop-blur-sm ${i === 1 ? "md:-mt-8" : "md:mt-6"}`}>
                <div style={{ transform: `rotate(${[-1.2, 0.8, -0.6][i]}deg)` }}>
                  <p className="display-light text-[1.35rem] leading-snug">“{q.text}”</p>
                  <p className="mt-4 text-sm font-semibold">{q.by}</p>
                  <p className="text-xs text-muted">{q.source}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMMISSIONS */}
      <section className="relative overflow-hidden bg-paper">
        <PaintBlob of="gardenia-goddess" shape={1} size="clamp(110px,14vw,220px)" className="-left-[6%] top-[8%] hidden md:block" focus={[0.5, 0.5]} speed={0.3} base={10} />
        <div className="wrap section relative grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal variant="scale" className="relative mx-auto w-full max-w-[560px]">
            <div className="wrap-edge relative aspect-[4/3] rotate-[-1.5deg] overflow-hidden bg-linen">
              <Image src="/photos/bedroom-install.jpg" alt="A commissioned Carol Calicchio painting hung above a bed in a collector's home" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover object-[60%_50%]" />
            </div>
            <p className="mt-4 text-center text-xs text-muted">A White Series commission, at home.</p>
          </Reveal>
          <Reveal delay={100}>
            <p className="display-light text-[1.05rem] italic text-ink/60">Commissions</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]">Painted for <Scribble>your</Scribble> wall.</h2>
            <p className="pretty mt-5 max-w-xl text-[1.02rem] leading-relaxed text-ink/75">
              Send Carol a photo of the room. She paints oversized oil and acrylic canvases to its light and palette, from 48 inches to a 74 × 96 in. Fredrix canvas. Recent commissions include Wave of Time, a 48 × 60 seascape, and HOME, a 72 × 48 White Series with amethyst and rose quartz set into the paint.
            </p>
            <blockquote className="mt-6 border-l-2 border-hibiscus pl-5">
              <p className="display-light text-[1.25rem] leading-snug">&ldquo;{quotes[4].text}&rdquo;</p>
              <p className="mt-1 text-xs text-muted">{quotes[4].by}, on receiving Wave of Time</p>
            </blockquote>
            <Link href="/commissions" className="group mt-8 inline-flex items-center gap-3 text-[1.05rem] font-semibold text-ink">
              Start a commission
              <span className="h-px w-10 bg-ink/40 transition-all group-hover:w-16 group-hover:bg-ink" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
