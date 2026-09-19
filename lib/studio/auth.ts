// Studio Office sign-in. One owner: a username and password. Defaults are
// set in code (per Jordan) and can be overridden with STUDIO_USER /
// STUDIO_PASSWORD without a deploy. The session cookie carries a hash derived
// from the password, so changing the password signs every device out.
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const STUDIO_COOKIE = "cc_studio";
const DEFAULT_USER = "carol";
const DEFAULT_PASSWORD = "jordan123";

export function studioUser(): string {
  return (process.env.STUDIO_USER || DEFAULT_USER).trim().toLowerCase();
}

export function studioPassword(): string {
  return process.env.STUDIO_PASSWORD || DEFAULT_PASSWORD;
}

export function sessionToken(): string {
  return createHash("sha256").update(`carol-studio-office|${studioUser()}|${studioPassword()}`).digest("hex");
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkCredentials(user: string, password: string): boolean {
  return same(user.trim().toLowerCase(), studioUser()) && same(password, studioPassword());
}

export function tokenValid(token: string | undefined): boolean {
  const want = sessionToken();
  return Boolean(token) && same(token as string, want);
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
    // Carol should not have to sign in every day: 60 days on her own phone.
    ...(remember ? { maxAge: 60 * 60 * 24 * 60 } : {}),
  });
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(STUDIO_COOKIE);
}
