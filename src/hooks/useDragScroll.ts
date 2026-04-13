"use client";

import { type RefObject, useEffect } from "react";

const FRICTION = 0.93;
const MIN_VELOCITY = 0.5;
const BOUNCE_RESISTANCE = 0.2; // how much overscroll is allowed (lower = stiffer)
const BOUNCE_BACK_SPEED = 0.1; // spring-back factor per frame

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
    let overscroll = 0; // positive = overscrolled past start, negative = past end

    const maxScroll = () => el.scrollWidth - el.clientWidth;

    const setOverscroll = (value: number) => {
      overscroll = value;
      el.style.transform = overscroll ? `translateX(${overscroll}px)` : "";
    };

    const atStart = () => el.scrollLeft <= 0;
    const atEnd = () => el.scrollLeft >= maxScroll();

    const stopAnimation = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    };

    const springBack = () => {
      const tick = () => {
        overscroll *= 1 - BOUNCE_BACK_SPEED;
        if (Math.abs(overscroll) < 0.5) {
          setOverscroll(0);
          return;
        }
        setOverscroll(overscroll);
        animationId = requestAnimationFrame(tick);
      };
      animationId = requestAnimationFrame(tick);
    };

    const startMomentum = () => {
      const tick = () => {
        velocity *= FRICTION;

        if (overscroll !== 0) {
          // Already in overscroll — spring back
          velocity = 0;
          springBack();
          return;
        }

        if (Math.abs(velocity) < MIN_VELOCITY) return;

        const prevScrollLeft = el.scrollLeft;
        el.scrollLeft -= velocity;

        // Check if we hit a boundary
        const hitStart = velocity > 0 && atStart() && prevScrollLeft === 0;
        const hitEnd =
          velocity < 0 && atEnd() && el.scrollLeft === prevScrollLeft;

        if (hitStart || hitEnd) {
          // Convert remaining velocity into overscroll
          setOverscroll(velocity * BOUNCE_RESISTANCE * 5);
          velocity = 0;
          springBack();
          return;
        }

        animationId = requestAnimationFrame(tick);
      };
      animationId = requestAnimationFrame(tick);
    };

    let hasDragged = false;
    const DRAG_THRESHOLD = 5;

    const onMouseDown = (e: MouseEvent) => {
      stopAnimation();
      if (overscroll !== 0) setOverscroll(0);
      isDown = true;
      hasDragged = false;
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

      if (!hasDragged && Math.abs(walk) > DRAG_THRESHOLD) {
        hasDragged = true;
      }
      const targetScroll = scrollLeft - walk;

      // Rubber-band at boundaries during drag
      if (targetScroll < 0) {
        el.scrollLeft = 0;
        setOverscroll(-targetScroll * BOUNCE_RESISTANCE);
      } else if (targetScroll > maxScroll()) {
        el.scrollLeft = maxScroll();
        setOverscroll(-(targetScroll - maxScroll()) * BOUNCE_RESISTANCE);
      } else {
        if (overscroll !== 0) setOverscroll(0);
        el.scrollLeft = targetScroll;
      }

      const now = performance.now();
      const dt = now - prevTime;
      if (dt > 0) {
        velocity = ((e.pageX - prevX) / dt) * 16;
        prevX = e.pageX;
        prevTime = now;
      }
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "";
      el.style.userSelect = "";

      if (overscroll !== 0) {
        springBack();
      } else if (Math.abs(velocity) > MIN_VELOCITY) {
        startMomentum();
      }
    };

    const onClick = (e: MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    };

    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);

    return () => {
      stopAnimation();
      setOverscroll(0);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, [ref]);
}
