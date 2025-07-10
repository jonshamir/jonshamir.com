"use client";

import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { BlurPass, Resizer, KernelSize, Resolution } from "postprocessing";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { Moon } from "./Moon";

export default function Earth() {
  const postProcessing = true;
  return (
    <>
      <ThreeCanvas
        className="full-bleed"
        camera={{ position: [0, 0, 200], zoom: 40 }}
        style={{ backgroundColor: "#101010", height: "40rem" }}
      >
        <color attach="background" args={["#101010"]} />
        <OrbitControls enablePan={false} enableZoom={true} />
        <Moon />
        <EffectComposer>
          {postProcessing ? (
            <>
              <Bloom
                intensity={0.3}
                luminanceThreshold={0.1}
                kernelSize={KernelSize.LARGE}
                radius={1}
                levels={5}
              />
              <Noise opacity={0.05} />
            </>
          ) : (
            <Noise opacity={0} />
          )}
        </EffectComposer>
      </ThreeCanvas>
    </>
  );
}
