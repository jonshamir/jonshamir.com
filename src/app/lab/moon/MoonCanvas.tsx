"use client";

import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../components/ThreeCanvas/ThreeCanvas";
import { MoonModel } from "./MoonModel";

export default function MoonCanvas() {
  const postProcessing = true;
  return (
    <>
      <ThreeCanvas
        className="grid-full"
        camera={{ position: [0, 0, 200], zoom: 40 }}
        style={{ backgroundColor: CANVAS_BG, height: "40rem" }}
      >
        <color attach="background" args={[CANVAS_BG]} />
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
