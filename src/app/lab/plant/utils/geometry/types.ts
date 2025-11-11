/**
 * Type definitions for geometry generation
 */

/**
 * RGB color tuple
 */
export type ColorTuple = [number, number, number];

/**
 * Result from plant geometry generators (leaf, stem, flower)
 * Includes vertex data, indices, local coordinates, and per-vertex colors
 */
export interface PlantGeometryResult {
  /** Flat array of vertex positions [x, y, z, x, y, z, ...] */
  vertices: number[];
  /** Triangle indices into the vertices array */
  indices: number[];
  /** Local X coordinates for each vertex (-1 to 1 around cross-section) */
  localX: number[];
  /** Local Y coordinates for each vertex (-1 to 1 around cross-section) */
  localY: number[];
  /** Local Z coordinates for each vertex (0 at base, 1 at tip) */
  localZ: number[];
  /** Base color RGB values for each vertex [r, g, b, r, g, b, ...] */
  vertexBaseColors: number[];
  /** Shadow color RGB values for each vertex */
  vertexShadowColors: number[];
  /** Subsurface scattering color RGB values for each vertex */
  vertexSubsurfaceColors: number[];
}

/**
 * Result from pot geometry generator
 * Similar to PlantGeometryResult but without color attributes
 */
export interface PotGeometryResult {
  /** Flat array of vertex positions [x, y, z, x, y, z, ...] */
  vertices: number[];
  /** Triangle indices into the vertices array */
  indices: number[];
  /** Local X coordinates for each vertex */
  localX: number[];
  /** Local Y coordinates for each vertex */
  localY: number[];
  /** Local Z coordinates for each vertex (0 at bottom, 1 at top) */
  localZ: number[];
}
