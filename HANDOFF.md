# Handoff notes — Carol Calicchio Art

## What was built
A new site for carolcalicchioart.com: home, six collection pages, shop with 66 pieces and product pages, cart and order-request checkout, studio, commissions, about, contact, exhibitions, press, surfboards, books, store policy. Sitemap, robots, Open Graph, LocalBusiness/Person/Product/FAQ schema.

## Signature pieces
- **The easel** (home, collection pages): hover tilts, click flips to the back of the canvas (label, size, medium, her signature), click again turns to the next painting. Turns on its own when idle.
- **Meet Carol**: her own intro reel, her signature, one paragraph, her quote.
- **Paint**: daubs cut from her actual canvases float with the scroll; a pink paint ribbon carries the press; canvases lean against the wall in the collections; a paint trail follows the cursor over artwork.
- **Light**: her statement on light beside Celestial Moonlight, which your hand lights up.
- **The wall**: twelve paintings hung to true relative scale, gliding sideways as you scroll.
- **True to scale** on every product page: the painting drawn in inches beside a 5'8" figure and a sofa.

## Before going live
1. Set `BREVO_API_KEY` in Vercel (forms). Recipient is already Carol@carolcalicchioart.com in code.
2. Confirm with Carol: store policy wording (shipping, final sale, damage window), the "featured in" list (House Beautiful, NYT, Palm Beach Post are from her Instagram bio), and phone 561-400-0678 vs the 561-213-0616 listed on Palm Beach Culture.
3. Ask Carol whether any pieces have sold since September 2026 and mark them (`sold: true`).
4. Point the domain; set `NEXT_PUBLIC` nothing else needed. `metadataBase` is already carolcalicchioart.com.

## Content sources
Her Wix site (copy, bio, exhibitions, 66 products), her Instagram reels (studio tour, process clips, Breakers surfboards), Palm Beach Illustrated, Dan's Papers, Elevated Magazine (Bruce Helander), Schneps podcast, Boca Raton Museum of Art. Every quote is verbatim and attributed in `lib/content.ts`.

## Studio Office (added 2026-09-19, LIVE)

Carol's private back room: **carol.epicdevsolutions.com/login** (the app lives under /office/*; a small "Studio office" link sits in the site footer). Sign-in is a name + password with defaults in code (`lib/studio/auth.ts`: carol / jordan123), overridable with `STUDIO_USER` / `STUDIO_PASSWORD` env vars. Phone-first: five bottom tabs (Today, Inquiries, +, Orders, Artwork) with camera/gear icons up top; a sidebar on a desk.

Screens: **Today** (what is waiting, gold dots, count in the browser tab), **Inquiries** (every form message, typed; call/text/email; mark handled; notes; never removable), **Orders** (pieces with per-piece Mark as sold / Remove from the website / Put it back; buyer + Maps link; status New → In conversation → Paid → Shipped → Delivered, Cancelled; Shipping box with carrier + tracking number and tracking links; Refund box that records a refund and marks the order Refunded; never removable), **Artwork** (cards hung like the site's; tap to edit photo, title, price, status For sale / Sold / On hold / Hidden, size, medium, collections, "Show on the home page", description, story, Move to the top of the shop, Remove), **Collections** (add, rename, blurb, hero piece, reorder, remove), **Photo guide** (five rules + sizes that work + step-by-steps), **Settings** (alert emails, sign out).

### How it works
- `lib/studio/docstore.ts` — one document store, three backends: Postgres (`DATABASE_URL`, tables `studio_*` as `id + jsonb`; Neon `carol-studio` connected in Vercel), a local JSON file (`.data/studio.json`, dev), read-only seed if deployed without a database. `lib/studio/store.ts` seeds the 66 pieces, 6 collections and the sample inquiries/orders (`lib/studio/demo.ts`, ids `demo_*`) once.
- The website reads the catalog through `lib/store.ts`, so every page, the header menu, cart and shop are database-driven; `featured` pieces drive the home-page easel and wall (`featuredFor` in `lib/catalog.ts`). Saves call `revalidatePath("/", "layout")`.
- `/api/lead` saves every form post into the office (orders → Orders, the rest → Inquiries; newsletter signups auto-handled) and emails via Brevo with an office deep link.
- Photos: browser downsizes + crops (`components/office/PhotoUploader.tsx`), `/api/office/upload` runs sharp (1600 + 700 px JPEG, dominant colour) into Vercel Blob (`carol-art`, public, `BLOB_READ_WRITE_TOKEN`) or `public/uploads` locally.

### Invoices, alerts, sales (added later on 2026-09-19)
- **Invoices** (`/office/invoices`, sidebar; on phones via the Invoices button on Orders, or "Send an invoice" on an open order which prefills the pieces): name + email/mobile, line items in dollars, optional due date and note. Saves as a draft, then **Email the invoice** / **Text the invoice** (both through `BREVO_API_KEY`; SMS sender "CarolArt", set `SMS_SENDER` to a registered number once 10DLC exists), Copy link, Print/PDF, **Mark as paid** (also marks a linked order Paid), Void. Buyer opens `/invoice/<id>?k=<token>`, no login, printable. Numbers run INV-0001, INV-0002… Files: `lib/studio/invoices.ts`, `lib/studio/invoice-shared.ts` (client-safe), `components/office/Invoice*.tsx`, table `studio_invoice`.
- **Text alerts:** Settings → "Text me when something comes in", two numbers; `/api/lead` texts both (Brevo SMS) on every inquiry/order except newsletter signups. Settings also holds "How buyers can pay you", printed on invoices.
- **Today:** greeting, one line (new inquiries · new sales · paid orders), Waiting for you, Sales panel (Today / 7 days / 30 days / All time; a sale = an order at Paid/Shipped/Delivered). New sales breathe faintly pink until opened.
- Orders tabs: Open · Paid · All. Inquiries tabs: New · Handled · All + a type dropdown. Nothing but artwork can be removed.

### Final polish (2026-09-20)
- Every clock uses studio time (`lib/studio/time.ts`, America/New_York): greeting, dates, invoice dates.
- Office has `loading.tsx` (skeleton while a tap loads), `error.tsx` and `not-found.tsx`.
- Editor: leaving with unsaved changes asks first; "For sale" needs a price above $0.
- Settings is just: alert email, alert mobile, how buyers can pay. Extra recipients are code, not UI: `lib/studio/notify.ts` (`EXTRA_ALERT_EMAILS`, `EXTRA_ALERT_PHONES`). Text alerts are always on when a number is set.
- Photo guide is no longer in the nav (still at /office/guide, linked from the photo step). Phone + opens a sheet: add a piece / write an invoice.
- Rigs: `scripts/office-test.js` and `scripts/invoice-test.js`. Never run `next build` while `next dev` is up; it corrupts .next/dev.

### Wiping the sample data later
Delete rows whose id starts with `demo_` from `studio_inquiry` and `studio_order` (Neon console → carol-studio → SQL: `DELETE FROM studio_inquiry WHERE id LIKE 'demo_%'; DELETE FROM studio_order WHERE id LIKE 'demo_%';`).

### Notifications + card payments (2026-09-20)
- **Every text and subject line lives in `lib/studio/texts.ts`** (`carol.*` to her, `buyer.*` to clients). Texts are GSM-7 only, at most 160 characters (one segment, never MMS), and carry short links: `/o /q /v/<id>` open an order / inquiry / invoice in the office (via /login?next=... when signed out), `/i/<id>` the buyer invoice, `/p/<id>` pays a website order by card, `/t/<id>` the carrier tracking page. Review all wording with `npx tsx scripts/notif-copy.ts`. `lib/studio/sms.ts` squeezes anything to GSM-7 and warns if it would split.
- **To Carol** (`lib/studio/alerts.ts`, recipients = Settings + `lib/studio/notify.ts`; during testing jgundyt@gmail.com + 561-324-9522): new order request, order paid by card, invoice paid by card, every inquiry type (newsletter = email only). Branded email (her signature, `lib/studio/mail.ts` shell) + text.
- **To buyers** (`lib/studio/customer-notify.ts`): order received (with a Pay-by-card button when Stripe is on), receipt when paid by card, shipped (only once a tracking number is saved; sent once per number), invoice sent, invoice receipt, overdue-invoice reminder (daily cron `/api/cron/invoice-reminders`, `vercel.json`, first reminder after due, every 3 days, max 3).
- **Stripe** (`lib/studio/stripe.ts`, on when `STRIPE_SECRET_KEY` is set, Epic's key as placeholder): the amount Stripe charges is exactly the invoice lines (cents) or the order's pieces at their listed prices, one line item each. Website checkout saves the request, then hands off to `/p/<id>` -> Stripe Checkout -> `/checkout/paid?session_id=` verifies server-side, marks the order Paid, alerts Carol, receipts the buyer. Invoices: Pay button on `/invoice/<id>` -> `/api/invoice/<id>/checkout` -> back to the invoice with `session_id`. No webhook yet (verification happens on return).
- Still to do: paste the RAW `xkeysib-...` Brevo key into Vercel (the one on file is base64-wrapped and sends nothing), add `STRIPE_SECRET_KEY`, register a 10DLC number for `BREVO_SMS_SENDER`, switch alert recipients to Carol, wipe `demo_*`.

### Verify locally
`pnpm dev` (port 3540), sign in at /login, then `MSYS_NO_PATHCONV=1 node scripts/office-test.js` runs the full add-a-piece flow headlessly and screenshots every office screen at phone and desktop sizes into `shots/office/`.
