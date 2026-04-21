import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { HeightmapMaterial } from "./heightmapMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";

const MAX_BAKE_SIZE = 2048;

// Parse a CSS custom property like "49, 53, 59" into a normalized RGB tuple,
// writing into `out` (allocation-free — cheap to call every frame). Leaves
// `out` untouched if the property is empty or malformed.
export function readCssRgb(
  style: CSSStyleDeclaration,
  name: string,
  out: [number, number, number]
): void {
  const raw = style.getPropertyValue(name);
  if (!raw) return;
  let i = 0;
  let start = 0;
  for (let j = 0; j <= raw.length && i < 3; j++) {
    if (j === raw.length || raw.charCodeAt(j) === 44 /* , */) {
      const v = Number(raw.slice(start, j));
      if (Number.isNaN(v)) return;
      out[i++] = v / 255;
      start = j + 1;
    }
  }
}

// Renders the heightmap to an offscreen float32 RT once per uniform change
// and returns the resulting texture. Shared between the 2D contour view and
// the 3D terrain view so both read the same cached heightmap.
export function useBakedHeightmap(uniforms: TopoUniforms): THREE.Texture {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const bake = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new HeightmapMaterial();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    return { scene, camera, material, mesh };
  }, []);

  const renderTarget = useMemo(() => {
    const pixelW = Math.min(Math.round(size.width * dpr), MAX_BAKE_SIZE);
    const pixelH = Math.min(Math.round(size.height * dpr), MAX_BAKE_SIZE);
    return new THREE.WebGLRenderTarget(
      Math.max(1, pixelW),
      Math.max(1, pixelH),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        depthBuffer: false,
        stencilBuffer: false,
        type: THREE.FloatType,
        format: THREE.RGBAFormat
      }
    );
  }, [size.width, size.height, dpr]);

  useEffect(() => {
    return () => {
      renderTarget.dispose();
    };
  }, [renderTarget]);

  useEffect(() => {
    return () => {
      bake.material.dispose();
      bake.mesh.geometry.dispose();
    };
  }, [bake]);

  const lastValues = useRef<number[]>([]);
  const needsBake = useRef(true);

  useEffect(() => {
    needsBake.current = true;
    const u = bake.material.uniforms as Record<string, THREE.IUniform<unknown>>;
    const texel = u.uTexelSize?.value as [number, number] | undefined;
    if (texel) {
      texel[0] = 1 / renderTarget.width;
      texel[1] = 1 / renderTarget.height;
    }
  }, [renderTarget, bake]);

  useFrame(() => {
    forwardToMaterial(uniforms, bake.material.uniforms);

    const bakeUniforms = bake.material.uniforms as Record<
      string,
      THREE.IUniform<unknown>
    >;
    const keys = Object.keys(bakeUniforms);
    const current = keys.map((k) => bakeUniforms[k].value as number);
    const prev = lastValues.current;
    if (prev.length !== current.length) {
      needsBake.current = true;
    } else {
      for (let i = 0; i < current.length; i++) {
        if (prev[i] !== current[i]) {
          needsBake.current = true;
          break;
        }
      }
    }
    lastValues.current = current;

    if (needsBake.current) {
      const prevTarget = gl.getRenderTarget();
      gl.setRenderTarget(renderTarget);
      gl.render(bake.scene, bake.camera);
      gl.setRenderTarget(prevTarget);
      needsBake.current = false;
    }
  });

  return renderTarget.texture;
}
