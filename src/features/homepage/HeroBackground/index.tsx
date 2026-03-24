"use client";

import dynamic from "next/dynamic";

export const HeroBackground = dynamic(
  () => import("./HeroBackground").then((m) => m.HeroBackground),
  { ssr: false }
);
