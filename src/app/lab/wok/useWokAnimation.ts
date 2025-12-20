import { useMemo } from "react";
import * as THREE from "three";

interface WokAnimationParams {
  speed?: number;
  amplitude?: number;
  cycleDuration?: number;
  phase1Weight?: number; // Relative weight of tilt-back phase
  phase2Weight?: number; // Relative weight of scoop phase
  phase3Weight?: number; // Relative weight of return phase
}

interface AnimationState {
  getRotation: (time: number) => THREE.Quaternion;
  getPosition: (time: number) => THREE.Vector3;
}

// Easing function for natural motion
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useWokAnimation({
  speed = 1.0,
  amplitude = 0.4,
  cycleDuration = 2.0,
  phase1Weight = 30,
  phase2Weight = 30,
  phase3Weight = 40
}: WokAnimationParams = {}): AnimationState {
  return useMemo(() => {
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const euler = new THREE.Euler();

    // Normalize weights to sum to 1
    const totalWeight = phase1Weight + phase2Weight + phase3Weight;
    const phase1Duration = phase1Weight / totalWeight;
    const phase2Duration = phase2Weight / totalWeight;
    const phase3Duration = phase3Weight / totalWeight;

    const phase1End = phase1Duration;
    const phase2End = phase1Duration + phase2Duration;

    const getRotation = (time: number): THREE.Quaternion => {
      const adjustedTime = time * speed;
      const cycleProgress = (adjustedTime % cycleDuration) / cycleDuration;

      // Phase 1: Tilt back
      // Phase 2: Scoop forward (flip motion)
      // Phase 3: Return to neutral with pause

      let tiltAngle: number;

      if (cycleProgress < phase1End) {
        // Tilt back
        const t = cycleProgress / phase1Duration;
        tiltAngle = easeInOutCubic(t) * amplitude;
      } else if (cycleProgress < phase2End) {
        // Scoop forward (goes past neutral to negative)
        const t = (cycleProgress - phase1End) / phase2Duration;
        tiltAngle = amplitude - easeInOutCubic(t) * (amplitude * 2.5);
      } else {
        // Return to neutral
        const t = (cycleProgress - phase2End) / phase3Duration;
        const startAngle = -amplitude * 1.5;
        tiltAngle = startAngle + easeInOutCubic(t) * -startAngle;
      }

      euler.set(tiltAngle, 0, 0);
      quaternion.setFromEuler(euler);
      return quaternion;
    };

    const getPosition = (time: number): THREE.Vector3 => {
      const adjustedTime = time * speed;
      const cycleProgress = (adjustedTime % cycleDuration) / cycleDuration;

      // Slight upward motion during the flip (phase 2)
      let yOffset = 0;
      if (cycleProgress >= phase1End && cycleProgress < phase2End) {
        const t = (cycleProgress - phase1End) / phase2Duration;
        yOffset = Math.sin(t * Math.PI) * 0.15 * amplitude;
      }

      position.set(0, yOffset, 0);
      return position;
    };

    return { getRotation, getPosition };
  }, [
    speed,
    amplitude,
    cycleDuration,
    phase1Weight,
    phase2Weight,
    phase3Weight
  ]);
}
