"use client";
import { useState } from "react";

import styles from "./ContrastPicker.module.css";

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
}

function rgbToXyz([r, g, b]: [number, number, number]): [
  number,
  number,
  number
] {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  return [x * 100, y * 100, z * 100];
}

function xyzToLab([x, y, z]: [number, number, number]): [
  number,
  number,
  number
] {
  x = x / 95.047;
  y = y / 100.0;
  z = z / 108.883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  const L = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return [L, a, b];
}

function calculateDeltaE2000(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  const deltaL = L2 - L1;
  const avgL = (L1 + L2) / 2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (C1 + C2) / 2;

  const G =
    0.5 *
    (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));

  const a1Prime = a1 * (1 + G);
  const a2Prime = a2 * (1 + G);

  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
  const avgCPrime = (C1Prime + C2Prime) / 2;
  const deltaCPrime = C2Prime - C1Prime;

  let h1Prime = (Math.atan2(b1, a1Prime) * 180) / Math.PI;
  if (h1Prime < 0) h1Prime += 360;

  let h2Prime = (Math.atan2(b2, a2Prime) * 180) / Math.PI;
  if (h2Prime < 0) h2Prime += 360;

  let deltaHPrime = h2Prime - h1Prime;
  if (Math.abs(deltaHPrime) > 180) {
    deltaHPrime = deltaHPrime > 180 ? deltaHPrime - 360 : deltaHPrime + 360;
  }

  const deltaHPrimeRad = (deltaHPrime * Math.PI) / 180;
  const avgHPrime =
    Math.abs(h1Prime - h2Prime) > 180
      ? (h1Prime + h2Prime + 360) / 2
      : (h1Prime + h2Prime) / 2;

  const T =
    1 -
    0.17 * Math.cos(((avgHPrime - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * avgHPrime * Math.PI) / 180) +
    0.32 * Math.cos(((3 * avgHPrime + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * avgHPrime - 63) * Math.PI) / 180);

  const deltaTheta = 30 * Math.exp(-Math.pow((avgHPrime - 275) / 25, 2));
  const RC =
    2 *
    Math.sqrt(
      Math.pow(avgCPrime, 7) / (Math.pow(avgCPrime, 7) + Math.pow(25, 7))
    );

  const SL =
    1 +
    (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const SC = 1 + 0.045 * avgCPrime;
  const SH = 1 + 0.015 * avgCPrime * T;
  const RT = -Math.sin((2 * deltaTheta * Math.PI) / 180) * RC;

  const deltaE = Math.sqrt(
    Math.pow(deltaL / SL, 2) +
      Math.pow(deltaCPrime / SC, 2) +
      Math.pow(
        (2 * Math.sqrt(C1Prime * C2Prime) * Math.sin(deltaHPrimeRad / 2)) / SH,
        2
      ) +
      RT *
        (deltaCPrime / SC) *
        ((2 * Math.sqrt(C1Prime * C2Prime) * Math.sin(deltaHPrimeRad / 2)) / SH)
  );

  return deltaE;
}

function blendColors(
  foreground: [number, number, number],
  background: [number, number, number],
  alpha: number
): [number, number, number] {
  const blendedR = Math.round(
    foreground[0] * alpha + background[0] * (1 - alpha)
  );
  const blendedG = Math.round(
    foreground[1] * alpha + background[1] * (1 - alpha)
  );
  const blendedB = Math.round(
    foreground[2] * alpha + background[2] * (1 - alpha)
  );

  return [blendedR, blendedG, blendedB];
}

function calculateColorDifference(
  foregroundColor: string,
  backgroundColor: string,
  alpha: number = 1
): number {
  const foregroundRgb = hexToRgb(foregroundColor);
  const backgroundRgb = hexToRgb(backgroundColor);

  const blendedRgb = blendColors(foregroundRgb, backgroundRgb, alpha);

  const xyz1 = rgbToXyz(blendedRgb);
  const xyz2 = rgbToXyz(backgroundRgb);

  const lab1 = xyzToLab(xyz1);
  const lab2 = xyzToLab(xyz2);

  return calculateDeltaE2000(lab1, lab2);
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function findMatchingAlpha(
  targetDeltaE: number,
  foregroundColor: string,
  backgroundColor: string
): number {
  const alphaValues = Array.from({ length: 20 }, (_, i) => i / 19);
  const deltaEValues = alphaValues.map((alpha) =>
    calculateColorDifference(foregroundColor, backgroundColor, alpha)
  );

  let closestIndex = 0;
  let closestDiff = Math.abs(deltaEValues[0] - targetDeltaE);

  for (let i = 1; i < deltaEValues.length; i++) {
    const diff = Math.abs(deltaEValues[i] - targetDeltaE);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }

  if (closestIndex === 0 || closestIndex === deltaEValues.length - 1) {
    return alphaValues[closestIndex];
  }

  const alpha1 = alphaValues[closestIndex - 1];
  const alpha2 = alphaValues[closestIndex + 1];
  const deltaE1 = deltaEValues[closestIndex - 1];
  const deltaE2 = deltaEValues[closestIndex + 1];

  const t = (targetDeltaE - deltaE1) / (deltaE2 - deltaE1);
  return alpha1 + t * (alpha2 - alpha1);
}

function DeltaEGraph({
  foregroundColor,
  backgroundColor
}: {
  foregroundColor: string;
  backgroundColor: string;
}) {
  const width = 400;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const alphaValues = Array.from({ length: 20 }, (_, i) => i / 19);
  const deltaEValues = alphaValues.map((alpha) =>
    calculateColorDifference(foregroundColor, backgroundColor, alpha)
  );

  const maxDeltaE = Math.max(...deltaEValues);
  const minDeltaE = Math.min(...deltaEValues);

  const points = alphaValues
    .map((alpha, i) => {
      const x = alpha * chartWidth + margin.left;
      const y =
        margin.top +
        (1 - (deltaEValues[i] - minDeltaE) / (maxDeltaE - minDeltaE)) *
          chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={styles.graph}>
      <svg width={width} height={height}>
        <g>
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="#666"
            strokeWidth={1}
          />
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="#666"
            strokeWidth={1}
          />

          <text
            x={margin.left / 2}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${margin.left / 2} ${height / 2})`}
            fontSize="12"
            fill="#666"
          >
            Delta-E 2000
          </text>
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            Alpha
          </text>

          <text
            x={margin.left - 10}
            y={margin.top + 5}
            textAnchor="end"
            fontSize="10"
            fill="#666"
          >
            {maxDeltaE.toFixed(1)}
          </text>
          <text
            x={margin.left - 10}
            y={height - margin.bottom + 5}
            textAnchor="end"
            fontSize="10"
            fill="#666"
          >
            {minDeltaE.toFixed(1)}
          </text>

          <text
            x={margin.left}
            y={height - margin.bottom + 20}
            textAnchor="middle"
            fontSize="10"
            fill="#666"
          >
            0
          </text>
          <text
            x={width - margin.right}
            y={height - margin.bottom + 20}
            textAnchor="middle"
            fontSize="10"
            fill="#666"
          >
            1
          </text>

          <polyline
            fill="none"
            stroke="#0070f3"
            strokeWidth={2}
            points={points}
          />

          {alphaValues.map((alpha, i) => (
            <circle
              key={i}
              cx={alpha * chartWidth + margin.left}
              cy={
                margin.top +
                (1 - (deltaEValues[i] - minDeltaE) / (maxDeltaE - minDeltaE)) *
                  chartHeight
              }
              r={3}
              fill="#0070f3"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function ContrastPicker() {
  const [foregroundColor, setForegroundColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [alpha, setAlpha] = useState(1);
  const [usePerceptualAdjustment, setUsePerceptualAdjustment] = useState(true);

  const foregroundRgb = hexToRgb(foregroundColor);
  const backgroundRgb = hexToRgb(backgroundColor);
  const blendedRgb = blendColors(foregroundRgb, backgroundRgb, alpha);
  const blendedHex = rgbToHex(blendedRgb);

  const deltaE = calculateColorDifference(
    foregroundColor,
    backgroundColor,
    alpha
  );

  const alpha2 = usePerceptualAdjustment
    ? findMatchingAlpha(deltaE, backgroundColor, foregroundColor)
    : alpha;
  const flippedForegroundRgb = hexToRgb(backgroundColor);
  const flippedBackgroundRgb = hexToRgb(foregroundColor);
  const flippedBlendedRgb = blendColors(
    flippedForegroundRgb,
    flippedBackgroundRgb,
    alpha2
  );
  const flippedBlendedHex = rgbToHex(flippedBlendedRgb);

  const swapColors = () => {
    const temp = foregroundColor;
    setForegroundColor(backgroundColor);
    setBackgroundColor(temp);
  };

  return (
    <figure>
      <div className={styles.ContrastPicker}>
        <div className={styles.colorBoxes}>
          <div
            className={styles.box}
            style={{
              backgroundColor
            }}
          >
            <div style={{ backgroundColor: blendedHex }} />
          </div>
          <div
            id="flipped"
            className={styles.box}
            style={{
              backgroundColor: foregroundColor
            }}
          >
            <div style={{ backgroundColor: flippedBlendedHex }} />
          </div>
        </div>
        <p>
          Delta-E 2000: {deltaE.toFixed(2)}
          <br />
          Alpha: {alpha.toFixed(2)}
          <br />
          Alpha2 (flipped): {alpha2.toFixed(2)}
        </p>
        <div className={styles.checkbox}>
          <label>
            <input
              type="checkbox"
              checked={usePerceptualAdjustment}
              onChange={(e) => setUsePerceptualAdjustment(e.target.checked)}
            />
            Perceptual adjustment (Delta-E matching)
          </label>
        </div>
        <DeltaEGraph
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
        />
        <div className={styles.colorPicker}>
          <input
            type="color"
            value={foregroundColor}
            onChange={(e) => setForegroundColor(e.target.value)}
          />
          <button onClick={swapColors} className={styles.swapButton}>
            ⇄
          </button>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </figure>
  );
}
