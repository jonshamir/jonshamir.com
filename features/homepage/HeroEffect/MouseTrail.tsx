import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import mouseTrailFragmentShader from "!!raw-loader!./mouseTrailFragmentShader.glsl";
import mouseTrailVertexShader from "!!raw-loader!./mouseTrailVertexShader.glsl";

const MouseTrail = (props: { mouse: { x: number; y: number } }) => {
  const { mouse } = props;
  const plane = useRef();
  const previousPointer = useRef({ x: 0.5, y: 0.5 });
  const previousTime = useRef(0);

  const viewport = useThree((state) => state.viewport);

  const [currentRT, previousRT] = useMemo(() => {
    return [
      new THREE.WebGLRenderTarget(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType
        }
      ),
      new THREE.WebGLRenderTarget(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType
        }
      )
    ];
  }, []);

  // Store the FBO references in refs so we can swap them
  const currentRTRef = useRef(currentRT);
  const previousRTRef = useRef(previousRT);

  const { decay, size } = useControls({
    decay: { value: 0.91, min: 0.0, max: 0.99, step: 0.01 },
    size: { value: 0.175, min: 0.0, max: 0.75, step: 0.01 }
  });

  const uniforms = useMemo(() => {
    return {
      mousePosition: { value: [0, 0] },
      time: { value: 0 },
      aspect: { value: 1 },
      previousFrame: { value: null },
      mouseVelocity: { value: [0, 0] },
      decay: { value: 0.85 },
      size: { value: 0.32 }
    };
  }, []);

  const handleResize = useCallback(() => {
    const width = window.innerWidth * window.devicePixelRatio;
    const height = window.innerHeight * window.devicePixelRatio;

    currentRTRef.current.setSize(width, height);
    previousRTRef.current.setSize(width, height);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useFrame((state) => {
    const { gl, scene, camera, viewport } = state;

    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - previousTime.current + 1e-6;
    previousTime.current = currentTime;

    const velocityX = (mouse.current.x - previousPointer.current.x) / deltaTime;
    const velocityY = (mouse.current.y - previousPointer.current.y) / deltaTime;

    if (plane.current) {
      plane.current.lookAt(camera.position);

      const material = plane.current.material;
      material.uniforms.time.value = currentTime;
      material.uniforms.mouseVelocity.value = new THREE.Vector2(
        velocityX,
        velocityY
      );
      material.uniforms.mousePosition.value = new THREE.Vector2(
        mouse.current.x,
        mouse.current.y
      );
      material.uniforms.previousFrame.value = previousRTRef.current.texture;
      material.uniforms.decay.value = decay;
      material.uniforms.size.value = size;
      material.uniforms.aspect.value = viewport.width / viewport.height;
    }

    gl.setRenderTarget(currentRTRef.current);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    const temp = currentRTRef.current;
    currentRTRef.current = previousRTRef.current;
    previousRTRef.current = temp;

    previousPointer.current.x = mouse.current.x;
    previousPointer.current.y = mouse.current.y;
  });

  useEffect(() => {
    return () => {
      currentRT.dispose();
      previousRT.dispose();
    };
  }, [currentRT, previousRT]);

  return (
    <>
      <mesh ref={plane} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          fragmentShader={mouseTrailFragmentShader}
          vertexShader={mouseTrailVertexShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

export { MouseTrail };
