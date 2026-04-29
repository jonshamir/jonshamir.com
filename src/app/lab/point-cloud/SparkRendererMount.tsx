"use client";

import { useThree } from "@react-three/fiber";
import { SparkRenderer } from "@sparkjsdev/spark";
import { useEffect, useMemo } from "react";

// Spark needs a SparkRenderer node in the scene to actually rasterize splats.
// SplatMesh on its own only holds the data.
export function SparkRendererMount() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const spark = useMemo(() => new SparkRenderer({ renderer: gl }), [gl]);

  useEffect(() => {
    scene.add(spark);
    // eslint-disable-next-line no-console
    console.log("[SparkRendererMount] mounted SparkRenderer in scene");
    return () => {
      scene.remove(spark);
      spark.dispose();
    };
  }, [scene, spark]);

  return null;
}
