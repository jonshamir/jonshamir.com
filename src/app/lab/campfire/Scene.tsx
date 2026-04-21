"use client";

import { OrbitControls, StatsGl } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from "react";
import { Group, Plane, Raycaster, Vector2, Vector3 } from "three";

import { FirePitStones } from "./FirePitStones";
import { GhostLog } from "./GhostLog";
import { Ground } from "./Ground";
import { Log } from "./Log";
import type { LogKind, LogSpec } from "./types";

const RAPIER_TYPE_DYNAMIC = 0;
const RAPIER_TYPE_KINEMATIC_POS = 2;

function GhostFollower({
  kind,
  pointerRef
}: {
  kind: LogKind;
  pointerRef: MutableRefObject<Vector3>;
}) {
  const groupRef = useRef<Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(pointerRef.current);
    }
  });
  return (
    <group ref={groupRef}>
      <GhostLog kind={kind} position={[0, 0, 0]} rotationY={0} />
    </group>
  );
}

function GrabController({
  grabbedId,
  bodyMap,
  pointerRef
}: {
  grabbedId: string | null;
  bodyMap: MutableRefObject<Map<string, RapierRigidBody>>;
  pointerRef: MutableRefObject<Vector3>;
}) {
  const prevGrabbed = useRef<string | null>(null);
  const liftRef = useRef(0);

  useEffect(() => {
    const prev = prevGrabbed.current;
    if (prev && prev !== grabbedId) {
      const body = bodyMap.current.get(prev);
      if (body) body.setBodyType(RAPIER_TYPE_DYNAMIC, true);
    }
    if (grabbedId && grabbedId !== prev) {
      const body = bodyMap.current.get(grabbedId);
      if (body) {
        body.setBodyType(RAPIER_TYPE_KINEMATIC_POS, true);
        liftRef.current = 0.22;
      }
    }
    prevGrabbed.current = grabbedId;
  }, [grabbedId, bodyMap]);

  useFrame(() => {
    if (!grabbedId) return;
    const body = bodyMap.current.get(grabbedId);
    if (!body) return;
    const p = pointerRef.current;
    body.setNextKinematicTranslation({
      x: p.x,
      y: p.y + liftRef.current,
      z: p.z
    });
  });

  return null;
}

export function Scene({
  placing,
  logs,
  grabbedId,
  onGroundClick,
  onLogPointerDown,
  onPointerUp
}: {
  placing: LogKind | null;
  logs: LogSpec[];
  grabbedId: string | null;
  onGroundClick: (worldPos: [number, number, number]) => void;
  onLogPointerDown: (id: string) => void;
  onPointerUp: () => void;
}) {
  const { gl, camera } = useThree();
  const pointerRef = useRef(new Vector3());
  const bodyMap = useRef(new Map<string, RapierRigidBody>());
  const groundPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new Raycaster(), []);

  // Allow three.js to recover on GPU context loss (otherwise the canvas goes blank)
  useEffect(() => {
    const dom = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      console.warn("[campfire] webgl context lost, awaiting restore");
    };
    const onRestored = () => console.log("[campfire] webgl context restored");
    dom.addEventListener("webglcontextlost", onLost);
    dom.addEventListener("webglcontextrestored", onRestored);
    return () => {
      dom.removeEventListener("webglcontextlost", onLost);
      dom.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [gl]);

  // Track world-space pointer via DOM events on the canvas
  useEffect(() => {
    const dom = gl.domElement;
    const ndc = new Vector2();
    const hit = new Vector3();
    const onMove = (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        pointerRef.current.copy(hit);
      }
    };
    const onUp = () => onPointerUp();
    dom.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      dom.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, camera, raycaster, groundPlane, onPointerUp]);

  const handleRegisterFirstBody = useCallback(
    (id: string, body: RapierRigidBody | null) => {
      if (body) bodyMap.current.set(id, body);
      else bodyMap.current.delete(id);
    },
    []
  );

  const handleGroundPointerUp = useCallback(() => {
    if (placing) {
      const p = pointerRef.current;
      onGroundClick([p.x, 0, p.z]);
    }
  }, [placing, onGroundClick]);

  const controlsEnabled = !placing && !grabbedId;

  return (
    <>
      <color attach="background" args={["#1a1410"]} />
      <hemisphereLight args={["#c0b090", "#2a1f18", 0.6]} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <OrbitControls
        enabled={controlsEnabled}
        minDistance={0.6}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0, 0]}
      />
      <StatsGl className="stats-gl" />

      <Ground onPointerUp={handleGroundPointerUp} />
      <FirePitStones />

      {logs.map((spec) => (
        <Log
          key={spec.id}
          spec={spec}
          onPointerDown={onLogPointerDown}
          onRegisterFirstBody={handleRegisterFirstBody}
        />
      ))}

      {placing && <GhostFollower kind={placing} pointerRef={pointerRef} />}

      <GrabController
        grabbedId={grabbedId}
        bodyMap={bodyMap}
        pointerRef={pointerRef}
      />
    </>
  );
}
