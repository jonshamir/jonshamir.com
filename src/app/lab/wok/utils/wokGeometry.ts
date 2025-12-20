import * as THREE from "three";

export interface WokGeometryParams {
  radius?: number;
  depth?: number;
  segments?: number;
  profilePoints?: number;
}

export interface WokSphereParams {
  cy: number; // Y position of sphere center
  sphereRadius: number; // Radius of the sphere
}

/**
 * Get the sphere parameters that define the wok's circular arc.
 * Used for creating an analytical BallCollider that matches the wok shape.
 */
export function getWokSphereParams(
  radius: number,
  depth: number
): WokSphereParams {
  const cy = (radius * radius - depth * depth) / (2 * depth);
  const sphereRadius = Math.sqrt(radius * radius + cy * cy);
  return { cy, sphereRadius };
}

export function createWokGeometry(
  params: WokGeometryParams = {}
): THREE.LatheGeometry {
  const {
    radius = 1.5,
    depth = 0.6,
    segments = 32,
    profilePoints = 16
  } = params;

  // Create circular arc profile for a round-bottom bowl shape
  const points: THREE.Vector2[] = [];

  // Calculate circle parameters that pass through (0, -depth) and (radius, 0)
  // Circle center is at (0, cy) where cy = (radius² - depth²) / (2 * depth)
  const cy = (radius * radius - depth * depth) / (2 * depth);
  const circleRadius = Math.sqrt(radius * radius + cy * cy);

  // Calculate the angle range for the arc
  const startAngle = Math.atan2(-depth - cy, 0); // Bottom of bowl
  const endAngle = Math.atan2(-cy, radius); // Top edge

  for (let i = 0; i <= profilePoints; i++) {
    const t = i / profilePoints;
    const angle = startAngle + t * (endAngle - startAngle);
    const x = circleRadius * Math.cos(angle);
    const y = cy + circleRadius * Math.sin(angle);
    points.push(new THREE.Vector2(Math.abs(x), y));
  }

  return new THREE.LatheGeometry(points, segments, 0, Math.PI * 2);
}

/**
 * Create a thick shell geometry for robust physics collision.
 * This creates a bowl with inner and outer surfaces so trimesh has volume.
 */
export function createWokColliderGeometry(
  params: WokGeometryParams = {}
): THREE.LatheGeometry {
  const {
    radius = 1.5,
    depth = 0.6,
    segments = 32,
    profilePoints = 16
  } = params;

  const thickness = 0.15; // Shell thickness
  const points: THREE.Vector2[] = [];

  const cy = (radius * radius - depth * depth) / (2 * depth);
  const circleRadius = Math.sqrt(radius * radius + cy * cy);

  const startAngle = Math.atan2(-depth - cy, 0);
  const endAngle = Math.atan2(-cy, radius);

  // Outer surface (from bottom to top)
  for (let i = 0; i <= profilePoints; i++) {
    const t = i / profilePoints;
    const angle = startAngle + t * (endAngle - startAngle);
    const x = (circleRadius + thickness) * Math.cos(angle);
    const y = cy + (circleRadius + thickness) * Math.sin(angle);
    points.push(new THREE.Vector2(Math.abs(x), y));
  }

  // Inner surface (from top back to bottom)
  for (let i = profilePoints; i >= 0; i--) {
    const t = i / profilePoints;
    const angle = startAngle + t * (endAngle - startAngle);
    const x = circleRadius * Math.cos(angle);
    const y = cy + circleRadius * Math.sin(angle);
    points.push(new THREE.Vector2(Math.abs(x), y));
  }

  return new THREE.LatheGeometry(points, segments, 0, Math.PI * 2);
}
