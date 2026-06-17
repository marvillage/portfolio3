"use client";

import dynamic from "next/dynamic";

// Load the WebGL scene only on the client (three.js touches window/canvas).
const SpaceScene = dynamic(() => import("./SpaceScene"), { ssr: false });

export default function BackgroundScene() {
  return <SpaceScene />;
}
