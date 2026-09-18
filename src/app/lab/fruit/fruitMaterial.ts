import {
  cameraPosition,
  dot,
  faceDirection,
  float,
  Fn,
  If,
  mix,
  mx_fractal_noise_float,
  mx_fractal_noise_float_2d,
  mx_worley_noise_float,
  normalWorld,
  positionLocal,
  positionWorld,
  screenCoordinate,
  smoothstep,
  uniform
} from "three/tsl";
import { Color, MathUtils, MeshBasicNodeMaterial, Vector3 } from "three/webgpu";

import type { GrainControls, ShadingControls } from "./fruitControls";

// Fixed rather than exposed: the octave count is the loop bound inside
// mx_fractal_noise_float, and keeping it a build-time constant avoids a
// dynamically-bounded loop on the WebGL fallback.
const DITHER_OCTAVES = 3;

// How far, in pixels, the dither is allowed to push the specular cut.
const SPEC_DITHER_PIXELS = 3;

function createFruitUniforms() {
  return {
    lightDirection: uniform(new Vector3(0.4, 0.7, 0.55)),
    colorLight: uniform(new Color("#e8503a")),
    colorShadow: uniform(new Color("#7c2340")),
    colorSplatter: uniform(new Color("#3d1420")),
    bands: uniform(4),
    bandSoftness: uniform(0),
    ambient: uniform(0.15),
    specCut: uniform(0.5),
    specPower: uniform(40),
    specStrength: uniform(0.6),
    // screenCoordinate is in device pixels, so the screen-space sizes below are
    // scaled by this to stay constant in CSS pixels across displays.
    pixelRatio: uniform(1),
    objectDitherStrength: uniform(0),
    objectDitherScale: uniform(60),
    screenDitherStrength: uniform(0),
    screenDitherSize: uniform(6),
    splatterStrength: uniform(0),
    splatterScale: uniform(8),
    splatterCut: uniform(0.35),
    splatterSoftness: uniform(0.05)
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

    // Two dither layers, summed. They differ in what they are anchored to, and
    // their scale sliders read in opposite directions as a result.
    const dither = float(0).toVar();

    // Object space: the grain sits on the surface and turns with it, so it
    // reads as texture belonging to the fruit. Scale is cycles per unit, so
    // bigger is finer, and the pattern grows with the fruit.
    If(uniforms.objectDitherStrength.greaterThan(0), () => {
      dither.addAssign(
        mx_fractal_noise_float(
          positionLocal.mul(uniforms.objectDitherScale),
          DITHER_OCTAVES
        ).mul(uniforms.objectDitherStrength)
      );
    });

    // Screen space: size is a period in CSS pixels, so bigger is coarser and
    // the grain holds its size however far away the fruit is. Pinned to the
    // screen, so the surface moves underneath it as the camera orbits.
    If(uniforms.screenDitherStrength.greaterThan(0), () => {
      dither.addAssign(
        mx_fractal_noise_float_2d(
          screenCoordinate.div(
            uniforms.screenDitherSize.mul(uniforms.pixelRatio)
          ),
          DITHER_OCTAVES
        ).mul(uniforms.screenDitherStrength)
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
    const shade = mix(posterized, lit, uniforms.bandSoftness)
      .add(uniforms.ambient)
      .saturate();

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
      specular.add(dither.mul(specularWidth).mul(SPEC_DITHER_PIXELS))
    );

    base.addAssign(specularBand.mul(uniforms.specStrength));

    return base;
  })();

  return { material, uniforms };
}

export function applyShading(
  uniforms: FruitUniforms,
  shading: ShadingControls
): void {
  uniforms.bands.value = shading.bands;
  uniforms.bandSoftness.value = shading.bandSoftness;
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
  grain: GrainControls,
  pixelRatio: number
): void {
  uniforms.pixelRatio.value = pixelRatio;
  uniforms.objectDitherStrength.value = grain.objectDitherStrength;
  uniforms.objectDitherScale.value = grain.objectDitherScale;
  uniforms.screenDitherStrength.value = grain.screenDitherStrength;
  uniforms.screenDitherSize.value = grain.screenDitherSize;
  uniforms.splatterStrength.value = grain.splatterStrength;
  uniforms.splatterScale.value = grain.splatterScale;
  uniforms.splatterCut.value = grain.splatterCut;
  uniforms.splatterSoftness.value = grain.splatterSoftness;
}

export function applyColors(
  uniforms: FruitUniforms,
  light: string,
  shadow: string,
  splatter: string
): void {
  uniforms.colorLight.value.set(light);
  uniforms.colorShadow.value.set(shadow);
  uniforms.colorSplatter.value.set(splatter);
}
