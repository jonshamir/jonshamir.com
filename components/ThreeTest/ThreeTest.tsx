import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";

export function ThreeTest() {
  return (
    <div style={{ width: "100%", height: "30rem" }}>
      <Canvas
        orthographic
        camera={{ zoom: 200, position: [0, 0, 10], far: 10 }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
