// The photo guide, and how the office works, written to be read once on a phone.
import Link from "next/link";
import { PageHead } from "@/components/office/ui";

const PHOTO_STEPS = [
  {
    t: "Stand straight in front of it",
    d: "Hold the phone level with the middle of the canvas, not looking up or down at it. The edges of the canvas should be straight lines in the photo, not a wedge.",
    good: "straight",
  },
  {
    t: "Daylight, no flash",
    d: "Next to a window or outside in the shade is perfect. Turn off the flash; it makes thick paint shine white. If the room lights make a glare, move the piece or yourself a step.",
    good: "light",
  },
  {
    t: "Fill the frame, then leave a little room",
    d: "Get close enough that the canvas nearly fills the screen, with a finger's width of wall around it. In the next step you drag the pink corners to the exact edges and the wall disappears.",
    good: "fill",
  },
  {
    t: "Use the biggest photo your phone takes",
    d: "The normal camera app is right. Do not use a screenshot or a photo from a text message; those are small and will look soft on a big screen.",
    good: "size",
  },
  {
    t: "Tap the screen on the painting to focus",
    d: "Hold still for a second after tapping. If the phone offers 1x or 2x, use 1x and step closer instead of zooming.",
    good: "focus",
  },
];

export default function GuidePage() {
  return (
    <>
      <PageHead kicker="Photo guide" title="Photographing a piece so it fits perfectly." text="Five things, and every piece you add will look as good on the website as the ones already there." />

      <section className="grid gap-4">
        {PHOTO_STEPS.map((s, i) => (
          <article key={s.t} className="o-card o-in-view grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-7" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="o-num grid h-11 w-11 place-items-center rounded-full bg-[var(--o-ink)] text-[1.2rem] text-white">{i + 1}</span>
            <div>
              <h2 className="o-h2">{s.t}</h2>
              <p className="o-muted mt-2 text-[1rem] leading-relaxed">{s.d}</p>
            </div>
            <Illustration kind={s.good} />
          </article>
        ))}
      </section>

      <section className="o-card o-in-view mt-8 p-5 sm:p-7">
        <h2 className="o-h2">Sizes that work</h2>
        <p className="o-muted mt-2 text-[1rem] leading-relaxed">The website shows every piece at 1,600 pixels wide on its own page, 700 pixels in the shop grid, and lets people zoom in 2.4 times on the brushwork. So:</p>
        <ul className="mt-4 grid gap-3 text-[1rem] sm:grid-cols-3">
          <li className="o-card-soft p-4">
            <p className="o-label text-[var(--o-green)]">Best</p>
            <p className="mt-1 font-semibold">3,000 px or more</p>
            <p className="text-[0.9rem] text-[var(--o-soft)]">Any photo straight from your phone's camera. Nothing to do.</p>
          </li>
          <li className="o-card-soft p-4">
            <p className="o-label text-[var(--o-green)]">Good</p>
            <p className="mt-1 font-semibold">1,600 px across</p>
            <p className="text-[0.9rem] text-[var(--o-soft)]">Looks perfect everywhere; the zoom is a touch softer.</p>
          </li>
          <li className="o-card-soft p-4">
            <p className="o-label text-[var(--o-red)]">Too small</p>
            <p className="mt-1 font-semibold">Under 1,000 px</p>
            <p className="text-[0.9rem] text-[var(--o-soft)]">Screenshots, photos from text messages, old emails. Retake it.</p>
          </li>
        </ul>
        <p className="o-muted mt-4 text-[0.95rem]">Tall, wide or square all work; the shop hangs every piece at its true shape. The crop step tells you the size as you go.</p>
      </section>

      <section className="o-card o-in-view mt-5 p-5 sm:p-7">
        <h2 className="o-h2">Adding a piece, start to finish</h2>
        <ol className="mt-4 grid gap-3 text-[1rem] leading-relaxed">
          {[
            <>Tap <strong>Artwork</strong>, then <strong>Add a new piece</strong>.</>,
            <>Tap <strong>Take a photo</strong> (or choose one you already took). Drag the pink corners to the edges of the canvas and tap <strong>Looks right</strong>.</>,
            <>Type the <strong>title</strong> and the <strong>price</strong> in whole dollars.</>,
            <>Enter the <strong>width and height</strong> in inches and choose the <strong>medium</strong>. The short description writes itself, exactly like the other pieces.</>,
            <>Tick the <strong>collections</strong> it belongs to.</>,
            <>Tap <strong>Save and put it in the shop</strong>. It is live within a minute, at the top of the shop.</>,
          ].map((x, i) => (
            <li key={i} className="flex gap-3">
              <span className="o-num mt-0.5 w-6 shrink-0 text-[1.1rem] text-[var(--o-pink)]">{i + 1}</span>
              <span>{x}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-5 grid gap-3 sm:gap-5 lg:grid-cols-2">
        <article className="o-card o-in-view p-4 sm:p-7">
          <h2 className="o-h2">When a piece sells</h2>
          <p className="o-muted mt-2 text-[1rem] leading-relaxed">
            Open it under <strong>Artwork</strong>, tap <strong>Sold</strong>, save. It stays on the website with a Sold mark, which collectors like to see. If it sold through an order, the order page has a one-tap <strong>Mark it sold</strong> button.
          </p>
        </article>
        <article className="o-card o-in-view p-4 sm:p-7">
          <h2 className="o-h2">When an inquiry or order comes in</h2>
          <p className="o-muted mt-2 text-[1rem] leading-relaxed">
            You get an email, and a gold dot appears on <strong>Today</strong>, <strong>Inquiries</strong> or <strong>Orders</strong>. Open it, tap <strong>Call</strong>, <strong>Text</strong> or <strong>Email</strong> to reply, then mark it handled so it leaves your list.
          </p>
        </article>
        <article className="o-card o-in-view p-4 sm:p-7">
          <h2 className="o-h2">Changing a price or a description</h2>
          <p className="o-muted mt-2 text-[1rem] leading-relaxed">
            Under <strong>Artwork</strong>, tap the piece, change what you like, tap <strong>Save changes</strong>. The website updates itself.
          </p>
        </article>
        <article className="o-card o-in-view p-4 sm:p-7">
          <h2 className="o-h2">Not ready to show something yet?</h2>
          <p className="o-muted mt-2 text-[1rem] leading-relaxed">
            Set its status to <strong>Hidden</strong>. It is saved here but not on the website. Switch it to <strong>For sale</strong> whenever you are ready.
          </p>
        </article>
      </section>

      <p className="mt-8 text-center">
        <Link href="/office/artwork/new" className="btn btn-pink">
          Add a piece now
        </Link>
      </p>
    </>
  );
}

/** Tiny line drawings: the good way, in ink and hibiscus. */
function Illustration({ kind }: { kind: string }) {
  const stroke = "#12172b";
  const pink = "#e8397f";
  const gold = "#c9a24a";
  return (
    <svg viewBox="0 0 120 90" width="120" height="90" className="mx-auto shrink-0 sm:mx-0" aria-hidden>
      <rect x="1" y="1" width="118" height="88" rx="12" fill="#fbf9f5" stroke="rgba(18,23,43,0.08)" />
      {kind === "straight" && (
        <>
          <rect x="30" y="18" width="60" height="46" fill="#fff" stroke={stroke} strokeWidth="1.6" />
          <path d="M40 50c8-14 16 6 24-6s12 8 18-2" stroke={pink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="52" y="72" width="16" height="10" rx="2" fill={stroke} />
          <path d="M60 72V64" stroke={stroke} strokeWidth="1.5" strokeDasharray="2 2" />
        </>
      )}
      {kind === "light" && (
        <>
          <circle cx="24" cy="22" r="9" fill={gold} />
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1="24" y1="22" x2={24 + 16 * Math.cos((a * Math.PI) / 180)} y2={22 + 16 * Math.sin((a * Math.PI) / 180)} stroke={gold} strokeWidth="1.5" />
          ))}
          <rect x="48" y="26" width="52" height="40" fill="#fff" stroke={stroke} strokeWidth="1.6" />
          <path d="M56 54c8-12 14 4 22-6s10 6 16-1" stroke={pink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M20 66l12-6M20 76l12-6" stroke={stroke} strokeWidth="1.2" opacity="0.4" />
        </>
      )}
      {kind === "fill" && (
        <>
          <rect x="12" y="10" width="96" height="70" fill="#f4efe7" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 3" />
          <rect x="20" y="16" width="80" height="58" fill="#fff" stroke={stroke} strokeWidth="1.6" />
          <path d="M32 52c10-16 20 8 30-6s16 8 26-2" stroke={pink} strokeWidth="3" fill="none" strokeLinecap="round" />
          {[
            [20, 16],
            [100, 16],
            [20, 74],
            [100, 74],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#fff" stroke={pink} strokeWidth="2" />
          ))}
        </>
      )}
      {kind === "size" && (
        <>
          <rect x="18" y="14" width="84" height="62" fill="#fff" stroke={stroke} strokeWidth="1.6" />
          <path d="M28 52c12-18 22 8 34-6s18 8 30-2" stroke={pink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M18 82h84" stroke={stroke} strokeWidth="1.2" />
          <path d="M18 78v8M102 78v8" stroke={stroke} strokeWidth="1.2" />
          <text x="60" y="88" textAnchor="middle" fontSize="6" fill={stroke} fontFamily="system-ui" fontWeight="700">
            FULL SIZE
          </text>
        </>
      )}
      {kind === "focus" && (
        <>
          <rect x="24" y="16" width="72" height="54" fill="#fff" stroke={stroke} strokeWidth="1.6" />
          <path d="M34 50c10-16 18 6 28-6s14 6 24-1" stroke={pink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 34h-8v8M70 34h8v8M42 52v8h8M78 52v8h-8" stroke={gold} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
