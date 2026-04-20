import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { ContourMaterial, HeightmapMaterial } from "./heightmapMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";

extend({ HeightmapMaterial, ContourMaterial });

type Props = {
  uniforms: TopoUniforms;
};

const MAX_BAKE_SIZE = 2048;

export function HeightmapQuad({ uniforms }: Props) {
  const contourRef = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  // Offscreen scene containing the bake quad. Lives outside the React scene
  // graph so R3F doesn't try to render it to the default framebuffer.
  const bake = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new HeightmapMaterial();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    return { scene, camera, material, mesh };
  }, []);

  // Render target sized to the drawing buffer (capped). Recreated on resize.
  const renderTarget = useMemo(() => {
    const pixelW = Math.min(Math.round(size.width * dpr), MAX_BAKE_SIZE);
    const pixelH = Math.min(Math.round(size.height * dpr), MAX_BAKE_SIZE);
    const rt = new THREE.WebGLRenderTarget(
      Math.max(1, pixelW),
      Math.max(1, pixelH),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        depthBuffer: false,
        stencilBuffer: false,
        // Half-float is critical here: 8-bit would only give ~256 height
        // levels, which quantizes contour positions into visible bands at
        // high line counts. HalfFloat is widely supported in WebGL2.
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat
      }
    );
    return rt;
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

  // Dirty tracking: re-bake only when a relevant uniform changes (or on resize).
  const lastValues = useRef<number[]>([]);
  const needsBake = useRef(true);

  // Force a re-bake when the render target is (re)created.
  useEffect(() => {
    needsBake.current = true;
  }, [renderTarget]);

  useFrame(() => {
    // Push the shared uniforms into both materials.
    forwardToMaterial(uniforms, bake.material.uniforms);
    const contour = contourRef.current;
    if (contour) forwardToMaterial(uniforms, contour.uniforms);

    // Compare bake-relevant uniforms against last snapshot.
    const bakeUniforms = bake.material.uniforms as Record<
      string,
      THREE.IUniform<number>
    >;
    const keys = Object.keys(bakeUniforms);
    const current = keys.map((k) => bakeUniforms[k].value);
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
      if (contour) {
        (contour.uniforms.uHeightMap as THREE.IUniform<THREE.Texture>).value =
          renderTarget.texture;
      }
    } else if (contour) {
      // Keep the sampler pointing at the current RT texture (in case RT changed).
      (contour.uniforms.uHeightMap as THREE.IUniform<THREE.Texture>).value =
        renderTarget.texture;
    }
  });

  const aspect = size.width / size.height;
  const [left, right, top, bottom] =
    aspect >= 1 ? [-1, 1, 1 / aspect, -1 / aspect] : [-aspect, aspect, 1, -1];

  return (
    <>
      <OrthographicCamera
        makeDefault
        manual
        left={left}
        right={right}
        top={top}
        bottom={bottom}
        near={-1}
        far={1}
      />
      <mesh>
        <planeGeometry args={[2, 2]} />
        {/* @ts-expect-error — custom shaderMaterial extended at runtime */}
        <contourMaterial ref={contourRef} />
      </mesh>
    </>
  );
}
