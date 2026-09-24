// Carol's guided painting classes. Client-safe: no database, no secrets.
//
// TO ADD A DATE: append one entry to CLASSES. Past dates hide themselves,
// sold-out dates show as sold out, and the banner, popup, page and Stripe
// checkout all read from this one list.
export type StudioClass = {
  /** stable id used in links, Stripe metadata and order items (class-<id>) */
  id: string;
  /** YYYY-MM-DD, studio local time */
  date: string;
  /** 24h "HH:MM" */
  start: string;
  end: string;
  title: string;
  /** dollars per seat */
  price: number;
  /** seats available on this date */
  seats: number;
};

export const CLASSES: StudioClass[] = [
  { id: "2026-10-09", date: "2026-10-09", start: "17:30", end: "20:00", title: "An Evening in the Studio", price: 100, seats: 18 },
];

export const CLASS = {
  title: "An Evening in the Studio",
  kicker: "A guided painting class with Carol Calicchio",
  price: 100,
  /** the most seats one reservation can take */
  maxSeats: 6,
  venue: { name: "Carol Calicchio Art Studio", street: "2559 Webb Avenue, Unit 2", city: "Delray Beach, Florida", short: "2559 Webb Ave Unit 2, Delray Beach" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=2559+Webb+Avenue+Unit+2+Delray+Beach+FL+33444",
  photo: "/photos/carol-studio-seated.jpg",
  photoWide: "/photos/carol-easel-portrait.jpg",
} as const;

export const classSlug = (c: Pick<StudioClass, "id">) => `class-${c.id}`;
export const isClassSlug = (slug: string) => slug.startsWith("class-");
export const classById = (id: string) => CLASSES.find((c) => c.id === id) ?? null;

/** Today's date in the studio's time zone, YYYY-MM-DD. */
export function todayEt(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** Dates that have not passed yet, soonest first. */
export const upcomingClasses = () => CLASSES.filter((c) => c.date >= todayEt()).sort((a, b) => a.date.localeCompare(b.date));

const at = (c: StudioClass) => new Date(`${c.date}T12:00:00`);

/** "Friday, October 9" */
export const classDay = (c: StudioClass) => at(c).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
/** "Friday, October 9, 2026" */
export const classDayYear = (c: StudioClass) => at(c).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
/** "Oct 9" */
export const classShort = (c: StudioClass) => at(c).toLocaleDateString("en-US", { month: "short", day: "numeric" });
/** "Fri, Oct 9" */
export const classShortDay = (c: StudioClass) => at(c).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const clock = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return m ? `${hr}:${String(m).padStart(2, "0")} ${ampm}` : `${hr} ${ampm}`;
};
/** "7 to 8 PM" or "7:30 to 9 PM" */
export const classTime = (c: StudioClass) => {
  const s = clock(c.start), e = clock(c.end);
  const sameHalf = s.slice(-2) === e.slice(-2);
  return `${sameHalf ? s.replace(/ (AM|PM)$/, "") : s} to ${e}`;
};
/** "7 PM" */
export const classStart = (c: StudioClass) => clock(c.start);

/** Google Calendar link for the buyer's confirmation. */
export function calendarUrl(c: StudioClass): string {
  const stamp = (hhmm: string) => `${c.date.replace(/-/g, "")}T${hhmm.replace(":", "")}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${c.title} with Carol Calicchio`,
    dates: `${stamp(c.start)}/${stamp(c.end)}`,
    ctz: "America/New_York",
    location: `${CLASS.venue.street}, ${CLASS.venue.city}`,
    details: "A guided painting class in Carol's studio. All materials included. Just bring yourself.",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
