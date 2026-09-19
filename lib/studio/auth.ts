// Studio Office sign-in. One owner, one password. The password lives in the
// STUDIO_PASSWORD environment variable (never in the repo); the session cookie
// carries a hash derived from it, so changing the password signs every device
// out. In local development, with no variable set, the password is "studio".
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const STUDIO_COOKIE = "cc_studio";
const DEV_PASSWORD = "studio";

export function studioPassword(): string {
  const env = process.env.STUDIO_PASSWORD;
  if (env) return env;
  return process.env.NODE_ENV === "production" ? "" : DEV_PASSWORD;
}

export function usingDevPassword(): boolean {
  return !process.env.STUDIO_PASSWORD && process.env.NODE_ENV !== "production";
}

export function sessionToken(): string {
  const pw = studioPassword();
  if (!pw) return "";
  return createHash("sha256").update(`carol-studio-office|${pw}`).digest("hex");
}

export function checkPassword(attempt: string): boolean {
  const pw = studioPassword();
  if (!pw) return false;
  const a = Buffer.from(attempt);
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function tokenValid(token: string | undefined): boolean {
  const want = sessionToken();
  if (!want || !token || token.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(want));
}

export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  return tokenValid(jar.get(STUDIO_COOKIE)?.value);
}

export async function signIn(remember: boolean): Promise<void> {
  const jar = await cookies();
  jar.set(STUDIO_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Carol should not have to sign in every day. 60 days on her own phone; a
    // shared computer gets the browser session only.
    ...(remember ? { maxAge: 60 * 60 * 24 * 60 } : {}),
  });
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(STUDIO_COOKIE);
}
