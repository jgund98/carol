import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

// /office is a doorway: signed in → the office, otherwise → /login.
export default async function OfficeIndex() {
  redirect((await isSignedIn()) ? "/office/home" : "/login");
}
