import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";

export function ThreeTest() {
  return (
    <div style={{ width: "100%", height: "20rem" }}>
      <Canvas camera={{ position: [0, 0, 2] }}>
        <Scene />
      </Canvas>
    </div>
  );
}
