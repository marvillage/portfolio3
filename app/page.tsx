import fs from "node:fs";
import path from "node:path";
import SpaceBackground from "@/components/SpaceBackground";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import CodeContent from "@/components/CodeContent";
import Education from "@/components/Education";
import Certifications from "@/components/Certifications";
import Projects from "@/components/Projects";
import Achievements from "@/components/Achievements";
import Articles from "@/components/Articles";
import Stats from "@/components/Stats";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import InkDivider from "@/components/InkDivider";
import { getMediumPosts } from "@/lib/medium";
import { getStats } from "@/lib/stats";
import { profile } from "@/data/profile";
import { mediumStats } from "@/data/articles";

// Optional hand-drawn art lives in /public/art (see public/art/PROMPTS.md).
// Each piece is used only when its file exists, so the site renders fully
// with the built-in SVG fallbacks. Any of .webp / .png / .jpg works.
const artDir = path.join(process.cwd(), "public", "art");
const EXT = ["webp", "png", "jpg", "jpeg"];
const isImage = (f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f);
const findArt = (base: string) => {
  const ext = EXT.find((e) => fs.existsSync(path.join(artDir, `${base}.${e}`)));
  return ext ? `/art/${base}.${ext}` : undefined;
};
const listArt = (sub: string) => {
  try {
    return fs.readdirSync(path.join(artDir, sub)).filter(isImage);
  } catch {
    return [];
  }
};

// Medium feed is cached for an hour, so the page re-renders at most hourly.
export const revalidate = 3600;

export default async function Home() {
  const projectArt = listArt("projects");
  const originArt = [1, 2, 3].map((n) => findArt(`origin/${n}`));
  const stopArt = {
    ghaziabad: findArt("origin/1"),
    nagpur: findArt("origin/2"),
    hyderabad: findArt("stations/hyderabad"),
    aecad: findArt("origin/3"),
  };
  const yearArt = Object.fromEntries(
    ["2022", "2023", "2024", "2025", "2026"].map((y) => [y, findArt(`years/${y}`)])
  );
  const certArt = {
    station: findArt("certs/station"),
    dock: findArt("certs/dock"),
    pilot: findArt("certs/pilot"),
    ship: findArt("certs/ship"),
    icons: Object.fromEntries(
      ["anomaly-detection", "supervised-ml", "azure-ai", "python", "backend", "cybersecurity", "cosmos", "flight"].map((k) => [k, findArt(`certs/icons/${k}`)])
    ),
  };
  const [medium, stats] = await Promise.all([getMediumPosts(), getStats(profile.github, profile.leetcode)]);

  return (
    <>
      <SpaceBackground />
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">
        <Hero shipArt={findArt("hero-ship")} />
        <InkDivider />
        <About portraitArt={findArt("pilot-portrait")} originArt={originArt} />
        <InkDivider />
        <Experience stations={{ beehyv: findArt("stations/hyderabad"), aecad: findArt("stations/aecad") }} />
        <InkDivider />
        <CodeContent banner={findArt("code-content-banner")} stopArt={stopArt} yearArt={yearArt} />
        <InkDivider />
        <Education crest={findArt("education-crest")} />
        <InkDivider />
        <Certifications art={certArt} />
        <InkDivider />
        <Projects artFiles={projectArt} />
        <InkDivider />
        <Achievements
          banner={findArt("achievements-banner")}
          awards={{
            trophy: findArt("awards/trophy"),
            "medal-silver": findArt("awards/medal-silver"),
            "medal-bronze": findArt("awards/medal-bronze"),
            rosette: findArt("awards/rosette"),
          }}
          wall={findArt("awards/wall")}
        />
        <InkDivider />
        <Articles
          banner={findArt("writing-banner")}
          posts={medium.posts}
          live={medium.live}
          published={mediumStats.published}
        />
        <InkDivider />
        <Stats stats={stats} room={findArt("stats/control-room")} />
        <InkDivider />
        <Contact art={findArt("contact-signal")} />
        <Footer />
      </main>
    </>
  );
}
