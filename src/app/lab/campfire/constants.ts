import type { LogKind, Species } from "./types";

export const SPECIES_DENSITY: Record<Species, number> = {
  pine: 450,
  oak: 700,
  birch: 650
};

export const LOG_KINDS: Record<
  LogKind,
  {
    label: string;
    length: number;
    radius: number;
    segmentCount: number;
    species: Species;
    color: string;
  }
> = {
  twig: {
    label: "Twig",
    length: 0.06,
    radius: 0.004,
    segmentCount: 1,
    species: "birch",
    color: "#6a4a2a"
  },
  stick: {
    label: "Stick",
    length: 0.22,
    radius: 0.012,
    segmentCount: 3,
    species: "pine",
    color: "#7a5836"
  },
  log: {
    label: "Log",
    length: 0.34,
    radius: 0.035,
    segmentCount: 5,
    species: "oak",
    color: "#5a3a20"
  },
  "fat-log": {
    label: "Fat Log",
    length: 0.4,
    radius: 0.06,
    segmentCount: 6,
    species: "oak",
    color: "#4a2e18"
  }
};

// Physics tuning
export const LOG_RESTITUTION = 0.1;
export const LOG_FRICTION = 0.6;
export const SOLVER_ITERATIONS = 8;

// Pit geometry
export const PIT_RADIUS = 0.55;
export const PIT_DEPTH = 0.08;
export const STONE_COUNT = 9;
