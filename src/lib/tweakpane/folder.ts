// src/lib/tweakpane/folder.ts
import type { Schema } from "./types";

const FOLDER_MARKER = Symbol("tweakpane.folder");

export type FolderNode<S extends Schema = Schema> = {
  [FOLDER_MARKER]: true;
  schema: S;
  opts: { collapsed?: boolean };
};

export function folder<S extends Schema>(
  schema: S,
  opts: { collapsed?: boolean } = {}
): FolderNode<S> {
  return { [FOLDER_MARKER]: true, schema, opts };
}

export function isFolder(value: unknown): value is FolderNode {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<symbol, unknown>)[FOLDER_MARKER] === true
  );
}
