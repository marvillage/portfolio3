import BackgroundScene from "@/components/BackgroundScene";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Articles from "@/components/Articles";
import Stats from "@/components/Stats";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <BackgroundScene />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Articles />
        <Stats />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
