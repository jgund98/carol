// Who hears about orders, inquiries and payments. Kept in code on purpose
// (Jordan): while ALERT_OVERRIDE has anything in it, every alert meant for
// Carol goes ONLY to these addresses, whatever the office Settings say. Empty
// both lists to fall back to Settings (her email + mobile) plus the extras.
export const ALERT_OVERRIDE = {
  emails: ["carol@carolcalicchioart.com"],
  phones: ["561-400-0678"],
};

export const EXTRA_ALERT_EMAILS: string[] = [];
export const EXTRA_ALERT_PHONES: string[] = [];

/** Buyers whose card purchase is recorded as paid without Stripe, for testing only. Empty = nobody. */
export const TEST_BUYERS: string[] = [];
export const isTester = (email: string | null | undefined) => Boolean(email) && TEST_BUYERS.includes(String(email).trim().toLowerCase());
