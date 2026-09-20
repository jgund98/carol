// Who hears about orders, inquiries and payments. Kept in code on purpose
// (Jordan): Carol's own email and mobile come from Settings; anyone else who
// should be copied goes in EXTRA_*.
//
// TESTING: while this is true, every alert meant for Carol goes ONLY to the
// test recipients below (Jordan), whatever Settings says. Flip it to false
// when Carol takes over.
export const TESTING = true;
export const TEST_EMAILS: string[] = ["jgundyt@gmail.com"];
export const TEST_PHONES: string[] = ["561-324-9522"];

export const EXTRA_ALERT_EMAILS: string[] = [];
export const EXTRA_ALERT_PHONES: string[] = [];

/** While testing, card payments without a Stripe key are simulated for these buyers only. */
export const isTester = (email: string | null | undefined) => TESTING && Boolean(email) && TEST_EMAILS.includes(String(email).trim().toLowerCase());
