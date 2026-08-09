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
  value: string; // "#rrggbb" (or "#rrggbbaa" with alpha)
  alpha?: boolean;
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

export type ButtonField = {
  button: () => void;
  label?: string;
};

export type Field =
  | NumberField
  | BooleanField
  | ColorField
  | Point2DField
  | ListField
  | ButtonField;

export type Schema = { [key: string]: Field | FolderNode<Schema> };

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

type FieldValue<F> = F extends { value: infer V } ? V : never;

// Buttons and folders don't contribute a value under their own key.
type OwnValues<S extends Schema> = {
  [K in keyof S as S[K] extends FolderNode | ButtonField
    ? never
    : K]: FieldValue<S[K]>;
};

// Folder contents are flattened into the result, matching collectDefaults.
type NestedValues<S extends Schema> = {
  [K in keyof S]: S[K] extends FolderNode<infer Sub> ? InferValues<Sub> : never;
}[keyof S];

export type InferValues<S extends Schema> = Simplify<
  OwnValues<S> &
    ([NestedValues<S>] extends [never]
      ? unknown
      : UnionToIntersection<NestedValues<S>>)
>;
