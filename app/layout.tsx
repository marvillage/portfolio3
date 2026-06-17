import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kushagra Srivastava — Software Engineer & Writer",
  description:
    "Portfolio of Kushagra Srivastava — software engineer, full-stack & AI developer, and writer. Projects, articles, and contact.",
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
      "Software engineer, full-stack & AI developer, and writer. Explore my projects and articles.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#03040a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
