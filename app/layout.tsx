import fs from "node:fs";
import path from "node:path";
import type { Metadata, Viewport } from "next";
import { Bangers, Kalam, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://portfolio3-kappa-rosy.vercel.app";

// Link-preview image: used when public/art/og-cover.(webp|png) exists.
const ogCover = ["og-cover.webp", "og-cover.png"].find((f) =>
  fs.existsSync(path.join(process.cwd(), "public", "art", f))
);
const ogImages = ogCover
  ? [{ url: `/art/${ogCover}`, width: 1200, height: 630, alt: "Ink drawing of a space station and starfighter" }]
  : undefined;

// Comic display face for titles and sound effects
const display = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Hand lettering for captions and asides
const hand = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

// Clean sans for body text so long blurbs stay readable
const sans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Mono for tags, metadata and the mission-log feel
const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kushagra Srivastava — Software Engineer & Writer",
  description:
    "Portfolio of Kushagra Srivastava — full-stack software engineer and writer. React and TypeScript front ends over Spring Boot and FastAPI services, AI systems, and stories on Medium.",
  keywords: [
    "Kushagra Srivastava",
    "Software Engineer",
    "Full Stack Developer",
    "AI",
    "Portfolio",
    "Next.js",
  ],
  authors: [{ name: "Kushagra Srivastava" }],
  openGraph: {
    title: "Kushagra Srivastava — Software Engineer & Writer",
    description:
      "Full-stack software engineer and writer. Explore my projects and articles.",
    type: "website",
    images: ogImages,
  },
  twitter: {
    card: ogImages ? "summary_large_image" : "summary",
    title: "Kushagra Srivastava — Software Engineer & Writer",
    description:
      "Full-stack software engineer and writer. Explore my projects and articles.",
    images: ogImages,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${hand.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
