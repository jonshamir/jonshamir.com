import { OrthographicCamera, useFBO } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva } from "leva";
import { easing } from "maath";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./HeroEffect.module.scss";
import { MouseTrail } from "./MouseTrail";

const PixelatingMouseTrail = () => {
  const mouseTrail = useMemo(() => new THREE.Scene(), []);
  const mouseTrailFBO = useFBO({
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType
  });
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const smoothedMouse = useRef({ x: 0.5, y: 0.5 });

  const mouseDirection = useRef({ x: 0, y: 0 });
  const smoothedMouseDirection = useRef({ x: 0, y: 0 });

  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const { size } = useThree();

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      // Convert to normalized device coordinates (-1 to +1)
      setPointer({
        x: ((e.clientX + window.scrollX) / size.width) * 2 - 1,
        y: -((e.clientY + window.scrollY) / size.height) * 2 + 1
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [size]);

  useFrame((state) => {
    const { gl, clock, camera } = state;
    const normalizedPointerX = (pointer.x + 1) * 0.5;
    const normalizedPointerY = (pointer.y + 1) * 0.5;

    mouse.current.x = normalizedPointerX;
    mouse.current.y = normalizedPointerY;

    const mouseDirectionX =
      mouse.current.x > smoothedMouse.current.x
        ? 1
        : mouse.current.x < smoothedMouse.current.x
          ? -1
          : 0;
    const mouseDirectionY =
      mouse.current.y > smoothedMouse.current.y
        ? 1
        : mouse.current.y < smoothedMouse.current.y
          ? -1
          : 0;

    mouseDirection.current.x = mouseDirectionX;
    mouseDirection.current.y = mouseDirectionY;

    easing.damp(smoothedMouse.current, "x", mouse.current.x, 0.0105);
    easing.damp(smoothedMouse.current, "y", mouse.current.y, 0.0105);
    easing.damp(
      smoothedMouseDirection.current,
      "x",
      mouseDirection.current.x,
      0.15
    );
    easing.damp(
      smoothedMouseDirection.current,
      "y",
      mouseDirection.current.y,
      0.15
    );

    gl.setRenderTarget(mouseTrailFBO);
    gl.render(mouseTrail, camera);
    gl.setRenderTarget(null);
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <MouseTrail mouse={smoothedMouse} />
    </>
  );
};

const Scene = () => {
  return (
    <div className={styles.HeroEffect}>
      <Canvas>
        <Suspense>
          {/* <color attach="background" args={["#3386E0"]} /> */}
          <PixelatingMouseTrail />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </div>
  );
};

export default Scene;
