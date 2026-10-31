import type { FolderApi } from "@tweakpane/core";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { Vector2 } from "three/webgpu";

import { getPane, writeControlValues } from "../../../lib/tweakpane";
import { profilePointsSchema, type ShapeControls } from "./fruitControls";
import { type ProfileAnchors, profileControlPoints } from "./fruitProfile";
import { cancelPresetTransition } from "./presetTransition";
import styles from "./ProfileEditor.module.css";

type AnchorKey = "base" | "mid" | "tip";
type Target = { kind: "anchor" | "in" | "out"; key: AnchorKey };
type Frame = { maxX: number; minY: number; maxY: number };
type Drag = { target: Target; offset: Vector2; frame: Frame };

const PADDING_PX = 14;
const HIT_RADIUS_PX = 10;
const ANCHOR_RADIUS_PX = 4.5;
const HANDLE_RADIUS_PX = 3.5;

// Indices into profileControlPoints(). Poles have a single handle.
const CONTROLS: { target: Target; index: number; anchorIndex: number }[] = [
  { target: { kind: "anchor", key: "base" }, index: 0, anchorIndex: 0 },
  { target: { kind: "out", key: "base" }, index: 1, anchorIndex: 0 },
  { target: { kind: "in", key: "mid" }, index: 2, anchorIndex: 3 },
  { target: { kind: "anchor", key: "mid" }, index: 3, anchorIndex: 3 },
  { target: { kind: "out", key: "mid" }, index: 4, anchorIndex: 3 },
  { target: { kind: "in", key: "tip" }, index: 5, anchorIndex: 6 },
  { target: { kind: "anchor", key: "tip" }, index: 6, anchorIndex: 6 }
];

const HANDLES = CONTROLS.filter(({ target }) => target.kind !== "anchor");
// Drawn last so anchors sit on top of their handles.
const DRAW_ORDER = [
  ...HANDLES,
  ...CONTROLS.filter(({ target }) => target.kind === "anchor")
];

type PointKey = keyof typeof profilePointsSchema;

function clampField(key: PointKey, value: number): number {
  const { min, max } = profilePointsSchema[key];
  return Math.min(Math.max(value, min), max);
}

// atan2's (-180, 180] shifted to [-90, 270), which is the range every angle
// field uses, so a handle pointing up and over towards the axis never wraps.
function toAngle(v: Vector2): number {
  const degrees = (Math.atan2(v.y, v.x) * 180) / Math.PI;
  return degrees < -90 ? degrees + 360 : degrees;
}

function dragValues(
  target: Target,
  p: Vector2,
  anchors: ProfileAnchors
): Partial<Record<PointKey, number>> {
  const { kind, key } = target;
  const x = Math.max(p.x, 0);

  if (key === "base" || key === "tip") {
    if (kind === "anchor") return { [`${key}Y`]: p.y };

    const v = new Vector2(x, p.y - anchors[`${key}Y`]);
    const length = v.length();
    if (length === 0) return {};
    if (key === "tip") v.negate();

    return { [`${key}Angle`]: toAngle(v), [`${key}Handle`]: length };
  }

  if (kind === "anchor") return { midX: x, midY: p.y };

  const v = new Vector2(x - anchors.midX, p.y - anchors.midY);
  const length = v.length();
  if (length === 0) return {};
  if (kind === "in") v.negate();

  return { midAngle: toAngle(v), [kind === "in" ? "midIn" : "midOut"]: length };
}

function frameOf(points: Vector2[]): Frame {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    maxX: Math.max(...xs, 0.1),
    minY: Math.min(...ys),
    maxY: Math.max(...ys, Math.min(...ys) + 0.1)
  };
}

export function useProfileEditorSlot(): HTMLElement | null {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const folder: FolderApi = getPane().addFolder({ title: "Profile" });
    const element = document.createElement("div");
    folder.controller.view.containerElement.appendChild(element);
    setSlot(element);

    return () => {
      setSlot(null);
      folder.dispose();
    };
  }, []);

  return slot;
}

export function ProfileEditor({ shape }: { shape: ShapeControls }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState<Target | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const { radius, height } = shape;
  const normalized = profileControlPoints(shape);
  const display = normalized.map(
    (p) => new Vector2(p.x * radius, p.y * height)
  );

  const frame = dragRef.current?.frame ?? frameOf(display);
  const centerY = (frame.minY + frame.maxY) / 2;
  const scale = Math.max(
    Math.min(
      (size.width - 2 * PADDING_PX) / (2 * frame.maxX),
      (size.height - 2 * PADDING_PX) / (frame.maxY - frame.minY)
    ),
    1e-6
  );

  const toPx = (p: Vector2) =>
    new Vector2(
      size.width / 2 + p.x * scale,
      size.height / 2 - (p.y - centerY) * scale
    );
  const fromPx = (px: number, py: number) =>
    new Vector2(
      (px - size.width / 2) / scale / radius,
      ((size.height / 2 - py) / scale + centerY) / height
    );

  const screen = display.map(toPx);

  const pointerPosition = (event: ReactPointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    return fromPx(
      event.clientX - (rect?.left ?? 0),
      event.clientY - (rect?.top ?? 0)
    );
  };

  const onPointerDown =
    (target: Target, index: number) => (event: ReactPointerEvent) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      cancelPresetTransition();

      dragRef.current = {
        target,
        offset: normalized[index].clone().sub(pointerPosition(event)),
        frame
      };
      setActive(target);
    };

  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const p = pointerPosition(event).add(drag.offset);
    const patch = dragValues(drag.target, p, shape);
    const values = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [
        key,
        clampField(key as PointKey, value)
      ])
    );
    writeControlValues({ Shape: values });
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setActive(null);
  };

  const curve =
    screen.length > 0
      ? `M ${screen[0].x} ${screen[0].y} ` +
        Array.from({ length: (screen.length - 1) / 3 }, (_, i) => {
          const [a, b, c] = screen.slice(i * 3 + 1, i * 3 + 4);
          return `C ${a.x} ${a.y} ${b.x} ${b.y} ${c.x} ${c.y}`;
        }).join(" ")
      : "";

  const isActive = (target: Target) =>
    active?.key === target.key && active.kind === target.kind;

  return (
    <svg
      ref={svgRef}
      className={styles.editor}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {size.width > 0 && (
        <>
          <line
            className={styles.axis}
            x1={size.width / 2}
            x2={size.width / 2}
            y1={0}
            y2={size.height}
          />
          <path
            className={styles.mirror}
            d={curve}
            transform={`translate(${size.width} 0) scale(-1 1)`}
          />
          <path className={styles.curve} d={curve} />
          {HANDLES.map(({ target, index, anchorIndex }) => (
            <line
              key={`${target.key}-${target.kind}-line`}
              className={styles.handleLine}
              x1={screen[anchorIndex].x}
              y1={screen[anchorIndex].y}
              x2={screen[index].x}
              y2={screen[index].y}
            />
          ))}
          {DRAW_ORDER.map(({ target, index }) => {
            const point = screen[index];
            const isAnchor = target.kind === "anchor";
            return (
              <g
                key={`${target.key}-${target.kind}`}
                className={isAnchor ? styles.anchor : styles.handle}
                data-active={isActive(target) || undefined}
                onPointerDown={onPointerDown(target, index)}
              >
                <circle cx={point.x} cy={point.y} r={HIT_RADIUS_PX} />
                <circle
                  className={styles.dot}
                  cx={point.x}
                  cy={point.y}
                  r={isAnchor ? ANCHOR_RADIUS_PX : HANDLE_RADIUS_PX}
                />
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}
