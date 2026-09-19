// Artwork photos. Carol uploads a phone photo (already cropped and downsized in
// the browser); here it becomes the two sizes the website uses (1600 and 700
// px, JPEG), plus the pixel dimensions and dominant colour every piece carries.
// Storage: Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise
// public/uploads on disk for local development.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { StudioError, projectRoot } from "./docstore";

export type ProcessedImage = { image: string; imageSm: string; iw: number; ih: number; color: string };

const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

export async function processArtwork(buf: Buffer, baseName: string): Promise<ProcessedImage> {
  const src = sharp(buf, { failOn: "none" }).rotate();
  const meta = await src.metadata();
  if (!meta.width || !meta.height) throw new StudioError("That file does not look like a photo. Try a JPG or PNG.");

  const full = await src.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const small = await src.clone().resize({ width: 700, height: 700, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();

  // Dominant colour (used by the cursor disc and the paint cursor over cards).
  const { dominant } = await sharp(small).stats();
  const color = `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`;

  const stamp = Date.now().toString(36);
  const name = `${baseName}-${stamp}`;
  const [image, imageSm] = await Promise.all([storeFile(`art/${name}.jpg`, full.data), storeFile(`art-sm/${name}.jpg`, small)]);
  return { image, imageSm, iw: full.info.width, ih: full.info.height, color };
}

async function storeFile(key: string, data: Buffer): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const res = await put(key, data, { access: "public", contentType: "image/jpeg", addRandomSuffix: false, cacheControlMaxAge: 60 * 60 * 24 * 365 });
    return res.url;
  }
  if (process.env.VERCEL) {
    throw new StudioError("Photo storage is not connected yet, so photos cannot be uploaded right now.");
  }
  const rel = path.posix.join("uploads", key);
  const abs = path.join(projectRoot(), "public", rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, data);
  return `/${rel}`;
}

/** Best effort: remove an uploaded photo we no longer reference. Seed photos under /art are never touched. */
export async function removeStored(url: string | undefined | null): Promise<void> {
  if (!url || url.startsWith("/art")) return;
  try {
    if (url.startsWith("/uploads/")) {
      fs.unlinkSync(path.join(projectRoot(), "public", url));
    } else if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    /* ignore */
  }
}
