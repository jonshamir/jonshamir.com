import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { initShapes, PhysicsOptions, Shape, stepPhysics } from "./physics";
import { fragmentShader, vertexShader } from "./sdfCollision.glsl";

const MAX_SHAPES = 16;
const WORLD_SCALE = 8;

function createUniforms() {
  return {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uBlendFactor: { value: 0.5 },
    uWorldScale: { value: WORLD_SCALE },
    uShapeCount: { value: 0 },
    uShapePos: {
      value: Array.from({ length: MAX_SHAPES }, () => new THREE.Vector4())
    },
    uShapeParams: {
      value: Array.from({ length: MAX_SHAPES }, () => new THREE.Vector4())
    },
    uShapeColors: {
      value: Array.from({ length: MAX_SHAPES }, () => new THREE.Vector3())
    },
  };
}

interface SdfCollisionQuadProps {
  gravity: number;
  mouseStrength: number;
  blendFactor: number;
  restitution: number;
  shapeCount: number;

}

export function SdfCollisionQuad({
  gravity,
  mouseStrength,
  blendFactor,
  restitution,
  shapeCount
}: SdfCollisionQuadProps) {
  const shapesRef = useRef<Shape[]>(initShapes(shapeCount, WORLD_SCALE));
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const uniformsRef = useRef(createUniforms());
  const { gl, size } = useThree();

  // Re-init shapes when count changes
  useEffect(() => {
    const current = shapesRef.current;
    if (shapeCount > current.length) {
      const extra = initShapes(shapeCount - current.length, WORLD_SCALE);
      shapesRef.current = [...current, ...extra];
    } else if (shapeCount < current.length) {
      shapesRef.current = current.slice(0, shapeCount);
    }
  }, [shapeCount]);

  // Mouse tracking
  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const aspect = size.width / size.height;
      mouseRef.current.x =
        (e.clientX / size.width - 0.5) * aspect * WORLD_SCALE;
      mouseRef.current.y = -(e.clientY / size.height - 0.5) * WORLD_SCALE;
    };
    const onDown = () => {
      mouseRef.current.down = true;
    };
    const onUp = () => {
      mouseRef.current.down = false;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [gl, size]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const mouse = mouseRef.current;

    const opts: PhysicsOptions = {
      gravity,
      mouseStrength,
      restitution,
      worldScale: WORLD_SCALE,
      mouseDown: mouse.down
    };

    stepPhysics(shapesRef.current, dt, mouse.x, mouse.y, opts);

    // Upload uniforms
    const u = uniformsRef.current;
    u.uTime.value = state.clock.elapsedTime;
    u.uResolution.value.set(size.width, size.height);
    u.uMouse.value.set(mouse.x, mouse.y);
    u.uBlendFactor.value = blendFactor;
    u.uShapeCount.value = shapesRef.current.length;

    for (let i = 0; i < shapesRef.current.length; i++) {
      const s = shapesRef.current[i];
      u.uShapePos.value[i].set(s.x, s.y, s.angle, 0);
      u.uShapeParams.value[i].set(s.type, s.radius, s.sizeY, s.cornerRadius);
      u.uShapeColors.value[i].set(s.color[0], s.color[1], s.color[2]);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        transparent={true}
        blending={THREE.CustomBlending}
        blendSrc={THREE.OneFactor}
        blendDst={THREE.OneMinusSrcAlphaFactor}
        blendSrcAlpha={THREE.OneFactor}
        blendDstAlpha={THREE.OneMinusSrcAlphaFactor}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
