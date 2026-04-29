"use client";

import { useThree } from "@react-three/fiber";
import { SplatMesh } from "@sparkjsdev/spark";
import { useEffect, useMemo, useState } from "react";
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
  applyModifier: boolean;
  flipY: boolean;
};

const log = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log("[SplatViewer]", ...args);
};

export function SplatViewer({
  url,
  sizeScale,
  noiseAmp,
  noiseFreq,
  applyModifier,
  flipY
}: Props) {
  const distortion: NoiseDistortion = useMemo(
    () => createNoiseDistortion(),
    []
  );
  const [mesh, setMesh] = useState<SplatMesh | null>(null);
  const getThree = useThree((s) => s.get);

  // Load / dispose the SplatMesh. Deps are intentionally only the things that
  // require a *new* mesh (url, modifier toggle). We read camera/controls
  // imperatively in the framing effect below so transient null→instance
  // transitions on `controls` don't tear down the mesh.
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const t0 = performance.now();

    log("HEAD probe →", url);
    fetch(url, { method: "HEAD" })
      .then((res) =>
        log("HEAD result", {
          ok: res.ok,
          status: res.status,
          contentType: res.headers.get("content-type"),
          contentLength: res.headers.get("content-length")
        })
      )
      .catch((err) => log("HEAD failed", err));

    log("constructing SplatMesh", { url, applyModifier });
    const m = new SplatMesh({
      url,
      onProgress: (e: ProgressEvent) =>
        log("progress", {
          loaded: e.loaded,
          total: e.total,
          lengthComputable: e.lengthComputable
        })
    });

    if (applyModifier) {
      try {
        m.objectModifier = distortion.modifier;
        m.updateGenerator();
        log("attached objectModifier");
      } catch (err) {
        log("failed to attach objectModifier", err);
      }
    } else {
      log("modifier disabled");
    }

    m.initialized
      .then(() => {
        const t1 = performance.now();
        if (cancelled) {
          log("init resolved but cancelled — disposing");
          m.dispose();
          return;
        }
        log("init resolved", {
          ms: Math.round(t1 - t0),
          numSplats: m.numSplats,
          isInitialized: m.isInitialized
        });
        setMesh(m);
      })
      .catch((err) => {
        log("FAILED to load", url, err);
      });

    return () => {
      cancelled = true;
      setMesh((prev) => (prev === m ? null : prev));
      m.dispose();
      log("cleanup ran for", url);
    };
  }, [url, distortion, applyModifier]);

  // Frame the camera once per loaded mesh. Reads camera/controls via
  // useThree.getState() so it doesn't depend on their identity stabilizing.
  useEffect(() => {
    if (!mesh) return;
    try {
      const box = mesh.getBoundingBox(true);
      const center = box.getCenter(new Vector3());
      const sizeVec = box.getSize(new Vector3());
      const size = sizeVec.length();
      log("bounding box", {
        min: box.min.toArray(),
        max: box.max.toArray(),
        center: center.toArray(),
        sizeXYZ: sizeVec.toArray(),
        sizeDiagonal: size
      });

      mesh.position.sub(center);

      if (!(size > 0 && Number.isFinite(size))) {
        log("invalid bounding-box size; skipping camera framing");
        return;
      }

      const { camera, controls } = getThree();
      const orbit = controls as OrbitControlsLike | null;
      const target = new Vector3(0, 0, 0);
      const dist = size * 1.2;
      camera.position.set(0, size * 0.1, dist);
      // perspective camera fields
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
        log("camera framed", {
          position: camera.position.toArray(),
          near: persp.near,
          far: persp.far
        });
      } else {
        log("no orbit controls in scene; camera positioned directly");
      }
    } catch (err) {
      log("framing failed", err);
    }
  }, [mesh, getThree]);

  useEffect(() => {
    if (!mesh) return;
    // Splat scenes from 3DGS / COLMAP / SuperSplat are typically Y-down.
    // Rotating 180° around Z flips the model upright without mirroring.
    mesh.rotation.z = flipY ? Math.PI : 0;
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

  if (!mesh) return null;
  return <primitive object={mesh} />;
}
