import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

type MeasuringPoint = {
  x: number;
  y: number;
};

function distance(pointA: MeasuringPoint, pointB: MeasuringPoint) {
  return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

export function WindowPicker() {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [pointA, setPointA] = useState<MeasuringPoint | null>(null);
  const [pointB, setPointB] = useState<MeasuringPoint | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const svg = d3.select(containerRef.current);

    svg.on("click", (event) => {
      const [x, y] = d3.pointer(event);

      if (pointA === null) {
        setPointA({ x, y });
      } else {
        setPointB({ x, y });
      }

      console.log("points:", pointA, pointB);
    });
  }, [pointA, pointB]);

  return (
    <>
      <h1>Window Picker</h1>
      <p>
        Point A: [{pointA?.x}, {pointA?.y}]
        <br />
        Point B: [{pointB?.x}, {pointB?.y}]
        <br />
        Distance: {pointA && pointB ? distance(pointA, pointB) : "N/A"}
      </p>
      <svg
        ref={containerRef}
        style={{ backgroundColor: "black", width: "100%", height: "30rem" }}
      >
        <g>
          <image href="/lab/window.jpg" width={500} height={500} />
          <circle cx={pointA?.x} cy={pointA?.y} r={5} fill="red" />
          <circle cx={pointB?.x} cy={pointB?.y} r={5} fill="red" />
        </g>
      </svg>
    </>
  );
}
