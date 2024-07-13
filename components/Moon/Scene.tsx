import { Billboard, OrbitControls, Sphere } from "@react-three/drei";
import { extend, ThreeElements } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import craters from "./craters.json";

import { MaterialNode, Object3DNode } from "@react-three/fiber";
import { Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import { circleFragmentShader, circleVertexShader } from "./circle.glsl";

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>;
  }
}

extend({ MeshLineGeometry, MeshLineMaterial });

const RADIUS = 1;
const MOON_RADIUS = 1737;
const SCALE_RATIO = RADIUS / MOON_RADIUS;

type QuadProps = ThreeElements["mesh"] & {
  color?: THREE.Color;
};

function Quad(props: QuadProps) {
  const { color = new THREE.Color(), ...rest } = props;
  return (
    <mesh {...rest}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={circleVertexShader}
        fragmentShader={circleFragmentShader}
        depthTest={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={{
          uColor: { value: color },
        }}
      />
    </mesh>
  );
}

export function Scene() {
  return (
    <>
      <OrbitControls position={[0, 0, 0]} enablePan={false} />
      <Billboard>
        <Quad position={[0, 0, 0]} scale={RADIUS} renderOrder={1} />
      </Billboard>
      <Sphere args={[RADIUS, 32, 32]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <directionalLight position={[0, 0, 1]} intensity={0.5} />
      {craters.map((crater, i) => {
        const craterRadius = (crater.diam / 2) * SCALE_RATIO;
        const rotation = new THREE.Euler(
          -crater.lat * DEG2RAD,
          crater.lon * DEG2RAD,
          0
        );
        const zOffset = Math.sqrt(
          RADIUS * RADIUS - craterRadius * craterRadius
        );
        let position = new Vector3(0, 0, zOffset).applyEuler(rotation);

        return (
          <Quad
            key={i}
            scale={craterRadius}
            rotation={rotation}
            position={position}
            color={new THREE.Color(0xbbbbbb)}
          />
        );
      })}
    </>
  );
}
