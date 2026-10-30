import { clsx } from "clsx";
import Image, { type StaticImageData } from "next/image";
import { type RefObject, useLayoutEffect, useRef } from "react";

import styles from "./ProjectList.module.css";
import projectData, { type ProjectItem } from "./projects";

type Limits = {
  gap: number;
  smallMaxWidth: number;
  smallMaxHeight: number;
  largeMinHeight: number;
  largeMaxHeight: number;
  singleFrame: boolean;
};

type Sizes = {
  smallWidth: number;
  smallHeight: number;
  largeWidth: number;
  largeHeight: number;
};

function aspect(image: StaticImageData) {
  return image.width / image.height;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readLimits(
  stage: HTMLElement,
  small: HTMLElement,
  large: HTMLElement
): Limits {
  const smallStyle = getComputedStyle(small);
  const largeStyle = getComputedStyle(large);
  return {
    gap: parseFloat(getComputedStyle(stage).columnGap),
    smallMaxWidth: parseFloat(smallStyle.maxWidth),
    smallMaxHeight: parseFloat(smallStyle.maxHeight),
    largeMinHeight: parseFloat(largeStyle.minHeight),
    largeMaxHeight: parseFloat(largeStyle.maxHeight),
    singleFrame: largeStyle.display === "none"
  };
}

function frameSizes(project: ProjectItem, width: number, l: Limits): Sizes {
  const smallAspect = aspect(project.previewSmall);
  if (l.singleFrame) {
    return {
      smallWidth: width,
      smallHeight: Math.min(l.smallMaxHeight, width / smallAspect),
      largeWidth: 0,
      largeHeight: 0
    };
  }
  const smallWidth = Math.min(l.smallMaxWidth, l.smallMaxHeight * smallAspect);
  const largeWidth = Math.max(0, width - smallWidth - l.gap);
  return {
    smallWidth,
    smallHeight: smallWidth / smallAspect,
    largeWidth,
    largeHeight: clamp(
      largeWidth / aspect(project.preview),
      l.largeMinHeight,
      l.largeMaxHeight
    )
  };
}

function place(
  stage: HTMLElement,
  small: HTMLElement,
  large: HTMLElement,
  slot: HTMLElement,
  project: ProjectItem
) {
  const root = stage.parentElement;
  if (!root) return;

  const rootRect = root.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();
  const slotStyle = getComputedStyle(slot);
  const stageStyle = getComputedStyle(stage);
  const paddingLeft = parseFloat(slotStyle.paddingLeft);
  const width =
    slotRect.width - paddingLeft - parseFloat(slotStyle.paddingRight);

  const sizes = frameSizes(project, width, readLimits(stage, small, large));

  let y = slotRect.top - rootRect.top;
  const bottom =
    rootRect.top +
    y +
    parseFloat(stageStyle.marginTop) +
    Math.max(sizes.smallHeight, sizes.largeHeight) +
    parseFloat(stageStyle.paddingBottom);
  y -= Math.max(0, bottom - window.innerHeight);

  const vars = {
    "--x": slotRect.left - rootRect.left + paddingLeft,
    "--y": y,
    "--small-w": sizes.smallWidth,
    "--small-h": sizes.smallHeight,
    "--large-w": sizes.largeWidth,
    "--large-h": sizes.largeHeight
  };
  for (const [name, value] of Object.entries(vars))
    stage.style.setProperty(name, `${value}px`);
}

export function PreviewStage({
  open,
  current,
  prev,
  slots
}: {
  open: boolean;
  current: number;
  prev: number | null;
  slots: RefObject<(HTMLElement | null)[]>;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const smallRef = useRef<HTMLDivElement>(null);
  const largeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const small = smallRef.current;
    const large = largeRef.current;
    const slot = slots.current[current];
    if (!stage || !small || !large || !slot) return;

    if (!open) {
      delete stage.dataset.open;
      return;
    }

    const update = () => place(stage, small, large, slot, projectData[current]);
    update();

    if (stage.dataset.open === undefined) {
      // Flush the new position before opening, so it snaps to the hovered row
      // instead of gliding in from the last one.
      stage.getBoundingClientRect();
      stage.dataset.open = "";
    }

    const controller = new AbortController();
    const { signal } = controller;
    window.addEventListener("scroll", update, { passive: true, signal });
    window.addEventListener("resize", update, { signal });
    return () => controller.abort();
  }, [open, current, slots]);

  const imageProps = (index: number) => ({
    loading: "eager" as const,
    fetchPriority: "low" as const,
    "data-pos":
      index < current ? "above" : index > current ? "below" : "active",
    "data-moving":
      prev !== null && (index === current || index === prev) ? "" : undefined
  });

  return (
    <div className={styles.stage} ref={stageRef} aria-hidden>
      <div className={clsx(styles.frame, styles.frameSmall)} ref={smallRef}>
        {projectData.map((project, i) => (
          <Image
            key={project.slug}
            src={project.previewSmall}
            alt=""
            {...imageProps(i)}
          />
        ))}
      </div>
      <div className={clsx(styles.frame, styles.frameLarge)} ref={largeRef}>
        {projectData.map((project, i) => (
          <Image
            key={project.slug}
            src={project.preview}
            alt=""
            {...imageProps(i)}
          />
        ))}
      </div>
    </div>
  );
}
