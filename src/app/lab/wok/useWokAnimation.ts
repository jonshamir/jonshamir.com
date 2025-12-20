import { useMemo } from "react";
import * as THREE from "three";

interface WokAnimationParams {
  speed?: number;
  amplitude?: number;
  cycleDuration?: number;
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
  cycleDuration = 2.0
}: WokAnimationParams = {}): AnimationState {
  return useMemo(() => {
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const euler = new THREE.Euler();

    const getRotation = (time: number): THREE.Quaternion => {
      const adjustedTime = time * speed;
      const cycleProgress = (adjustedTime % cycleDuration) / cycleDuration;

      // Phase 1 (0-0.3): Tilt back
      // Phase 2 (0.3-0.6): Scoop forward (flip motion)
      // Phase 3 (0.6-1.0): Return to neutral with pause

      let tiltAngle: number;

      if (cycleProgress < 0.3) {
        // Tilt back
        const t = cycleProgress / 0.3;
        tiltAngle = easeInOutCubic(t) * amplitude;
      } else if (cycleProgress < 0.6) {
        // Scoop forward (goes past neutral to negative)
        const t = (cycleProgress - 0.3) / 0.3;
        tiltAngle = amplitude - easeInOutCubic(t) * (amplitude * 2.5);
      } else {
        // Return to neutral
        const t = (cycleProgress - 0.6) / 0.4;
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

      // Slight upward motion during the flip
      let yOffset = 0;
      if (cycleProgress >= 0.3 && cycleProgress < 0.6) {
        const t = (cycleProgress - 0.3) / 0.3;
        yOffset = Math.sin(t * Math.PI) * 0.15 * amplitude;
      }

      position.set(0, yOffset, 0);
      return position;
    };

    return { getRotation, getPosition };
  }, [speed, amplitude, cycleDuration]);
}
