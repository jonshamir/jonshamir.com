"use client";

import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { MoonModel } from "./MoonModel";

export default function Moon() {
  const postProcessing = true;
  return (
    <>
      <ThreeCanvas
        className="grid-full"
        camera={{ position: [0, 0, 200], zoom: 40 }}
        style={{ backgroundColor: "#101010", height: "40rem" }}
      >
        <color attach="background" args={["#101010"]} />
        <OrbitControls enablePan={false} enableZoom={true} />
        <MoonModel />
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
