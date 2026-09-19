// Photo upload for the artwork editor. The browser has already cropped and
// downsized the photo; here it is turned into the website's two sizes and
// measured. Answers with what the editor needs to preview and save.
import { isSignedIn } from "@/lib/studio/auth";
import { processArtwork } from "@/lib/studio/images";
import { StudioError, slugify } from "@/lib/studio/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isSignedIn())) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  try {
    const fd = await req.formData();
    const file = fd.get("file");
    const name = String(fd.get("name") || "piece");
    if (!(file instanceof File)) return Response.json({ ok: false, error: "No photo was received." }, { status: 400 });
    if (file.size > 12 * 1024 * 1024) return Response.json({ ok: false, error: "That photo is too large. Try again, it will be shrunk automatically." }, { status: 413 });
    const buf = Buffer.from(await file.arrayBuffer());
    const out = await processArtwork(buf, slugify(name));
    return Response.json({ ok: true, ...out });
  } catch (e) {
    const msg = e instanceof StudioError ? e.message : "The photo could not be processed. Try a JPG or PNG.";
    if (!(e instanceof StudioError)) console.error("[office/upload]", e);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
