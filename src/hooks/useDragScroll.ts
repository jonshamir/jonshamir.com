"use client";

import { useEffect, type RefObject } from "react";

const FRICTION = 0.95;
const MIN_VELOCITY = 0.5;

export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let prevX = 0;
    let prevTime = 0;
    let velocity = 0;
    let animationId = 0;

    const stopMomentum = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    };

    const startMomentum = () => {
      const tick = () => {
        velocity *= FRICTION;
        if (Math.abs(velocity) < MIN_VELOCITY) return;
        el.scrollLeft -= velocity;
        animationId = requestAnimationFrame(tick);
      };
      animationId = requestAnimationFrame(tick);
    };

    const onMouseDown = (e: MouseEvent) => {
      stopMomentum();
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      prevX = e.pageX;
      prevTime = performance.now();
      velocity = 0;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX;
      el.scrollLeft = scrollLeft - walk;

      const now = performance.now();
      const dt = now - prevTime;
      if (dt > 0) {
        velocity = (e.pageX - prevX) / dt * 16; // normalize to ~per-frame
        prevX = e.pageX;
        prevTime = now;
      }
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "";
      el.style.userSelect = "";
      if (Math.abs(velocity) > MIN_VELOCITY) startMomentum();
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseUp);

    return () => {
      stopMomentum();
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseUp);
    };
  }, [ref]);
}
