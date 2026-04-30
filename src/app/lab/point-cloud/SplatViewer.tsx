"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { SplatMesh } from "@sparkjsdev/spark";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { Vector3 } from "three";

import {
  createNoiseDistortion,
  type NoiseDistortion
} from "./dynos/noiseDistortion";

type OrbitControlsLike = {
  target: Vector3;
  update: () => void;
};

type Props = {
  url: string;
  sizeScale: number;
  noiseAmp: number;
  noiseFreq: number;
  noiseSpeed: number;
  noiseRise: number;
  shapeStrength: number;
  sizeUniformity: number;
  maxSize: number;
  applyModifier: boolean;
  flipY: boolean;
};

// Opacity-weighted centroid of all splats. Background floaters with low
// opacity contribute proportionally less, so the orbit pivot stays on the
// subject instead of drifting to the bbox center.
function computeWeightedCentroid(mesh: SplatMesh): Vector3 {
  const sum = new Vector3();
  let totalWeight = 0;
  let count = 0;
  mesh.forEachSplat((_index, center, _scales, _quat, opacity) => {
    const w = Math.max(0, opacity);
    sum.addScaledVector(center, w);
    totalWeight += w;
    count += 1;
  });
  if (totalWeight > 0) return sum.divideScalar(totalWeight);
  if (count > 0) {
    const fallback = new Vector3();
    mesh.forEachSplat((_index, center) => fallback.add(center));
    return fallback.divideScalar(count);
  }
  return new Vector3();
}

export function SplatViewer({
  url,
  sizeScale,
  noiseAmp,
  noiseFreq,
  noiseSpeed,
  noiseRise,
  shapeStrength,
  sizeUniformity,
  maxSize,
  applyModifier,
  flipY
}: Props) {
  const distortion: NoiseDistortion = useMemo(
    () => createNoiseDistortion(),
    []
  );
  const [mesh, setMesh] = useState<SplatMesh | null>(null);
  const groupRef = useRef<Group>(null);
  const getThree = useThree((s) => s.get);

  // Load / dispose the SplatMesh. Deps are intentionally only the things that
  // require a *new* mesh — camera/controls are read imperatively in the
  // framing effect so a transient null→instance transition on `controls`
  // doesn't tear down the mesh.
  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    const m = new SplatMesh({ url });
    if (applyModifier) {
      m.objectModifier = distortion.modifier;
      m.updateGenerator();
    }

    m.initialized
      .then(() => {
        if (cancelled) {
          m.dispose();
          return;
        }
        setMesh(m);
      })
      .catch((err) => {
        console.error("[SplatViewer] failed to load", url, err);
      });

    return () => {
      cancelled = true;
      setMesh((prev) => (prev === m ? null : prev));
      m.dispose();
    };
  }, [url, distortion, applyModifier]);

  // Frame the camera once per loaded mesh, targeting the centroid.
  useEffect(() => {
    if (!mesh) return;
    const box = mesh.getBoundingBox(true);
    const size = box.getSize(new Vector3()).length();
    const centroid = computeWeightedCentroid(mesh);

    mesh.position.sub(centroid);

    if (!(size > 0 && Number.isFinite(size))) return;

    const { camera, controls } = getThree();
    const orbit = controls as OrbitControlsLike | null;
    const target = new Vector3(0, 0, 0);
    const dist = size * 1.2;
    camera.position.set(0, size * 0.1, dist);
    const persp = camera as unknown as {
      near: number;
      far: number;
      updateProjectionMatrix: () => void;
    };
    persp.near = Math.max(0.001, size / 1000);
    persp.far = Math.max(1000, size * 100);
    persp.updateProjectionMatrix();
    camera.lookAt(target);
    if (orbit) {
      orbit.target.copy(target);
      orbit.update();
    }
  }, [mesh, getThree]);

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    // Splat scenes from 3DGS / COLMAP / SuperSplat are typically Y-down.
    // Rotating the wrapper group keeps the inner mesh's recentering offset
    // intact — rotating the mesh itself would rotate around its offset
    // origin and pull the centroid off-target.
    g.rotation.z = flipY ? Math.PI : 0;
  }, [mesh, flipY]);

  useEffect(() => {
    distortion.setSizeScale(sizeScale);
  }, [distortion, sizeScale]);

  useEffect(() => {
    distortion.setNoiseAmp(noiseAmp);
  }, [distortion, noiseAmp]);

  useEffect(() => {
    distortion.setNoiseFreq(noiseFreq);
  }, [distortion, noiseFreq]);

  useEffect(() => {
    distortion.setNoiseSpeed(noiseSpeed);
  }, [distortion, noiseSpeed]);

  useEffect(() => {
    distortion.setNoiseRise(noiseRise);
  }, [distortion, noiseRise]);

  useEffect(() => {
    distortion.setShapeStrength(shapeStrength);
  }, [distortion, shapeStrength]);

  useEffect(() => {
    distortion.setSizeUniformity(sizeUniformity);
  }, [distortion, sizeUniformity]);

  useEffect(() => {
    distortion.setMaxSize(maxSize);
  }, [distortion, maxSize]);

  // Spark only re-runs splat generators when the camera moves or the mesh
  // version bumps (see SparkRenderer.updateInternal). Our modifier reads
  // SplatMesh.dynoTime, which is only advanced inside that gated update — so
  // with a static camera the turbulence freezes until the user nudges
  // OrbitControls. Bump the version each frame while animation is active.
  const isAnimating =
    applyModifier && noiseAmp > 0 && (noiseSpeed > 0 || noiseRise > 0);
  useFrame(() => {
    if (!mesh || !isAnimating) return;
    mesh.needsUpdate = true;
  });

  if (!mesh) return null;
  return (
    <group ref={groupRef}>
      <primitive object={mesh} />
    </group>
  );
}
