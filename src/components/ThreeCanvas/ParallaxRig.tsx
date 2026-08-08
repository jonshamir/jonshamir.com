"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { dampE } from "maath/easing";
import { ReactNode, useEffect, useRef } from "react";
import * as THREE from "three";

const MAX_YAW = 0.3;
const MAX_PITCH = 0.3;
const SMOOTH_TIME = 0.15;

// Rotates a wrapper group instead of the camera: OrbitControls re-derives
// camera.position every frame, so animating the camera directly would fight it.
export function ParallaxRig({
  enabled = true,
  intensity = 1,
  maxYaw = MAX_YAW,
  maxPitch = MAX_PITCH,
  children
}: {
  enabled?: boolean;
  intensity?: number;
  maxYaw?: number;
  maxPitch?: number;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, hovered: false });
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;
    const state = pointer.current;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      state.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      state.hovered = true;
      invalidate();
    };
    const onLeave = () => {
      state.hovered = false;
      invalidate();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      state.hovered = false;
    };
  }, [gl, enabled, invalidate]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const { x, y, hovered } = pointer.current;
    const active = enabled && hovered;
    const moving = dampE(
      group.current.rotation,
      [
        active ? -y * maxPitch * intensity : 0,
        active ? x * maxYaw * intensity : 0,
        0
      ],
      SMOOTH_TIME,
      Math.min(delta, 0.05)
    );
    // Keep frameloop="demand" canvases rendering until the damp settles.
    if (moving) invalidate();
  });

  return <group ref={group}>{children}</group>;
}
