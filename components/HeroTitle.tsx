/**
 * "Art that changes the energy of a room."
 * Set in three voices: upright Bodoni, then "energy" oversized in italic and filled with
 * Celestial Moonlight itself, sitting on a smear of hibiscus paint, with the brush that made it.
 */
export default function HeroTitle() {
  return (
    <h1 className="display relative mt-3 text-[clamp(2.6rem,5.4vw,4.8rem)] leading-[0.94] lg:mt-5" aria-label="Art that changes the energy of a room.">
      <span className="block">Art that changes</span>
      <span className="block">
        <span className="mr-[0.22em] align-baseline text-[0.62em] font-normal italic text-ink/70">the</span>
        <span className="relative inline-block align-baseline [isolation:isolate]">
          {/* paint smear behind the word */}
          <svg viewBox="0 0 400 60" className="hero-smear pointer-events-none absolute left-[-6%] top-[22%] z-0 h-[0.9em] w-[112%] overflow-visible" style={{ transform: "rotate(-2deg)" }} aria-hidden>
            <defs>
              <mask id="hero-smear-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="60">
                <path d="M8 30 C 4 18, 16 10, 30 12 C 48 6, 66 16, 88 10 C 112 4, 134 14, 158 9 C 184 4, 206 15, 232 10 C 258 5, 282 14, 308 9 C 332 5, 356 12, 380 9 C 390 8, 397 12, 398 17 C 396 24, 386 28, 372 31 C 348 36, 322 30, 296 36 C 268 42, 244 34, 218 41 C 190 48, 164 40, 138 46 C 112 52, 88 44, 64 49 C 44 53, 24 50, 14 44 C 8 40, 6 35, 8 30 Z" fill="white" />
                <path d="M330 8 C 352 6, 374 5, 399 4 L 399 7 C 374 8, 352 10, 330 12 Z" fill="white" />
                <path d="M338 32 C 360 31, 380 28, 399 24 L 399 27 C 380 31, 360 34, 338 36 Z" fill="white" />
                <path d="M150 44 C 190 40, 230 43, 270 38 L 270 40 C 230 45, 190 42, 150 46 Z" fill="black" />
              </mask>
            </defs>
            <g mask="url(#hero-smear-mask)">
              <rect width="400" height="60" fill="#e8397f" />
              <path d="M14 20 C 60 12, 120 20, 180 14 C 240 8, 300 16, 380 10 L 380 13 C 300 20, 240 12, 180 18 C 120 24, 60 16, 14 24 Z" fill="#fff" opacity="0.26" />
              <path d="M20 40 C 70 46, 130 38, 200 44 C 260 49, 320 40, 372 30 L 372 33 C 320 44, 260 53, 200 48 C 130 42, 70 50, 20 44 Z" fill="#000" opacity="0.14" />
            </g>
          </svg>
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
            className="hero-brush pointer-events-none absolute left-[90%] top-[-62%] z-20 hidden w-[2.6em] origin-[8%_80%] sm:block"
            draggable={false}
          />
        </span>
      </span>
      <span className="block">of a room.</span>
    </h1>
  );
}
