import type * as THREE from "three";

import { folder } from "./tweakpane";

// Spec for a single numeric shader control. `folder` is optional — when
// omitted, the control is emitted at the root of the tweakpane panel.
export type ShaderControlSpec = {
  folder?: string;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
};

export type ShaderControlSchema = Record<string, ShaderControlSpec>;

type UniformName<K extends string> = `u${Capitalize<K>}`;

export type ControlValues<S extends ShaderControlSchema> = {
  [K in keyof S]: number;
};

export type ControlUniforms<S extends ShaderControlSchema> = {
  [K in keyof S as UniformName<K & string>]: THREE.IUniform<number>;
};

export type InitialUniformValues<S extends ShaderControlSchema> = {
  [K in keyof S as UniformName<K & string>]: number;
};

const toUniformName = <K extends string>(k: K) =>
  `u${k[0].toUpperCase()}${k.slice(1)}` as UniformName<K>;

// Derives defaults, typed uniforms, a tweakpane useControls schema, and sync helpers
// from a single source of truth. See src/app/lab/topo/uniforms.ts for usage.
export function defineShaderControls<S extends ShaderControlSchema>(schema: S) {
  const keys = Object.keys(schema) as (keyof S & string)[];

  const defaults = Object.fromEntries(
    keys.map((k) => [k, schema[k].value])
  ) as ControlValues<S>;

  const initialUniforms = Object.fromEntries(
    keys.map((k) => [toUniformName(k), schema[k].value])
  ) as InitialUniformValues<S>;

  function createUniforms(): ControlUniforms<S> {
    return Object.fromEntries(
      keys.map((k) => [toUniformName(k), { value: schema[k].value }])
    ) as ControlUniforms<S>;
  }

  function sync(values: ControlValues<S>, uniforms: ControlUniforms<S>) {
    const u = uniforms as Record<string, THREE.IUniform<number>>;
    for (const k of keys) {
      u[toUniformName(k)].value = values[k];
    }
  }

  // Copy from a shared uniforms object into a specific material's own uniforms
  // map — shaderMaterial instances each keep their own objects.
  function forwardToMaterial(
    uniforms: ControlUniforms<S>,
    materialUniforms: { [key: string]: THREE.IUniform }
  ) {
    const u = uniforms as Record<string, THREE.IUniform<number>>;
    for (const k of keys) {
      const name = toUniformName(k);
      const mu = materialUniforms[name];
      if (mu) mu.value = u[name].value;
    }
  }

  // Build the tweakpane useControls input. Controls with a `folder` field are
  // grouped; the rest go at the root.
  function buildControlsSchema(): Record<
    string,
    ReturnType<typeof folder> | Omit<ShaderControlSpec, "folder">
  > {
    const byFolder: Record<
      string,
      Record<string, Omit<ShaderControlSpec, "folder">>
    > = {};
    const root: Record<string, Omit<ShaderControlSpec, "folder">> = {};
    for (const k of keys) {
      const { folder: f, ...rest } = schema[k];
      if (f) (byFolder[f] ??= {})[k] = rest;
      else root[k] = rest;
    }
    const out: Record<
      string,
      ReturnType<typeof folder> | Omit<ShaderControlSpec, "folder">
    > = { ...root };
    for (const [name, fields] of Object.entries(byFolder)) {
      out[name] = folder(fields, { collapsed: true });
    }
    return out;
  }

  return {
    defaults,
    initialUniforms,
    createUniforms,
    sync,
    forwardToMaterial,
    buildControlsSchema
  };
}
