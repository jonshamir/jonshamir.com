"use client";

import LabItem from "./components/LabItem/LabItem";

const EXPERIMENTS = [
  { title: "Rect", slug: "rect" },
  { title: "Earth", slug: "earth" },
  { title: "Craters", slug: "craters" },
  { title: "Plant", slug: "plant" }
];

export default function Page() {
  return (
    <>
      <h1>Lab</h1>
      <p>Small projects & experiments</p>
      <p>
        <br />
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        {EXPERIMENTS.map((e) => (
          <LabItem
            key={e.slug}
            image={`/lab/${e.slug}.png`}
            title={e.title}
            link={`/lab/${e.slug}`}
          />
        ))}
      </div>
    </>
  );
}
