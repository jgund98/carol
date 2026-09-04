/**
 * Every business fact lives here. Components read from this file only.
 * Source: carolcalicchioart.com (Sept 2026), her Instagram captions, Palm Beach
 * Culture directory, Dan's Papers, Palm Beach Illustrated, Elevated Magazine.
 */
export const site = {
  name: "Carol Calicchio",
  legalName: "Carol Calicchio Art Studio",
  tagline: "Abstract florals and seascapes, painted in the light of South Florida.",
  url: "https://www.carolcalicchioart.com",
  phone: "561-400-0678",
  phoneHref: "tel:+15614000678",
  email: "Carol@carolcalicchioart.com",
  studio: {
    name: "Carol Calicchio Art Studio",
    street: "2559 Webb Avenue",
    city: "Delray Beach",
    state: "FL",
    zip: "33444",
    note: "By appointment only",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=2559+Webb+Avenue+Delray+Beach+FL",
    // Approximate coordinates for Webb Ave, Delray Beach (used only for LocalBusiness geo)
    lat: 26.4557,
    lng: -80.0851,
  },
  social: {
    instagram: "https://www.instagram.com/carolcalicchioart/",
    instagramHandle: "@carolcalicchioart",
    facebook: "https://www.facebook.com/carol.calicchio/",
    facebookPage: "https://www.facebook.com/p/Carol-Calicchio-Art-100057570034526/",
    artsy: "https://www.artsy.net/artist/carol-calicchio",
    linkedin: "https://www.linkedin.com/in/carol-calicchio-b547a549/",
    threads: "https://www.threads.com/@carolcalicchioart",
  },
  // Self-described in her Instagram bio and press.
  featuredIn: [
    "Palm Beach Illustrated",
    "House Beautiful",
    "The New York Times",
    "Palm Beach Post",
    "Dan's Papers",
    "Elevated Magazine",
  ],
  onView: [
    "The Shops at The Breakers, Palm Beach",
    "Palm Beach Art, Antique & Design Showroom",
    "J.McLaughlin",
  ],
  areaServed: [
    "Palm Beach",
    "Delray Beach",
    "Gulf Stream",
    "Boca Raton",
    "West Palm Beach",
    "Jupiter",
    "Manalapan",
    "Ocean Ridge",
    "Highland Beach",
    "Wellington",
    "Naples",
    "Miami",
    "New York",
    "Nantucket",
    "Greenwich",
  ],
  epic: { name: "Epic Dev Solutions", url: "https://epicdevsolutions.com" },
} as const;

export const nav = [
  { href: "/collections", label: "Collections" },
  { href: "/shop", label: "Shop" },
  { href: "/studio", label: "Studio" },
  { href: "/commissions", label: "Commissions" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
