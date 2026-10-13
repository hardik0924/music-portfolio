export const SITE_URL = "https://www.amitgaurmusic.com";

export const assets = {
  navLogo: "/sites/ag-live/img/ag-live-logo.png",
  footerLogo: "/sites/ag-live/img/ag-logo-gold.png",
  heroPhoto: "/sites/ag-live/img/amit-hero.jpg",
  heroVideo: "/sites/ag-live/video/ag-live-hero.mp4",
  band: [
    {
      src: "/sites/ag-live/img/band-stage-solo.jpg",
      alt: "Amit Gaur performing live on stage",
    },
    { src: "/sites/ag-live/img/band-casual-bw.jpg", alt: "AG Live Band candid" },
    {
      src: "/sites/ag-live/img/band-pastel-suits.jpg",
      alt: "AG Live Band backstage",
    },
    {
      src: "/sites/ag-live/img/band-conrad-nye.jpg",
      alt: "AG Live Band at Conrad Pune New Year's Eve",
    },
  ],
} as const;

export type NavLink = { label: string; href: string; external?: boolean };

export const navLinks: NavLink[] = [
  { label: "The Act", href: "#the-act" },
  { label: "Lineups", href: "#lineups" },
  { label: "Shows", href: "#upcoming" },
  { label: "Availability", href: "#ag-calendar" },
  { label: "The Band", href: "#the-band" },
  { label: "Clients", href: "#clients" },
  { label: "Request a Song", href: `${SITE_URL}/tag`, external: true },
];

export const tickerItems = [
  "JW Marriott",
  "Conrad Pune",
  "The Westin",
  "DoubleTree by Hilton",
  "Della Lonavala",
  "Mahindra",
  "Oppo",
  "Hindustan Times",
  "Nyati Group",
  "Suzlon",
  "500+ Shows",
  "12 Years Live",
] as const;

export type Stat = { target: number; suffix: string; label: string };

export const stats: Stat[] = [
  { target: 500, suffix: "+", label: "Shows & Counting" },
  { target: 12, suffix: "", label: "Years on Stage" },
  { target: 50, suffix: "+", label: "Premium Venues" },
  { target: 6, suffix: "", label: "Band Formats" },
];

export const genres = ["Bollywood Rock"] as const;

export const actBio =
  "Amit Gaur is Pune's most versatile live act — equally at home in a candlelit lobby lounge, a corporate ballroom, and a 2,000-seat amphitheatre. With a voice that moves seamlessly between Bollywood romance, international jazz, and soulful Sufi, AG Live builds the energy of a room from the very first chord and holds it until the last.";

export type LineupId = "trio" | "four" | "five" | "six";

/**
 * Exact code points used by the source document. Written as escapes so no editor
 * or console can silently swap the glyph or add a variation selector.
 */
const ICON_MIC = "\uD83C\uDFA4";
const ICON_STUDIO_MIC = "\uD83C\uDF99";
const ICON_GUITAR = "\uD83C\uDFB8";
const ICON_VIOLIN = "\uD83C\uDFB7";
const ICON_KEYS = "\uD83C\uDFB9";
const ICON_DRUM = "\uD83E\uDD41";
const ICON_ENVELOPE = "\u2709";
const ICON_PIN = "\uD83D\uDCCD";
const ICON_CAMERA = "\uD83D\uDCF8";

export type LineupMember = { icon: string; name: string; role: string };

export type Lineup = {
  id: LineupId;
  tab: string;
  title: string;
  desc: string;
  idealFor: string;
  members: LineupMember[];
};

export const lineups: Lineup[] = [
  {
    id: "trio",
    tab: "Trio",
    title: "The Intimate Trio",
    desc: "An acoustic-electric trio that fits any lounge, supper club, or private dining event without overwhelming the room. Warm, personal, and effortlessly sophisticated.",
    idealFor:
      "Lobby lounges · Private dinners · Boutique weddings · Brand launches under 150 guests",
    members: [
      { icon: ICON_MIC, name: "Amit Gaur", role: "Lead Vocals & Acoustic Guitar" },
      { icon: ICON_GUITAR, name: "Lead Guitarist", role: "Electric Guitar" },
      { icon: ICON_DRUM, name: "Percussionist", role: "Cajon & Hand Percussion" },
    ],
  },
  {
    id: "four",
    tab: "4-Piece",
    title: "The 4-Piece Band",
    desc: "The signature AG Live format — a tight, punchy quartet that delivers the full band experience. Corporate events and mid-scale weddings love this format.",
    idealFor:
      "Corporate gala · Wedding sangeet · Cocktail event · Hotel ballroom up to 400 guests",
    members: [
      { icon: ICON_MIC, name: "Amit Gaur", role: "Lead Vocals & Guitar" },
      { icon: ICON_GUITAR, name: "Lead Guitarist", role: "Electric Guitar" },
      { icon: ICON_KEYS, name: "Keyboardist", role: "Keys & Synth" },
      { icon: ICON_DRUM, name: "Drummer", role: "Full Kit" },
    ],
  },
  {
    id: "five",
    tab: "5-Piece",
    title: "The 5-Piece Band",
    desc: "Adding a bassist transforms the groove entirely. Built for larger rooms and audiences who want to feel the music as much as hear it — full, warm, and driving.",
    idealFor:
      "Large corporate events · Wedding receptions · Brand activations 400–800 guests",
    members: [
      { icon: ICON_MIC, name: "Amit Gaur", role: "Lead Vocals & Guitar" },
      { icon: ICON_GUITAR, name: "Lead Guitarist", role: "Electric Guitar" },
      { icon: ICON_KEYS, name: "Keyboardist", role: "Keys & Synth" },
      { icon: ICON_VIOLIN, name: "Bassist", role: "Electric Bass" },
      { icon: ICON_DRUM, name: "Drummer", role: "Full Kit" },
    ],
  },
  {
    id: "six",
    tab: "6-Piece",
    title: "The Full 6-Piece",
    desc: "The complete AG Live experience — six musicians delivering a concert-level performance. A dedicated female vocalist adds harmony, range, and visual presence. For events where only the best will do.",
    idealFor:
      "Grand weddings · Award nights · Outdoor festivals · Premium brand events 800+ guests",
    members: [
      { icon: ICON_MIC, name: "Amit Gaur", role: "Lead Vocals & Guitar" },
      { icon: ICON_STUDIO_MIC, name: "Female Vocalist", role: "Co-Lead & Harmonies" },
      { icon: ICON_GUITAR, name: "Lead Guitarist", role: "Electric Guitar" },
      { icon: ICON_KEYS, name: "Keyboardist", role: "Keys & Synth" },
      { icon: ICON_VIOLIN, name: "Bassist", role: "Electric Bass" },
      { icon: ICON_DRUM, name: "Drummer", role: "Full Kit" },
    ],
  },
];

export type LogoCell = { src: string; alt: string; logoBg?: string };

export const clientLogos: LogoCell[] = [
  { src: "/sites/ag-live/logos/marriot.jpeg", alt: "JW Marriott Suites Pune", logoBg: "#fff" },
  { src: "/sites/ag-live/logos/conrad.jpeg", alt: "Conrad Pune", logoBg: "#3a2151" },
  {
    src: "/sites/ag-live/logos/westin.jpeg",
    alt: "The Westin Pune, Koregaon Park",
    logoBg: "#fff",
  },
  {
    src: "/sites/ag-live/logos/doubletree.jpeg",
    alt: "DoubleTree by Hilton Pune - Chinchwad",
    logoBg: "#fff",
  },
  { src: "/sites/ag-live/logos/hyatt.jpeg", alt: "Hyatt Regency Pune" },
  { src: "/sites/ag-live/logos/radisson.jpeg", alt: "Radisson Blu Pune Kharadi", logoBg: "#fff" },
  { src: "/sites/ag-live/logos/sayaji.jpeg", alt: "Sayaji Pune", logoBg: "#fff" },
  {
    src: "/sites/ag-live/logos/della.jpeg",
    alt: "Della Adventure & Resorts, Lonavala",
  },
  { src: "/sites/ag-live/logos/oppo.jpeg", alt: "Oppo", logoBg: "#fff" },
  { src: "/sites/ag-live/logos/mahindra.jpeg", alt: "Mahindra", logoBg: "#fff" },
  { src: "/sites/ag-live/logos/nyati.jpeg", alt: "Nyati Group" },
  { src: "/sites/ag-live/logos/suzlon.jpeg", alt: "Suzlon", logoBg: "#fff" },
  {
    src: "/sites/ag-live/logos/ashishbhuyan.jpeg",
    alt: "Ashish Bhuyan Designing & Co.",
  },
];

export type PressCell = LogoCell & { href: string };

export const pressLinks: PressCell[] = [
  {
    src: "/sites/ag-live/press/dailyhunt.jpg",
    alt: "AG Live featured on Dailyhunt",
    href: "http://dhunt.in/15uMMh",
    logoBg: "#fff",
  },
  {
    src: "/sites/ag-live/press/economic-wires.jpg",
    alt: "AG Live featured by The Economic Wires",
    href: "https://www.instagram.com/p/DdGw7sOgdT5/?stkn=MWhzY3MxM2ViaWQ1bA==",
    logoBg: "#000",
  },
  {
    src: "/sites/ag-live/press/india-shorts.png",
    alt: "AG Live featured on India Shorts",
    href: "https://indiashorts.com/why-serious-wedding-planners-corporate-teams-college-fest-committees-book-only-ag-live/298297/",
    logoBg: "#e62b34",
  },
  {
    src: "/sites/ag-live/press/eastern-herald.png",
    alt: "AG Live featured on Eastern Herald",
    href: "https://easternherald.com/2026/09/10/why-serious-wedding-planners-corporate-teams-college-fest-committees-book-only-ag-live/",
    logoBg: "#fff",
  },
  {
    src: "/sites/ag-live/press/business-upturn.png",
    alt: "AG Live featured on Business Upturn",
    href: "https://businessupturn.com/brand-post/why-serious-wedding-planners-corporate-teams-college-fest-committees-book-only-ag-live/",
    logoBg: "#3a3a3c",
  },
  {
    src: "/sites/ag-live/press/vie-stories.png",
    alt: "AG Live featured on VIE Stories",
    href: "https://viestories.com/press-release/why-serious-wedding-planners-corporate-teams-college-fest-committees-book-only-ag-live-12515481",
    logoBg: "#fff",
  },
  {
    src: "/sites/ag-live/press/business-news-this-week.png",
    alt: "AG Live featured on Business News This Week",
    href: "https://businessnewsthisweek.com/news/why-serious-wedding-planners-corporate-teams-and-college-fest-committees-book-only-ag-live/",
    logoBg: "#e84e36",
  },
  {
    src: "/sites/ag-live/press/india-buzz-news.png",
    alt: "AG Live featured on India Buzz News",
    href: "https://indiabuzznews.co.in/why-serious-wedding-planners-corporate-teams-college-fest-committees-book-only-ag-live/",
    logoBg: "#fff",
  },
  {
    src: "/sites/ag-live/press/yahoo-news.png",
    alt: "AG Live coverage on Yahoo News",
    href: "https://search.yahoo.com/search?p=Why+Serious+Wedding+Planners+Corporate+Teams+College+Fest+Committees+Book+Only+AG+Live",
    logoBg: "#400082",
  },
  {
    src: "/sites/ag-live/press/google-news.png",
    alt: "AG Live coverage on Google News",
    href: "https://news.google.com/search?q=Why+Serious+Wedding+Planners+Corporate+Teams+College+Fest+Committees+Book+Only+AG+Live",
    logoBg: "#fff",
  },
];

export type Review = {
  id: string;
  name: string;
  stars: number;
  review: string;
  role?: string;
};

export const seedReviews: Review[] = [
  {
    id: "seed-0",
    name: "Priya Mehta",
    stars: 5,
    review:
      "Amit and the AG Live band were the highlight of our annual gala. Guests were on their feet by the second song — we've already rebooked for next year.",
    role: "Events Manager, Conrad Pune",
  },
];

export type ContactItem = {
  icon: string;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

export const contactItems: ContactItem[] = [
  {
    icon: ICON_ENVELOPE,
    label: "Email",
    value: "amitgaurmusic@gmail.com",
    href: "mailto:amitgaurmusic@gmail.com",
  },
  { icon: ICON_PIN, label: "Base", value: "Pune · Available Pan India" },
  {
    icon: ICON_CAMERA,
    label: "Instagram",
    value: "@amitgaurmusic",
    href: "https://instagram.com/amitgaurmusic",
    external: true,
  },
];

export const bandFormats = [
  "Trio",
  "4-Piece Band",
  "5-Piece Band",
  "6-Piece Full Band",
  "Not sure -- advise me",
] as const;

export const eventTypes = [
  "Corporate Event",
  "Wedding",
  "Brand Activation",
  "Award Night",
  "Private Party",
  "Festival / Concert",
  "Other",
] as const;

export const footerNav: NavLink[] = [
  { label: "The Act", href: "#the-act" },
  { label: "Lineups", href: "#lineups" },
  { label: "The Band", href: "#the-band" },
  { label: "Clients", href: "#clients" },
  { label: "Book Now", href: "#book" },
  {
    label: "Instagram",
    href: "https://instagram.com/amitgaurmusic",
    external: true,
  },
];

export const footerLegal: NavLink[] = [
  { label: "Contact", href: `${SITE_URL}/contact`, external: true },
  { label: "Pricing", href: `${SITE_URL}/pricing`, external: true },
  { label: "Terms", href: `${SITE_URL}/terms`, external: true },
  { label: "Privacy", href: `${SITE_URL}/privacy`, external: true },
  { label: "Refunds", href: `${SITE_URL}/refund`, external: true },
  { label: "Shipping", href: `${SITE_URL}/shipping`, external: true },
];

export const copyrightLine =
  "© 2024 AG Live · Amit Gaur Music · Managed by Tuneholic Entertainment, Pune";

export const toastMessage = "Inquiry received -- we'll be in touch within 24 hours";