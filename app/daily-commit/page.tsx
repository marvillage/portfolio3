import type { Metadata, Viewport } from "next";
import { Libre_Caslon_Text, Playfair_Display, UnifrakturMaguntia } from "next/font/google";
import DailyCommit from "@/components/dailycommit/DailyCommit";
import { headers } from "next/headers";
import { CircleError, getBoard, type Board } from "@/lib/circle";
import { visitorKey } from "@/lib/clientIp";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import "./paper.css";

// newspaper type, loaded only on this page: blackletter masthead, heavy serif headlines
// and numbers, Caslon for names and labels
const blackletter = UnifrakturMaguntia({ weight: "400", subsets: ["latin"], variable: "--font-blackletter", display: "swap" });
const headline = Playfair_Display({ weight: ["700", "900"], subsets: ["latin"], variable: "--font-headline", display: "swap" });
const caslon = Libre_Caslon_Text({ weight: ["400", "700"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-caslon", display: "swap" });

export const dynamic = "force-dynamic";

type Props = { searchParams: { u?: string | string[] } };
const param = (u: Props["searchParams"]["u"]) => (typeof u === "string" ? u.trim().replace(/^@/, "") : "");

const DESCRIPTION = "Who actually shows up for you on GitHub? Followers against the people who review, comment and commit with you, printed as a front page.";

export function generateMetadata({ searchParams }: Props): Metadata {
  const u = param(searchParams.u);
  const title = u ? `Who actually shows up for @${u} on GitHub?` : "Who actually shows up for you on GitHub? · The Daily Commit";
  const description = u
    ? `@${u}'s GitHub circle, printed as a front page. Followers vs. the people who really review, comment and commit. See yours, free.`
    : DESCRIPTION;
  // the front page as a picture, so a shared link shows the edition on X and elsewhere
  const image = {
    url: u ? `/api/daily-commit/og?u=${encodeURIComponent(u)}` : "/api/daily-commit/og",
    width: 1200,
    height: 630,
    alt: u ? `@${u}'s circle report in The Daily Commit` : "The Daily Commit, GitHub Edition",
  };
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export const viewport: Viewport = { themeColor: "#e8e5dd" };

export default async function DailyCommitPage({ searchParams }: Props) {
  const u = param(searchParams.u);
  let board: Board | null = null;
  let error: string | null = null;
  if (u) {
    try {
      board = await getBoard(u, visitorKey(headers()));
    } catch (e) {
      error = e instanceof CircleError ? e.message : "The press jammed. Try again.";
    }
  }
  // the editor's X handle, credited when an edition is shared there
  const ownerX = socials.map((s) => s.href.match(/^https:\/\/(?:x|twitter)\.com\/([A-Za-z0-9_]+)/)?.[1]).find(Boolean) ?? null;
  // the dateline, in the editor's time zone so server and client print the same day
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date());

  return (
    <div className={`${blackletter.variable} ${headline.variable} ${caslon.variable}`}>
      <DailyCommit initialBoard={board} initialError={error} initialLogin={u} owner={profile.github} ownerName={profile.name} ownerX={ownerX} today={today} />
    </div>
  );
}
