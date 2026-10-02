"use client";

import { certifications } from "@/data/certifications";
import SectionHeading from "./SectionHeading";
import CertOrbit, { type CertArt } from "./CertOrbit";

export default function Certifications({ art }: { art?: CertArt }) {
  return (
    <section id="certifications" className="relative mx-auto max-w-6xl overflow-x-clip px-6 py-24">
      <SectionHeading
        index="Log 05 · Credentials"
        title="Certifications & Courses"
        subtitle="Verified coursework across AI/ML, web, cloud, security — and a little astrophysics."
      />
      <CertOrbit certs={certifications} art={art ?? { icons: {} }} />
    </section>
  );
}
