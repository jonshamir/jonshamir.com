"use client";

import LabItem from "../../components/LabItem/LabItem";

const EXPERIMENTS = [
  { title: "Rect", slug: "rect" },
  { title: "Earth", slug: "earth" },
  { title: "Craters", slug: "craters" },
  { title: "Plant", slug: "plant" },
];

export default function Page() {
  const experimentList = EXPERIMENTS.map((e) => {
    return (
      <LabItem
        key={e.slug}
        image={`/lab/${e.slug}.png`}
        title={e.title}
        link={`/lab/${e.slug}`}
      />
    );
  });

  return (
    <>
      <p>Small projects, experiments & stuff</p>
      <div style={{ display: "flex", gap: "1rem" }}>{experimentList}</div>
    </>
  );
}
