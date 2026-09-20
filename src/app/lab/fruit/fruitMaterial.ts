import {
  cameraPosition,
  dot,
  faceDirection,
  float,
  Fn,
  If,
  mix,
  mx_fractal_noise_float,
  mx_worley_noise_float,
  normalLocal,
  normalWorld,
  positionLocal,
  positionWorld,
  smoothstep,
  uniform,
  uv,
  vec3
} from "three/tsl";
import { Color, MathUtils, MeshBasicNodeMaterial, Vector3 } from "three/webgpu";

import type { GrainControls, ShadingControls } from "./fruitControls";
import type { SurfaceMetrics } from "./fruitGeometry";

// Fixed rather than exposed: the octave count is the loop bound inside
// mx_fractal_noise_float, and keeping it a build-time constant avoids a
// dynamically-bounded loop on the WebGL fallback.
const DITHER_OCTAVES = 3;

// Vertex jitter. Offsets are measured in grid cells and capped below half a
// cell, past which neighbouring quads would fold through each other.
const JITTER_OCTAVES = 2;
const JITTER_FOLD_LIMIT = 0.45;
// How much of the profile at each end fades the jitter out. The pole ring
// collapses to a single point, so moving those vertices apart tears it open.
const JITTER_POLE_FADE = 0.12;
// Decorrelates the second noise channel from the first.
const JITTER_CHANNEL_OFFSET = 31.7;

function createFruitUniforms() {
  return {
    lightDirection: uniform(new Vector3(0.4, 0.7, 0.55)),
    colorLight: uniform(new Color("#e8503a")),
    colorShadow: uniform(new Color("#7c2340")),
    colorSplatter: uniform(new Color("#3d1420")),
    colorSpecular: uniform(new Color("#ffffff")),
    bands: uniform(4),
    ambient: uniform(0.15),
    specCut: uniform(0.5),
    specPower: uniform(40),
    specStrength: uniform(0.6),
    objectDitherStrength: uniform(0),
    objectDitherScale: uniform(60),
    // How far, in pixels, the dither is allowed to push the specular cut.
    specDither: uniform(10),
    splatterStrength: uniform(0),
    splatterScale: uniform(8),
    splatterCut: uniform(0.35),
    splatterSoftness: uniform(0.05),
    jitterStrength: uniform(0),
    jitterScale: uniform(4),
    jitterSeed: uniform(0),
    // One cell of the body grid, supplied by createFruitGeometries.
    jitterCellAngle: uniform(0.1),
    jitterCellLength: uniform(0.05)
  };
}

export type FruitUniforms = ReturnType<typeof createFruitUniforms>;

export type FruitMaterial = {
  material: MeshBasicNodeMaterial;
  uniforms: FruitUniforms;
};

// A cel shader: the diffuse term is posterized into bands, and the specular term
// is cut to a hard shape rather than falling off smoothly.
//
// The grain layers are gated on their own strength, so a layer left at 0 costs
// nothing: the conditions are uniform across the draw call, the branch is
// coherent, and the GPU really does skip the noise lookup.
export function createFruitMaterial(): FruitMaterial {
  const uniforms = createFruitUniforms();
  const material = new MeshBasicNodeMaterial();

  // Slides each vertex across the surface it already sits on, rather than
  // displacing it off the surface. The (theta, v) parameterisation IS the
  // tangent chart of a surface of revolution, so a parameter-space offset is a
  // tangential one — the silhouette and volume are unchanged, only the
  // tessellation moves.
  // Slides each vertex across the surface it already sits on, rather than
  // displacing it off the surface. The (theta, v) parameterisation IS the
  // tangent chart of a surface of revolution, so a parameter-space offset is a
  // tangential one — the silhouette and volume are unchanged, only the
  // tessellation moves.
  //
  // Deliberately unbranched, unlike the grain layers in colorNode. normalLocal
  // is a .toVar(), so it declares its variable at first use: reading it inside
  // an `If` would scope that declaration to the branch, and everything reading
  // the normal afterwards would get an uninitialised value whenever the branch
  // was skipped. A vertex shader runs a few hundred times here against roughly
  // a million fragments, so the branch saved nothing worth that risk.
  material.positionNode = Fn(() => {
    const v = uv().y;
    const theta = uv().x.mul(Math.PI * 2);
    const sinTheta = theta.sin();
    const cosTheta = theta.cos();

    // Sampled on the circle rather than on u, so the duplicated seam column
    // gets an identical offset and the seam cannot split open.
    const noiseAt = vec3(cosTheta, sinTheta, v)
      .mul(uniforms.jitterScale)
      .add(uniforms.jitterSeed);

    const around = mx_fractal_noise_float(noiseAt, JITTER_OCTAVES);
    const along = mx_fractal_noise_float(
      noiseAt.add(JITTER_CHANNEL_OFFSET),
      JITTER_OCTAVES
    );

    // Fades to nothing at both poles: the ring there collapses to a single
    // point, and moving those vertices apart would tear it into a star.
    const fade = smoothstep(0, JITTER_POLE_FADE, v).mul(
      smoothstep(0, JITTER_POLE_FADE, v.oneMinus())
    );
    const amount = uniforms.jitterStrength.mul(fade).mul(JITTER_FOLD_LIMIT);

    // A rotation about the axis is exact: the vertex lands precisely on the
    // surface, where stepping along the tangent would cut the chord. At
    // strength 0 this is the identity, so the position passes through untouched.
    const dTheta = around.mul(amount).mul(uniforms.jitterCellAngle);
    const rotCos = dTheta.cos();
    const rotSin = dTheta.sin();
    const rotated = vec3(
      positionLocal.x.mul(rotCos).sub(positionLocal.z.mul(rotSin)),
      positionLocal.y,
      positionLocal.x.mul(rotSin).add(positionLocal.z.mul(rotCos))
    );

    // Along the profile there is no closed form without the curve, so this
    // steps along the surface tangent instead. Both tangents come free from
    // data already on the mesh: the horizontal one from uv.x, the other from
    // its cross product with the normal. Offsets stay under one cell, so the
    // deviation is offset^2/2R — around 0.0003 at unit radius.
    const tangentAround = vec3(sinTheta.negate(), 0, cosTheta);
    const tangentAlong = normalLocal.cross(tangentAround);
    const dAlong = along.mul(amount).mul(uniforms.jitterCellLength);

    return rotated.add(tangentAlong.mul(dAlong));
  })();

  // colorNode rather than fragmentNode: it feeds the regular output pipeline, so
  // tone mapping and the sRGB output transform still get applied. That is also
  // why the colour uniforms are plain Colors here and there is no manual
  // linear->sRGB step like the repo's raw-GLSL materials have.
  material.colorNode = Fn(() => {
    // faceDirection is TSL's ±1 facing float. The cap is DoubleSide, so its
    // underside has to shade with the flipped normal.
    const normal = normalWorld.mul(faceDirection).normalize();
    const light = uniforms.lightDirection.normalize();
    const view = cameraPosition.sub(positionWorld).normalize();

    // Object space: the grain sits on the surface and turns with it, so it
    // reads as texture belonging to the fruit. Scale is cycles per unit, so
    // bigger is finer, and the pattern grows with the fruit.
    const dither = float(0).toVar();
    If(uniforms.objectDitherStrength.greaterThan(0), () => {
      dither.addAssign(
        mx_fractal_noise_float(
          positionLocal.mul(uniforms.objectDitherScale),
          DITHER_OCTAVES
        ).mul(uniforms.objectDitherStrength)
      );
    });

    // Everything thresholded from here down is offset by that same dither, so
    // the band edges, the blob outlines and the specular cut all break up
    // together instead of the grain stopping at the diffuse term.

    // Worley returns distance to the nearest feature point, so the low values
    // are the blob centres. Object space, like the splatter scale: a blotch is
    // a mark on the skin and has to travel with the surface, and sampling in 3D
    // avoids the seam and the pole compression the revolved UVs would bring.
    //
    // The dither displaces the distance field itself, which makes the outlines
    // genuinely ragged rather than just wobbling a clean edge.
    const splatter = float(0).toVar();
    If(uniforms.splatterStrength.greaterThan(0), () => {
      const cells = mx_worley_noise_float(
        positionLocal.mul(uniforms.splatterScale)
      ).add(dither);
      splatter.assign(
        smoothstep(
          uniforms.splatterCut.sub(uniforms.splatterSoftness),
          uniforms.splatterCut.add(uniforms.splatterSoftness),
          cells
        )
          .oneMinus()
          .mul(uniforms.splatterStrength)
      );
    });

    // Dithering the value that gets posterized is what breaks the band edges
    // into speckle while leaving the flat interior of each band alone.
    const lit = dot(normal, light).max(0).add(dither);
    const posterized = lit.mul(uniforms.bands).floor().div(uniforms.bands);
    const shade = posterized.add(uniforms.ambient).saturate();

    const base = mix(uniforms.colorShadow, uniforms.colorLight, shade).toVar();

    // Normal blending: the blotch replaces the skin colour outright rather than
    // tinting it, so it sits as flat ink on top of the shading instead of
    // letting the bands read through.
    base.assign(mix(base, uniforms.colorSplatter, splatter));

    const specular = dot(normal, light.add(view).normalize())
      .max(0)
      .pow(uniforms.specPower);

    // fwidth is one pixel of the term's own gradient. It antialiases the cut,
    // and scaling the dither by it offsets the edge in pixels rather than in
    // specular units. That distinction matters here: pow(x, specPower) is very
    // nearly binary, so adding the raw dither would push stray pixels over the
    // cutoff across the whole surface instead of roughening the dot. Away from
    // the highlight the gradient falls to ~0 and the offset vanishes with it.
    const specularWidth = specular.fwidth().toVar();
    const specularBand = smoothstep(
      uniforms.specCut.sub(specularWidth),
      uniforms.specCut.add(specularWidth),
      specular.add(dither.mul(specularWidth).mul(uniforms.specDither))
    );

    // Added rather than mixed, so the highlight reads as light falling on the
    // skin. White leaves the term achromatic, exactly as before it was a colour.
    base.addAssign(
      uniforms.colorSpecular.mul(specularBand).mul(uniforms.specStrength)
    );

    return base;
  })();

  return { material, uniforms };
}

// The cap is a triangle fan, not a revolve: its uv has no relation to the
// profile, so it passes strength 0 and the shader's own guard skips the whole
// block.
export function applyJitter(
  uniforms: FruitUniforms,
  jitter: { jitterStrength: number; jitterScale: number; jitterSeed: number },
  metrics: SurfaceMetrics
): void {
  uniforms.jitterStrength.value = jitter.jitterStrength;
  uniforms.jitterScale.value = jitter.jitterScale;
  uniforms.jitterSeed.value = jitter.jitterSeed;
  uniforms.jitterCellAngle.value = metrics.cellAngle;
  uniforms.jitterCellLength.value = metrics.cellLength;
}

export function applyShading(
  uniforms: FruitUniforms,
  shading: ShadingControls
): void {
  uniforms.bands.value = shading.bands;
  uniforms.ambient.value = shading.ambient;
  uniforms.specCut.value = shading.specCut;
  uniforms.specPower.value = shading.specPower;
  uniforms.specStrength.value = shading.specStrength;

  const yaw = MathUtils.degToRad(shading.lightYaw);
  const pitch = MathUtils.degToRad(shading.lightPitch);
  uniforms.lightDirection.value.set(
    Math.cos(pitch) * Math.sin(yaw),
    Math.sin(pitch),
    Math.cos(pitch) * Math.cos(yaw)
  );
}

export function applyGrain(
  uniforms: FruitUniforms,
  grain: GrainControls
): void {
  uniforms.objectDitherStrength.value = grain.objectDitherStrength;
  uniforms.objectDitherScale.value = grain.objectDitherScale;
  uniforms.specDither.value = grain.specDither;
  uniforms.splatterStrength.value = grain.splatterStrength;
  uniforms.splatterScale.value = grain.splatterScale;
  uniforms.splatterCut.value = grain.splatterCut;
  uniforms.splatterSoftness.value = grain.splatterSoftness;
}

// Named rather than positional: every field is a colour string, so an argument
// out of order would type-check and quietly paint the wrong thing.
export function applyColors(
  uniforms: FruitUniforms,
  colors: { light: string; shadow: string; splatter: string; specular: string }
): void {
  uniforms.colorLight.value.set(colors.light);
  uniforms.colorShadow.value.set(colors.shadow);
  uniforms.colorSplatter.value.set(colors.splatter);
  uniforms.colorSpecular.value.set(colors.specular);
}
