import * as THREE from "three";

export interface FoodType {
  name: string;
  geometry: () => THREE.BufferGeometry;
  color: string;
  scale: [number, number, number];
  mass: number;
  restitution: number;
  friction: number;
  colliderRadius: number;
}

export const FOOD_TYPES: FoodType[] = [
  {
    name: "rice",
    geometry: () => new THREE.CapsuleGeometry(0.015, 0.03, 4, 8),
    color: "#f5f5dc",
    scale: [1, 1, 1],
    mass: 0.02,
    restitution: 0.1,
    friction: 0.8,
    colliderRadius: 0.05
  },
  {
    name: "carrot",
    geometry: () => new THREE.BoxGeometry(0.08, 0.04, 0.08),
    color: "#ff6b35",
    scale: [1, 1, 1],
    mass: 0.1,
    restitution: 0.2,
    friction: 0.5,
    colliderRadius: 0.06
  },
  {
    name: "pea",
    geometry: () => new THREE.SphereGeometry(0.04, 8, 8),
    color: "#228b22",
    scale: [1, 1, 1],
    mass: 0.05,
    restitution: 0.3,
    friction: 0.4,
    colliderRadius: 0.045
  },
  {
    name: "tofu",
    geometry: () => new THREE.BoxGeometry(0.1, 0.1, 0.1),
    color: "#faf0e6",
    scale: [1, 1, 1],
    mass: 0.15,
    restitution: 0.1,
    friction: 0.7,
    colliderRadius: 0.07
  },
  {
    name: "broccoli",
    geometry: () => new THREE.IcosahedronGeometry(0.06, 0),
    color: "#2e8b57",
    scale: [1, 0.8, 1],
    mass: 0.08,
    restitution: 0.15,
    friction: 0.6,
    colliderRadius: 0.065
  }
];

// Get random food type with weighted distribution (rice most common)
export function getRandomFoodType(): FoodType {
  const weights = [50, 15, 15, 10, 10]; // Rice, carrot, pea, tofu, broccoli
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return FOOD_TYPES[i];
  }
  return FOOD_TYPES[0];
}
