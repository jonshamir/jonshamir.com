export type Species = "pine" | "oak" | "birch";

export type LogKind = "twig" | "stick" | "log" | "fat-log";

export type LogSpec = {
  id: string;
  kind: LogKind;
  length: number;
  radius: number;
  segmentCount: number;
  species: Species;
  density_kg_m3: number;
  ignitionVariance: number;
  burnRateVariance: number;
  // Initial placement
  position: [number, number, number];
  rotationY: number;
};
