import {
  cameraPosition,
  dot,
  faceDirection,
  Fn,
  mix,
  normalWorld,
  positionWorld,
  smoothstep,
  uniform
} from "three/tsl";
import { Color, MathUtils, MeshBasicNodeMaterial, Vector3 } from "three/webgpu";

import type { ShadingControls } from "./fruitControls";

function createFruitUniforms() {
  return {
    lightDirection: uniform(new Vector3(0.4, 0.7, 0.55)),
    colorLight: uniform(new Color("#e8503a")),
    colorShadow: uniform(new Color("#7c2340")),
    bands: uniform(4),
    bandSoftness: uniform(0),
    ambient: uniform(0.15),
    specCut: uniform(0.5),
    specPower: uniform(40),
    specStrength: uniform(0.6)
  };
}

export type FruitUniforms = ReturnType<typeof createFruitUniforms>;

export type FruitMaterial = {
  material: MeshBasicNodeMaterial;
  uniforms: FruitUniforms;
};

// A cel shader: the diffuse term is posterized into bands, and the specular term
// is cut to a hard shape rather than falling off smoothly.
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

    const diffuse = dot(normal, light).max(0);
    const posterized = diffuse.mul(uniforms.bands).floor().div(uniforms.bands);
    const shade = mix(posterized, diffuse, uniforms.bandSoftness)
      .add(uniforms.ambient)
      .saturate();

    const base = mix(uniforms.colorShadow, uniforms.colorLight, shade);

    // fwidth widens the cut by exactly one pixel of the term's own gradient,
    // which antialiases the edge without softening the shape.
    const specular = dot(normal, light.add(view).normalize())
      .max(0)
      .pow(uniforms.specPower);
    const specularBand = smoothstep(
      uniforms.specCut.sub(specular.fwidth()),
      uniforms.specCut.add(specular.fwidth()),
      specular
    );

    return base.add(specularBand.mul(uniforms.specStrength));
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

export function applyColors(
  uniforms: FruitUniforms,
  light: string,
  shadow: string
): void {
  uniforms.colorLight.value.set(light);
  uniforms.colorShadow.value.set(shadow);
}
