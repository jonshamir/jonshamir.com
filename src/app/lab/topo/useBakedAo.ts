import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { AoMaterial } from "./aoMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";

// AO is low-frequency, so half the render-target resolution of the heightmap
// bake is plenty and keeps the ray-march cost manageable.
const MAX_AO_SIZE = 1024;

// Bakes heightfield HBAO from the input heightmap texture into an R8 texture.
// Re-bakes on the same cadence as the heightmap (any uniform change), plus
// whenever the AO controls change. Runs *after* useBakedHeightmap in the frame
// so it consumes the fresh heightmap target.
export function useBakedAo(
  uniforms: TopoUniforms,
  heightMap: THREE.Texture
): THREE.Texture {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const bake = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new AoMaterial();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    return { scene, camera, material, mesh };
  }, []);

  const renderTarget = useMemo(() => {
    const pixelW = Math.min(Math.round(size.width * dpr * 0.5), MAX_AO_SIZE);
    const pixelH = Math.min(Math.round(size.height * dpr * 0.5), MAX_AO_SIZE);
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
  }, [renderTarget, heightMap]);

  useFrame(() => {
    forwardToMaterial(uniforms, bake.material.uniforms);
    (bake.material.uniforms.uHeightMap as THREE.IUniform<THREE.Texture>).value =
      heightMap;

    // Track every shared topo uniform value (not just the AO material's own
    // uniforms) so the AO re-bakes whenever *anything* that can change the
    // heightmap or AO output changes. forwardToMaterial only copies the
    // subset the AO shader declares, which would miss base/erosion edits.
    const shared = uniforms as unknown as Record<
      string,
      THREE.IUniform<number>
    >;
    const sharedKeys = Object.keys(shared);
    const current = sharedKeys.map((k) => shared[k].value);
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
