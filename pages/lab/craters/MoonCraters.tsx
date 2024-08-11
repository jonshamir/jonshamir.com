import { Billboard, Sphere } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import craters from "./craters.json";

import { Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import { circleFragmentShader, circleVertexShader } from "./circle.glsl";

const RADIUS = 1;
const MOON_RADIUS = 1737;
const SCALE_RATIO = RADIUS / MOON_RADIUS;

type QuadProps = ThreeElements["mesh"] & {
  color?: THREE.Color;
  depthTest?: boolean;
};

function Quad(props: QuadProps) {
  const { color = new THREE.Color(), depthTest = true, ...rest } = props;
  return (
    <mesh {...rest}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={circleVertexShader}
        fragmentShader={circleFragmentShader}
        depthTest={depthTest}
        depthWrite={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={{
          uColor: { value: color },
        }}
      />
    </mesh>
  );
}

export function MoonCraters() {
  return (
    <>
      <Billboard>
        <Quad
          color={new THREE.Color(0xdddddd)}
          position={[0, 0, 0]}
          scale={RADIUS * 1.01}
          renderOrder={1}
          depthTest={false}
        />
      </Billboard>
      <Sphere args={[RADIUS * 0.99, 32, 32]}>
        <meshToonMaterial color="gray" />
      </Sphere>
      <directionalLight position={[0, 0, 1]} intensity={0.5} />
      {craters.map((crater, i) => {
        const craterRadius = (crater.diam / 2) * SCALE_RATIO;
        const rotation = new THREE.Euler(
          -crater.lon * DEG2RAD,
          crater.lat * DEG2RAD,
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
