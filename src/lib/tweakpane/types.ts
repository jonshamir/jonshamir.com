// src/lib/tweakpane/types.ts
import type { FolderNode } from "./folder";

export type NumberField = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
};

export type BooleanField = {
  value: boolean;
  label?: string;
};

export type ColorField = {
  value: string; // "#rrggbb"
  label?: string;
};

export type Point2DField = {
  value: { x: number; y: number };
  x?: { min?: number; max?: number; step?: number };
  y?: { min?: number; max?: number; step?: number };
  label?: string;
};

export type ListField = {
  value: string;
  options: Record<string, string> | string[];
  label?: string;
};

export type Field =
  | NumberField
  | BooleanField
  | ColorField
  | Point2DField
  | ListField;

export type Schema = Record<string, Field | FolderNode>;
