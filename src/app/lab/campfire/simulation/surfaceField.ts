import { T_AMBIENT } from "./constants";
import type { SurfaceField } from "./types";

export function createSurfaceField(width: number, height: number): SurfaceField {
  const n = width * height;
  const temperature = new Float32Array(n);
  const fuel = new Float32Array(n);
  const char = new Float32Array(n);
  temperature.fill(T_AMBIENT);
  fuel.fill(1);
  // char is zero-filled by default
  return { width, height, temperature, fuel, char };
}

// vRange is in [0,1] over the log length. Inclusive of vMin row, exclusive of vMax row.
function vRangeToRows(
  height: number,
  [vMin, vMax]: [number, number]
): [number, number] {
  const rowMin = Math.max(0, Math.floor(vMin * height));
  const rowMax = Math.min(height, Math.ceil(vMax * height));
  return [rowMin, rowMax];
}

export function igniteBand(
  field: SurfaceField,
  vRange: [number, number],
  temperatureK: number,
  fuelFracRemaining: number
): void {
  const [rMin, rMax] = vRangeToRows(field.height, vRange);
  for (let v = rMin; v < rMax; v++) {
    for (let u = 0; u < field.width; u++) {
      const i = v * field.width + u;
      field.temperature[i] = temperatureK;
      field.fuel[i] = fuelFracRemaining;
    }
  }
}

export function averageInVRange(
  data: Float32Array,
  width: number,
  height: number,
  vRange: [number, number]
): number {
  const [rMin, rMax] = vRangeToRows(height, vRange);
  if (rMax <= rMin) return 0;
  let sum = 0;
  const start = rMin * width;
  const end = rMax * width;
  for (let i = start; i < end; i++) sum += data[i];
  return sum / (end - start);
}

export function sumInVRange(
  data: Float32Array,
  width: number,
  height: number,
  vRange: [number, number]
): number {
  const [rMin, rMax] = vRangeToRows(height, vRange);
  let sum = 0;
  const start = rMin * width;
  const end = rMax * width;
  for (let i = start; i < end; i++) sum += data[i];
  return sum;
}
