import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import "./ag-live.css";

const display = Cormorant_Garamond({
  variable: "--font-ag-display-stack",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-ag-sans-stack",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  display: "swap",
});

const SITE_URL = "https://www.amitgaurmusic.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AG Live — Amit Gaur | Wedding, Sangeet & Corporate Live Band in Pune",
  description:
    "AG Live is Amit Gaur's Pune-based live band — 3,000+ shows in 10+ years, 2019 Guinness World Record holder, trusted by JW Marriott, Conrad, Westin & Hyatt. Book for weddings, sangeets, corporate events & festivals.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title:
      "AG Live — Amit Gaur | Wedding, Sangeet & Corporate Live Band in Pune",
    description: "3,000+ shows. 10+ years. One band that makes every room feel alive.",
    images: [{ url: "/sites/ag-live/img/amit-hero.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "AG Live — Amit Gaur | Wedding, Sangeet & Corporate Live Band in Pune",
    description: "3,000+ shows. 10+ years. One band that makes every room feel alive.",
    images: ["/sites/ag-live/img/amit-hero.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "AG Live",
  url: SITE_URL,
  image: `${SITE_URL}/img/amit-hero.jpg`,
  description:
    "Pune-based live music band led by Amit Gaur, performing high-energy Bollywood Rock for weddings, sangeets, corporate events, college fests and festivals across India.",
  genre: "Bollywood Rock",
  foundingLocation: { "@type": "Place", name: "Pune, Maharashtra, India" },
  areaServed: ["Pune", "Mumbai", "Maharashtra", "India"],
  sameAs: [
    "https://www.instagram.com/amitgaurmusic",
    "http://dhunt.in/15uMMh",
  ],
  member: {
    "@type": "Person",
    name: "Amit Gaur",
    award: "Guinness World Records title holder (2019)",
  },
};

export default function AgLiveLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`ag-live-fonts ${display.variable} ${sans.variable}`}
      style={{
        "--font-ag-display":
          "var(--font-ag-display-stack), 'Cormorant Garamond', serif",
        "--font-ag-sans": "var(--font-ag-sans-stack), 'Inter', sans-serif",
      } as React.CSSProperties}
    >
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}