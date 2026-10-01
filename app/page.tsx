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

export default function Home() {
  const projectArt = listArt("projects");
  const patches = listArt("patches").map((f) => `/art/patches/${f}`);

  return (
    <>
      <SpaceBackground />
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">
        <Hero shipArt={findArt("hero-ship")} />
        <InkDivider />
        <About portraitArt={findArt("pilot-portrait")} />
        <InkDivider />
        <Experience patches={patches} />
        <InkDivider />
        <CodeContent banner={findArt("code-content-banner")} />
        <InkDivider />
        <Education crest={findArt("education-crest")} />
        <InkDivider />
        <Certifications />
        <InkDivider />
        <Projects artFiles={projectArt} />
        <InkDivider />
        <Achievements banner={findArt("achievements-banner")} />
        <InkDivider />
        <Articles banner={findArt("writing-banner")} />
        <InkDivider />
        <Stats />
        <InkDivider />
        <Contact art={findArt("contact-signal")} />
        <Footer />
      </main>
    </>
  );
}
