import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { srgbToOklab } from "./color";
import { MAX_SHAPES, WORLD_SCALE } from "./constants";
import { initShapes, PhysicsOptions, Shape, stepPhysics } from "./physics";
import { fragmentShader, vertexShader } from "./sdfCollision.glsl";

function createUniforms() {
  return {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uBlendFactor: { value: 0.5 },
    uNoiseAmount: { value: 0.05 },
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
    }
  };
}

interface SdfCollisionQuadProps {
  gravity: number;
  blendFactor: number;
  restitution: number;
  damping: number;
  shapeCount: number;
  centerGravity: boolean;
  noiseAmount: number;
}

export function SdfCollisionQuad({
  gravity,
  blendFactor,
  restitution,
  damping,
  shapeCount,
  centerGravity,
  noiseAmount
}: SdfCollisionQuadProps) {
  const shapesRef = useRef<Shape[]>(initShapes(shapeCount, WORLD_SCALE));
  const oklabCacheRef = useRef(new Map<Shape, [number, number, number]>());
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const prevMouseRef = useRef({ x: 0, y: 0, time: 0 });
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
    const prev = prevMouseRef.current;

    const elapsed = state.clock.elapsedTime;
    const timeDelta = elapsed - prev.time;
    let cursorVx = 0,
      cursorVy = 0;
    if (timeDelta > 0.001) {
      cursorVx = (mouse.x - prev.x) / timeDelta;
      cursorVy = (mouse.y - prev.y) / timeDelta;
    }
    prev.x = mouse.x;
    prev.y = mouse.y;
    prev.time = elapsed;

    const opts: PhysicsOptions = {
      gravity,
      cursorVx,
      cursorVy,
      restitution,
      damping,
      worldScale: WORLD_SCALE,
      mouseDown: mouse.down,
      aspect: size.width / size.height,
      centerGravity
    };

    stepPhysics(shapesRef.current, dt, mouse.x, mouse.y, opts);

    // Upload uniforms
    const u = uniformsRef.current;
    const shapes = shapesRef.current;
    u.uTime.value = state.clock.elapsedTime;
    u.uResolution.value.set(size.width, size.height);
    u.uMouse.value.set(mouse.x, mouse.y);
    u.uBlendFactor.value = blendFactor;
    u.uNoiseAmount.value = noiseAmount;
    u.uShapeCount.value = shapes.length;

    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
      u.uShapePos.value[i].set(s.x, s.y, s.angle, 0);
      u.uShapeParams.value[i].set(s.type, s.radius, s.sizeY, s.cornerRadius);
      let lab = oklabCacheRef.current.get(s);
      if (!lab) {
        lab = srgbToOklab(s.color);
        oklabCacheRef.current.set(s, lab);
      }
      u.uShapeColors.value[i].set(lab[0], lab[1], lab[2]);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={vertexShader + fragmentShader}
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
