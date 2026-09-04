# Carol Calicchio Art

Next.js 16 · Tailwind 4 · framer-motion · Lenis. Static-first, one dynamic route (`/api/lead`).

```bash
pnpm install
pnpm dev        # http://localhost:3540
pnpm build && pnpm start   # production on :3541
```

## Where things live
- `lib/site.ts` — every business fact: phone, email, address, socials, press list, service area. Change once, updates everywhere.
- `lib/works.ts` — the catalogue (66 pieces). Each entry: `slug`, `name`, `price`, `sold`, `available`, `medium`, `width`/`height` (inches), `iw`/`ih` (image pixels), `color`, `collections`, `kind`.
- `lib/content.ts` — bio, artist statement, quotes (all verbatim and attributed), process steps, books, press, exhibitions, collection blurbs, FAQs.
- `public/art/*.jpg` (≤1600px) and `public/art-sm/*.jpg` (≤700px) — one pair per work, named by `file`.
- `public/video/*.mp4|jpg` — trimmed 720p clips + posters. `public/photos` — studio and install photography. `public/brand` — her signature wordmark (cut from her own handwriting) and the Epic logo.

## Everyday edits
- **Mark a piece sold**: set `sold: true` in `lib/works.ts`.
- **Change a price**: edit `price` (whole dollars).
- **Add a painting**: drop `name.jpg` into `public/art` and a ≤700px copy into `public/art-sm`, add an entry to `works` (run `ffprobe` or check the image for `iw`/`ih`), add its slug to a collection via `collections: ["recent"]`.
- **Hero easel rotation**: `heroSlugs` in `lib/catalog.ts`. **Gallery wall**: `wallSlugs`.
- **Exhibitions / press / FAQs**: `lib/content.ts`.

## Forms
All forms post to `/api/lead` (Brevo). Set `BREVO_API_KEY` in Vercel. Without it, submissions are logged server-side and the form still shows success. Subjects: New Artwork Inquiry, New Order Request, New Commission Request, New Studio Visit Request, New Newsletter Signup, New Website Lead.

## Checkout
By design no payment is taken on the site. Checkout collects contact, delivery address, payment preference and sends an **order request**; Carol confirms availability and takes payment directly. Add Stripe later if wanted.

## Verify
`MSYS_NO_PATHCONV=1 FULL=1 VIEWS=d,m node scripts/shoot.js` (stitched full-page shots into `shots/`), `scripts/flow-test.js` (cart → checkout, menu, breakpoints), `scripts/easel-test.js`.
