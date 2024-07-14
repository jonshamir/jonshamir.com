import { Billboard, OrbitControls, Sphere } from "@react-three/drei";
import { extend, ThreeElements } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import craters from "./craters.json";

import { MaterialNode, Object3DNode } from "@react-three/fiber";
import { Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import { circleFragmentShader, circleVertexShader } from "./circle.glsl";

export function ProjectionMapping() {
  return (
    <>
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <directionalLight position={[0, 0, 1]} intensity={0.5} />
    </>
  );
}
