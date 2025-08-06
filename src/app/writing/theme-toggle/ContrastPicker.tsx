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

function calculateColorDifference(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const xyz1 = rgbToXyz(rgb1);
  const xyz2 = rgbToXyz(rgb2);

  const lab1 = xyzToLab(xyz1);
  const lab2 = xyzToLab(xyz2);

  return calculateDeltaE2000(lab1, lab2);
}

export function ContrastPicker() {
  const [color1, setColor1] = useState("rgb(0, 0, 0)");
  const [color2, setColor2] = useState("#ffffff");

  const deltaE = calculateColorDifference(color1, color2);

  return (
    <figure>
      <div
        className={styles.ContrastPicker}
        style={{ backgroundColor: color1 }}
      >
        <div className={styles.box} style={{ backgroundColor: color2 }} />
        <p>Delta-E 2000: {deltaE.toFixed(2)}</p>
        <div className={styles.colorPicker}>
          <input
            type="color"
            value={color1}
            onChange={(e) => setColor1(e.target.value)}
          />
          <input
            type="color"
            value={color2}
            onChange={(e) => setColor2(e.target.value)}
          />
        </div>
      </div>
    </figure>
  );
}
