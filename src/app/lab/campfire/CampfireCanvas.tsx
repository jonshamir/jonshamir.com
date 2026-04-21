"use client";

import { Physics } from "@react-three/rapier";
import { useControls } from "leva";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState
} from "react";
import { PCFSoftShadowMap } from "three";

import { LevaPanel } from "../../../components/LevaPanel";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { LOG_KINDS, SOLVER_ITERATIONS, SPECIES_DENSITY } from "./constants";
import { LogPalette } from "./LogPalette";
import { Scene } from "./Scene";
import type { LogKind, LogSpec } from "./types";

function randomSpec(kind: LogKind, at: [number, number, number]): LogSpec {
  const k = LOG_KINDS[kind];
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `log-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    kind,
    length: k.length,
    radius: k.radius,
    segmentCount: k.segmentCount,
    species: k.species,
    density_kg_m3: SPECIES_DENSITY[k.species],
    ignitionVariance: 0.85 + Math.random() * 0.3,
    burnRateVariance: 0.85 + Math.random() * 0.3,
    position: [at[0], Math.max(at[1], k.radius) + 0.08, at[2]],
    rotationY: Math.random() * Math.PI * 2
  };
}

class CampfireErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[campfire] error boundary caught", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            padding: 32,
            color: "#ff9",
            background: "#1a1410",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            zIndex: 100
          }}
        >
          [campfire] render error (see console):{"\n\n"}
          {String(this.state.error.stack ?? this.state.error.message)}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CampfireCanvas() {
  const [placing, setPlacing] = useState<LogKind | null>(null);
  const [logs, setLogs] = useState<LogSpec[]>([]);
  const [grabbedId, setGrabbedId] = useState<string | null>(null);
  const placingRef = useRef<LogKind | null>(null);
  placingRef.current = placing;

  useControls("Campfire", {
    logCount: {
      value: logs.length,
      disabled: true,
      label: "Logs"
    },
    grabbed: {
      value: grabbedId ?? "—",
      disabled: true,
      label: "Grabbed"
    }
  });

  const { debugPhysics, clearAll } = useControls("Campfire controls", {
    debugPhysics: { value: false, label: "Physics debug" },
    clearAll: {
      value: false,
      label: "Clear all"
    }
  });

  useMemo(() => {
    if (clearAll) setLogs([]);
  }, [clearAll]);

  const handleGroundClick = useCallback(
    (worldPos: [number, number, number]) => {
      const kind = placingRef.current;
      if (!kind) return;
      setLogs((prev) => [...prev, randomSpec(kind, worldPos)]);
      setPlacing(null);
    },
    []
  );

  const handleLogPointerDown = useCallback((id: string) => {
    if (placingRef.current) return;
    setGrabbedId(id);
  }, []);

  const handlePointerUp = useCallback(() => {
    setGrabbedId(null);
  }, []);

  return (
    <CampfireErrorBoundary>
      <LevaPanel />
      <LogPalette
        active={placing}
        onSelect={setPlacing}
        onClear={() => setPlacing(null)}
        logCount={logs.length}
      />
      <ThreeCanvas
        isFullscreen={true}
        grabCursor={false}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ position: [1.6, 1.2, 1.6], fov: 50, near: 0.01, far: 100 }}
      >
        <Physics
          gravity={[0, -9.81, 0]}
          timeStep={1 / 60}
          numSolverIterations={SOLVER_ITERATIONS}
          debug={debugPhysics}
        >
          <Scene
            placing={placing}
            logs={logs}
            grabbedId={grabbedId}
            onGroundClick={handleGroundClick}
            onLogPointerDown={handleLogPointerDown}
            onPointerUp={handlePointerUp}
          />
        </Physics>
      </ThreeCanvas>
    </CampfireErrorBoundary>
  );
}
