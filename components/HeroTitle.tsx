/**
 * "Art that changes the energy of a room."
 * Set in three voices: upright Bodoni, then "energy" oversized in italic and filled with
 * Celestial Moonlight itself, sitting on a smear of hibiscus paint, with the brush that made it.
 */
export default function HeroTitle() {
  return (
    <h1 className="display relative mt-3 text-[clamp(2.9rem,5.4vw,4.8rem)] leading-[0.94] lg:mt-5" aria-label="Art that changes the energy of a room.">
      <span className="block">Art that changes</span>
      <span className="block">
        <span className="mr-[0.22em] align-baseline text-[0.62em] font-normal italic text-ink/70">the</span>
        <span className="relative inline-block align-baseline [isolation:isolate]">
          {/* paint smear behind the word */}
          <span className="hero-smear pointer-events-none absolute left-[-14%] top-[14%] z-0 block h-[1.1em] w-[128%] lg:left-[-6%] lg:top-[22%] lg:h-[0.9em] lg:w-[112%]" aria-hidden>
          <svg viewBox="-40 0 480 60" className="block h-full w-full overflow-visible" style={{ transform: "rotate(-2deg)" }}>
            <defs>
              <mask id="hero-smear-mask" maskUnits="userSpaceOnUse" x="-40" y="-10" width="480" height="80">
                <g>
                  {/* one stroke: bristles land on the left, the pull thins out and lifts off on the right */}
                  <path d="M-22 30 C -12 20, 6 12, 32 13 C 58 5, 80 17, 104 10 C 130 4, 152 16, 178 9 C 204 3, 226 15, 252 9 C 278 4, 300 15, 326 9 C 350 5, 372 12, 396 10 C 412 9, 426 12, 434 15 C 428 20, 414 25, 396 28 C 366 34, 336 30, 306 36 C 276 42, 250 34, 224 42 C 196 50, 170 40, 144 47 C 118 54, 94 44, 70 50 C 48 55, 26 51, 8 46 C -6 42, -20 38, -22 30 Z" fill="white" />
                  {/* dry gap where the paint ran thin */}
                  <path d="M150 44 C 190 40, 230 43, 270 38 L 270 40 C 230 45, 190 42, 150 46 Z" fill="black" />
                  <path d="M40 22 C 70 20, 100 23, 130 19 L 130 21 C 100 25, 70 22, 40 24 Z" fill="black" opacity="0.6" />
                </g>
              </mask>
            </defs>
            <g mask="url(#hero-smear-mask)">
              <rect x="-40" y="-10" width="480" height="80" fill="#e8397f" />
              <path d="M14 20 C 60 12, 120 20, 180 14 C 240 8, 300 16, 380 10 L 380 13 C 300 20, 240 12, 180 18 C 120 24, 60 16, 14 24 Z" fill="#fff" opacity="0.26" />
              <path d="M20 40 C 70 46, 130 38, 200 44 C 260 49, 320 40, 372 30 L 372 33 C 320 44, 260 53, 200 48 C 130 42, 70 50, 20 44 Z" fill="#000" opacity="0.14" />
            </g>
          </svg>
          </span>
          {/* transform lives on the wrapper: background-clip:text breaks on a composited element */}
          <span className="relative z-10 inline-block" style={{ transform: "rotate(-2deg)" }}>
            <em className="paint-text -mb-[0.32em] -mt-[0.12em] inline-block pb-[0.32em] pr-[0.08em] pt-[0.12em] text-[1.28em] font-normal italic leading-[0.9] tracking-[-0.01em]">energy</em>
          </span>
          {/* the brush that made it, tip at the end of the stroke */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/brush.png"
            alt=""
            aria-hidden
            width={1400}
            height={815}
            className="hero-brush pointer-events-none absolute left-[92%] top-[-40%] z-20 block w-[2.3em] origin-[8%_80%] lg:left-[90%] lg:top-[-62%] lg:w-[2.6em]"
            draggable={false}
          />
        </span>
      </span>
      <span className="block">of a room.</span>
    </h1>
  );
}
